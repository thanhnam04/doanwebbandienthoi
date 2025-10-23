const express = require('express');
const router = express.Router();
const db = require('./database');
const { authenticateToken, isAdmin } = require('./middleware');
const products = require('../data/products.js');

// API in hóa đơn PDF
router.get('/orders/:id/invoice', (req, res) => {
  const orderId = req.params.id;

  // Lấy thông tin đơn hàng
  db.get(`SELECT o.*, u.fullname, u.email, u.phone, u.address 
           FROM orders o 
           JOIN users u ON o.user_id = u.id 
           WHERE o.id = ?`, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Lấy items của đơn hàng
    db.all(`SELECT * FROM order_items WHERE order_id = ?`, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Tạo HTML cho hóa đơn
      const invoiceHTML = generateInvoiceHTML(order, items);
      
      res.setHeader('Content-Type', 'text/html');
      res.send(invoiceHTML);
    });
  });
});

// API lấy dữ liệu hóa đơn dạng JSON (để frontend tự tạo PDF)
router.get('/orders/:id/invoice-data', (req, res) => {
  const orderId = req.params.id;

  db.get(`SELECT o.*, u.fullname, u.email, u.phone, u.address 
           FROM orders o 
           JOIN users u ON o.user_id = u.id 
           WHERE o.id = ?`, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.all(`SELECT * FROM order_items WHERE order_id = ?`, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        order: order,
        items: items,
        invoiceDate: new Date().toLocaleDateString('vi-VN'),
        company: {
          name: 'NAPC Smartphone Store',
          address: '123 Đường ABC, Quận XYZ, TP.HCM',
          phone: '0123-456-789',
          email: 'info@napc.com'
        }
      });
    });
  });
});

function generateInvoiceHTML(order, items) {
  const invoiceDate = new Date().toLocaleDateString('vi-VN');
  const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN');
  
  let itemsHTML = '';
  let totalAmount = 0;
  
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    
    const product = products.find(p => p.masp === item.masp);
    const productName = product ? product.name : item.masp;
    
    itemsHTML += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.masp}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatPrice(item.price)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatPrice(itemTotal)}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hóa đơn #${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .total-row { font-weight: bold; background-color: #f5f5f5; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <h2>NAPC Smartphone Store</h2>
        <p>123 Đường ABC, Quận XYZ, TP.HCM | Tel: 0123-456-789</p>
      </div>

      <div class="company-info">
        <p><strong>Số hóa đơn:</strong> #${order.id}</p>
        <p><strong>Ngày lập:</strong> ${invoiceDate}</p>
        <p><strong>Ngày đặt hàng:</strong> ${orderDate}</p>
      </div>

      <div class="customer-info">
        <h3>Thông tin khách hàng:</h3>
        <p><strong>Họ tên:</strong> ${order.fullname || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
        <p><strong>Điện thoại:</strong> ${order.phone || 'N/A'}</p>
        <p><strong>Địa chỉ:</strong> ${order.address || 'N/A'}</p>
      </div>

      <table class="invoice-table">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ddd; padding: 10px;">STT</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Mã SP</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Tên sản phẩm</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Số lượng</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Đơn giá</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="5" style="border: 1px solid #ddd; padding: 10px; text-align: right;"><strong>TỔNG CỘNG:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right;"><strong>${formatPrice(order.total_amount)}</strong></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 50px;">
        <div style="float: left;">
          <p><strong>Người mua hàng</strong></p>
          <p style="margin-top: 60px;">${order.fullname || 'Khách hàng'}</p>
        </div>
        <div style="float: right;">
          <p><strong>Người bán hàng</strong></p>
          <p style="margin-top: 60px;">NAPC Store</p>
        </div>
        <div style="clear: both;"></div>
      </div>

      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">In hóa đơn</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">Đóng</button>
      </div>
    </body>
    </html>
  `;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

module.exports = router;