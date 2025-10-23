const express = require('express');
const router = express.Router();
const db = require('./database');
const { authenticateToken, isAdmin } = require('./middleware');

// Import products (sử dụng full products)
const products = require('../data/products');

// API cập nhật stock sản phẩm
router.put('/products/:masp/stock', (req, res) => {
  const { masp } = req.params;
  const { stock } = req.body;

  if (stock < 0) {
    return res.status(400).json({ error: 'Stock cannot be negative' });
  }

  // Tìm sản phẩm
  const product = products.find(p => p.masp === masp);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Cập nhật stock trong database
  db.run('INSERT OR REPLACE INTO inventory (masp, stock) VALUES (?, ?)', 
         [masp, stock], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      message: 'Stock updated successfully', 
      masp: masp,
      stock: stock
    });
  });
});

// API duyệt đơn hàng - giảm stock
router.post('/orders/:id/approve', async (req, res) => {
  const orderId = req.params.id;

  // Lấy thông tin đơn hàng
  db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status === 'approved') {
      return res.status(400).json({ error: 'Order already approved' });
    }

    // Lấy items của đơn hàng
    db.all(`SELECT * FROM order_items WHERE order_id = ?`, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Kiểm tra và giảm stock
      const stockUpdates = [];
      let processedItems = 0;
      
      // Xử lý từng item
      items.forEach(item => {
        const product = products.find(p => p.masp === item.masp);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.masp} not found` });
        }
        
        // Lấy stock hiện tại
        db.get('SELECT stock FROM inventory WHERE masp = ?', [item.masp], (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          const currentStock = row ? row.stock : 25;
          
          if (currentStock < item.quantity) {
            return res.status(400).json({ 
              error: `Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${item.quantity}` 
            });
          }
          
          const newStock = currentStock - item.quantity;
          
          // Cập nhật stock
          db.run('INSERT OR REPLACE INTO inventory (masp, stock) VALUES (?, ?)', [item.masp, newStock], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update stock' });
            }
            
            stockUpdates.push({
              product: product.name,
              masp: item.masp,
              quantity: item.quantity,
              newStock: newStock
            });
            
            processedItems++;
            
            // Nếu đã xử lý hết items
            if (processedItems === items.length) {
              // Cập nhật status đơn hàng
              db.run(`UPDATE orders SET status = 'approved' WHERE id = ?`, [orderId], (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to approve order' });
                }
                res.json({ 
                  message: 'Order approved and stock updated', 
                  orderId: orderId,
                  stockUpdates: stockUpdates
                });
              });
            }
          });
        });
      });
    });
  });
});

// API hủy đơn hàng - tăng stock
router.post('/orders/:id/cancel', (req, res) => {
  const orderId = req.params.id;

  db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    // Lấy items và hoàn trả stock nếu đơn hàng đã approved
    db.all(`SELECT * FROM order_items WHERE order_id = ?`, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const stockUpdates = [];
      
      let processedItems = 0;
      
      // Chỉ hoàn trả stock nếu đơn hàng đã được approved
      if (order.status === 'approved') {
        items.forEach(item => {
          const product = products.find(p => p.masp === item.masp);
          if (product) {
            // Lấy stock hiện tại từ database
            db.get('SELECT stock FROM inventory WHERE masp = ?', [item.masp], (err, row) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              
              const currentStock = row ? row.stock : 25;
              const newStock = currentStock + item.quantity;
              
              // Cập nhật stock trong database
              db.run('INSERT OR REPLACE INTO inventory (masp, stock) VALUES (?, ?)', [item.masp, newStock], (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to restore stock' });
                }
                
                stockUpdates.push({ product: product.name, restoredStock: item.quantity, newStock: newStock });
                processedItems++;
                
                // Nếu đã xử lý hết items
                if (processedItems === items.length) {
                  // Cập nhật status đơn hàng
                  db.run(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [orderId], (err) => {
                    if (err) {
                      return res.status(500).json({ error: 'Failed to cancel order' });
                    }
                    res.json({ 
                      message: 'Order cancelled and stock restored', 
                      orderId: orderId,
                      stockRestored: stockUpdates
                    });
                  });
                }
              });
            });
          }
        });
      } else {
        // Nếu chưa approved thì chỉ cập nhật status
        db.run(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [orderId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to cancel order' });
          }
          res.json({ 
            message: 'Order cancelled', 
            orderId: orderId,
            stockRestored: []
          });
        });
      }


    });
  });
});

// API lấy thông tin stock tất cả sản phẩm
router.get('/', (req, res) => {
  db.all('SELECT * FROM inventory', (err, stocks) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const inventory = products.map(p => {
      const stockData = stocks.find(s => s.masp === p.masp);
      return {
        masp: p.masp,
        name: p.name,
        stock: stockData ? stockData.stock : 25,
        price: p.price
      };
    });
    
    res.json(inventory);
  });
});

// API thêm stock mặc định cho tất cả sản phẩm
router.post('/init-stock', (req, res) => {
  let updated = 0;
  products.forEach(product => {
    if (!product.stock) {
      product.stock = 25;
      updated++;
    }
  });
  res.json({ message: `Updated stock for ${updated} products`, total: products.length });
});

module.exports = router;