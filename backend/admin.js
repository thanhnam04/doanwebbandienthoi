const express = require('express');
const db = require('./database');
const products = require('../data/products.js');
const router = express.Router();

// Get all orders (admin) with optional date filtering
router.get('/orders', (req, res) => {
  const { from, to } = req.query;
  
  let query = `SELECT o.*, u.fullname, u.phone,
            GROUP_CONCAT(oi.masp || ':' || oi.quantity || ':' || oi.price) as items
     FROM orders o 
     JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id`;
  
  let params = [];
  
  if (from || to) {
    query += ' WHERE ';
    const conditions = [];
    
    if (from) {
      conditions.push('DATE(o.created_at) >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('DATE(o.created_at) <= ?');
      params.push(to);
    }
    
    query += conditions.join(' AND ');
  }
  
  query += ' GROUP BY o.id ORDER BY o.id ASC';
  
  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to get orders' });
    }
    res.json(orders);
  });
});

// Update order status
router.put('/orders/:orderId/status', (req, res) => {
  const { status } = req.body;
  
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.orderId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to update order' });
      }
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

// Get all users (admin)
router.get('/users', (req, res) => {
  db.all(
    'SELECT id, username, email, fullname, phone, address, role, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to get users' });
      }
      res.json(users);
    }
  );
});

// Delete user
router.delete('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Hoàn trả stock từ các đơn hàng đã duyệt trước khi xóa
  db.all(`SELECT oi.masp, oi.quantity 
          FROM order_items oi 
          JOIN orders o ON oi.order_id = o.id 
          WHERE o.user_id = ? AND (o.status = 'approved' OR o.status = 'delivered')`, [userId], (err, approvedItems) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to get user orders' });
    }
    
    // Hoàn trả stock
    let restoredItems = 0;
    const totalItems = approvedItems.length;
    
    if (totalItems === 0) {
      // Không có đơn đã duyệt, xóa trực tiếp
      deleteUserData();
    } else {
      // Hoàn trả stock cho từng item
      approvedItems.forEach(item => {
        db.run('UPDATE inventory SET stock = stock + ? WHERE masp = ?', 
               [item.quantity, item.masp], (err) => {
          if (!err) {
            console.log(`📦 Restored ${item.quantity} units of ${item.masp}`);
          }
          
          restoredItems++;
          if (restoredItems === totalItems) {
            deleteUserData();
          }
        });
      });
    }
    
    function deleteUserData() {
      // Delete user and cascade delete orders and order_items
      db.serialize(() => {
        db.run('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [userId]);
        db.run('DELETE FROM orders WHERE user_id = ?', [userId]);
        db.run(
          'DELETE FROM users WHERE id = ? AND role != "admin"',
          [userId],
          function(err) {
            if (err) {
              return res.status(400).json({ error: 'Failed to delete user' });
            }
            
            // Reset AUTO_INCREMENT if no orders left
            db.get('SELECT COUNT(*) as count FROM orders', (err, result) => {
              if (!err && result.count === 0) {
                db.run('DELETE FROM sqlite_sequence WHERE name="orders"');
                db.run('DELETE FROM sqlite_sequence WHERE name="order_items"');
                console.log('🔄 Reset AUTO_INCREMENT - Next order will be ID 1');
              }
            });
            
            // Clear cart from server memory  
            try {
              const serverModule = require('./server');
              if (serverModule.carts && serverModule.carts[userId]) {
                delete serverModule.carts[userId];
              }
            } catch (e) {
              console.log('Could not clear cart from memory:', e.message);
            }
            
            res.json({ 
              message: 'User deleted successfully',
              stockRestored: totalItems > 0 ? `Restored stock for ${totalItems} items` : 'No stock to restore'
            });
          }
        );
      });
    }
  });
});

// Get statistics
router.get('/stats', (req, res) => {
  console.log('Getting stats...');
  
  db.all(
    `SELECT 
       COUNT(DISTINCT o.id) as total_orders,
       SUM(o.total_amount) as total_revenue,
       COUNT(DISTINCT o.user_id) as total_customers
     FROM orders o
     WHERE o.status = 'delivered'`,
    (err, stats) => {
      if (err) {
        console.error('Stats query error:', err);
        return res.status(400).json({ error: 'Failed to get stats' });
      }
      
      console.log('Basic stats:', stats[0]);
      
      // Get company stats - only from completed orders
      db.all(
        `SELECT oi.masp, SUM(oi.quantity) as sold_count, SUM(oi.quantity * oi.price) as revenue
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.status = 'delivered'
         GROUP BY oi.masp`,
        (err, productStats) => {
          if (err) {
            console.error('Product stats query error:', err);
            return res.status(400).json({ error: 'Failed to get product stats' });
          }
          
          console.log('Product stats from DB:', productStats);
          
          // Calculate company stats
          const companyStats = {};
          productStats.forEach(stat => {
            const product = products.find(p => p.masp === stat.masp);
            if (product) {
              const company = product.company;
              if (!companyStats[company]) {
                companyStats[company] = { sold_count: 0, revenue: 0 };
              }
              companyStats[company].sold_count += stat.sold_count;
              
              // Sử dụng giá từ products.js thay vì từ database
              const productPrice = parseInt(product.price.replace(/\./g, ''));
              const revenue = stat.sold_count * productPrice;
              
              console.log(`Product: ${product.name}, Price: ${product.price} -> ${productPrice}, Sold: ${stat.sold_count}, Revenue: ${revenue}`);
              
              companyStats[company].revenue += revenue;
            }
          });
          
          console.log('Final company stats:', companyStats);
          
          res.json({
            ...stats[0],
            company_stats: companyStats
          });
        }
      );
    }
  );
});

module.exports = router;