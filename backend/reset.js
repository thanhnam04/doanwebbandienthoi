const express = require('express');
const router = express.Router();
const db = require('./database');
const { authenticateToken, isAdmin } = require('./middleware');

// API reset database - xóa tất cả orders và reset auto increment
router.post('/reset-orders', authenticateToken, isAdmin, (req, res) => {
  db.serialize(() => {
    // Xóa tất cả order items
    db.run('DELETE FROM order_items', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete order items' });
      }
    });
    
    // Xóa tất cả orders
    db.run('DELETE FROM orders', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete orders' });
      }
    });
    
    // Reset auto increment counter về 1
    db.run('DELETE FROM sqlite_sequence WHERE name = "orders"', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to reset auto increment' });
      }
    });
    
    db.run('DELETE FROM sqlite_sequence WHERE name = "order_items"', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to reset order items auto increment' });
      }
      
      res.json({ 
        message: 'Database reset successfully! Next order will start from ID 1',
        resetTables: ['orders', 'order_items'],
        nextOrderId: 1
      });
    });
  });
});

module.exports = router;