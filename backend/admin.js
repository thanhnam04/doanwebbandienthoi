const express = require('express');
const db = require('./database');
const products = require('../data/products.js');
const router = express.Router();

// Get all orders (admin)
router.get('/orders', (req, res) => {
  db.all(
    `SELECT o.*, u.fullname, u.phone,
            GROUP_CONCAT(oi.masp || ':' || oi.quantity || ':' || oi.price) as items
     FROM orders o 
     JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id 
     GROUP BY o.id 
     ORDER BY o.created_at DESC`,
    (err, orders) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to get orders' });
      }
      res.json(orders);
    }
  );
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
  db.run(
    'DELETE FROM users WHERE id = ? AND role != "admin"',
    [req.params.userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to delete user' });
      }
      res.json({ message: 'User deleted successfully' });
    }
  );
});

// Get statistics
router.get('/stats', (req, res) => {
  db.all(
    `SELECT 
       COUNT(DISTINCT o.id) as total_orders,
       SUM(o.total_amount) as total_revenue,
       COUNT(DISTINCT o.user_id) as total_customers
     FROM orders o`,
    (err, stats) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to get stats' });
      }
      
      // Get company stats
      db.all(
        `SELECT oi.masp, SUM(oi.quantity) as sold_count, SUM(oi.quantity * oi.price) as revenue
         FROM order_items oi
         GROUP BY oi.masp`,
        (err, productStats) => {
          if (err) {
            return res.status(400).json({ error: 'Failed to get product stats' });
          }
          
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
              companyStats[company].revenue += stat.revenue;
            }
          });
          
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