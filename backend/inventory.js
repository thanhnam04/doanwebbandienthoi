const express = require('express');
const router = express.Router();
const db = require('./database');
const { authenticateToken, isAdmin } = require('./middleware');

// Import products (sử dụng full products)
const products = require('../data/products');

// API cập nhật stock sản phẩm (Admin only)
router.put('/products/:masp/stock', authenticateToken, isAdmin, (req, res) => {
  const { masp } = req.params;
  const { stock } = req.body;

  if (stock < 0) {
    return res.status(400).json({ error: 'Stock cannot be negative' });
  }

  // Tìm sản phẩm và cập nhật stock
  const productIndex = products.findIndex(p => p.masp === masp);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[productIndex].stock = stock;
  res.json({ 
    message: 'Stock updated successfully', 
    product: products[productIndex] 
  });
});

// API duyệt đơn hàng - giảm stock
router.post('/orders/:id/approve', authenticateToken, isAdmin, (req, res) => {
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
      let stockError = false;
      const stockUpdates = [];

      for (let item of items) {
        const product = products.find(p => p.masp === item.masp);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.masp} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}` 
          });
        }
        stockUpdates.push({ product, quantity: item.quantity });
      }

      // Cập nhật stock và status đơn hàng
      stockUpdates.forEach(update => {
        update.product.stock -= update.quantity;
      });

      db.run(`UPDATE orders SET status = 'approved' WHERE id = ?`, [orderId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to approve order' });
        }
        res.json({ 
          message: 'Order approved and stock updated', 
          orderId: orderId,
          stockUpdates: stockUpdates.map(u => ({
            product: u.product.name,
            newStock: u.product.stock
          }))
        });
      });
    });
  });
});

// API hủy đơn hàng - tăng stock
router.post('/orders/:id/cancel', authenticateToken, isAdmin, (req, res) => {
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
      
      // Chỉ hoàn trả stock nếu đơn hàng đã được approved
      if (order.status === 'approved') {
        items.forEach(item => {
          const product = products.find(p => p.masp === item.masp);
          if (product) {
            product.stock += item.quantity;
            stockUpdates.push({ product: product.name, restoredStock: item.quantity });
          }
        });
      }

      db.run(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [orderId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to cancel order' });
        }
        res.json({ 
          message: 'Order cancelled', 
          orderId: orderId,
          stockRestored: stockUpdates
        });
      });
    });
  });
});

// API lấy thông tin stock tất cả sản phẩm
router.get('/', authenticateToken, isAdmin, (req, res) => {
  const inventory = products.map(p => ({
    masp: p.masp,
    name: p.name,
    stock: p.stock,
    price: p.price
  }));
  res.json(inventory);
});

module.exports = router;