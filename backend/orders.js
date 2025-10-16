const express = require('express');
const db = require('./database');
const router = express.Router();

// Create order
router.post('/', (req, res) => {
  const { userId, items, totalAmount } = req.body;
  
  db.run(
    'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
    [userId, totalAmount],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to create order' });
      }
      
      const orderId = this.lastID;
      
      // Insert order items
      const stmt = db.prepare('INSERT INTO order_items (order_id, masp, quantity, price) VALUES (?, ?, ?, ?)');
      items.forEach(item => {
        stmt.run([orderId, item.masp, item.quantity, item.price]);
      });
      stmt.finalize();
      
      res.json({ message: 'Order created successfully', orderId });
    }
  );
});

// Get user orders
router.get('/user/:userId', (req, res) => {
  db.all(
    `SELECT o.*, GROUP_CONCAT(oi.masp || ':' || oi.quantity || ':' || oi.price) as items
     FROM orders o 
     LEFT JOIN order_items oi ON o.id = oi.order_id 
     WHERE o.user_id = ? 
     GROUP BY o.id 
     ORDER BY o.created_at DESC`,
    [req.params.userId],
    (err, orders) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to get orders' });
      }
      res.json(orders);
    }
  );
});

// Get order details
router.get('/:orderId', (req, res) => {
  db.get(
    `SELECT o.*, u.fullname, u.phone, u.address,
            GROUP_CONCAT(oi.masp || ':' || oi.quantity || ':' || oi.price) as items
     FROM orders o 
     JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id 
     WHERE o.id = ?
     GROUP BY o.id`,
    [req.params.orderId],
    (err, order) => {
      if (err || !order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    }
  );
});

module.exports = router;