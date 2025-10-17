const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./auth');
const orderRoutes = require('./orders');
const adminRoutes = require('./admin');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import product data
const products = require('../data/products.js');

// In-memory cart storage (in production, use database)
let carts = {};

// Export carts for admin access
module.exports.carts = carts;

// Routes

// Get all products with optional search and filters
app.get('/api/products', (req, res) => {
  let result = [...products];
  
  // Search by name or company
  if (req.query.search) {
    const query = req.query.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.company.toLowerCase().includes(query)
    );
  }
  
  // Filter by company
  if (req.query.company) {
    result = result.filter(p =>
      p.company.toLowerCase() === req.query.company.toLowerCase()
    );
  }
  
  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || Infinity;
    result = result.filter(p => {
      const price = parseInt(p.price.replace(/\./g, ''));
      return price >= minPrice && price <= maxPrice;
    });
  }
  
  // Filter by star rating
  if (req.query.star) {
    const minStar = parseInt(req.query.star);
    result = result.filter(p => p.star >= minStar);
  }
  
  res.json(result);
});

// Get product by masp
app.get('/api/products/:masp', (req, res) => {
  const product = products.find(p => p.masp === req.params.masp);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Get products by company
app.get('/api/products/company/:company', (req, res) => {
  const companyProducts = products.filter(p =>
    p.company.toLowerCase() === req.params.company.toLowerCase()
  );
  res.json(companyProducts);
});

// Search products
app.get('/api/products/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const searchResults = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.company.toLowerCase().includes(query)
  );
  res.json(searchResults);
});

// Cart routes
app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!carts[userId]) {
    carts[userId] = [];
  }
  res.json(carts[userId]);
});

app.post('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const { masp, quantity } = req.body;

  if (!carts[userId]) {
    carts[userId] = [];
  }

  const product = products.find(p => p.masp === masp);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existingItem = carts[userId].find(item => item.masp === masp);
  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    carts[userId].push({
      masp,
      name: product.name,
      price: product.price,
      img: product.img,
      quantity: quantity || 1
    });
  }

  res.json(carts[userId]);
});

app.put('/api/cart/:userId/:masp', (req, res) => {
  const { userId, masp } = req.params;
  const { quantity } = req.body;

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const item = carts[userId].find(item => item.masp === masp);
  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  item.quantity = quantity;
  res.json(carts[userId]);
});

app.delete('/api/cart/:userId/:masp', (req, res) => {
  const { userId, masp } = req.params;

  if (!carts[userId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  carts[userId] = carts[userId].filter(item => item.masp !== masp);
  res.json(carts[userId]);
});

app.delete('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  carts[userId] = [];
  res.json(carts[userId]);
});

// Admin product routes
app.post('/api/admin/products', (req, res) => {
  const newProduct = req.body;
  // Add to products array (in production, save to database)
  products.push(newProduct);
  res.json({ message: 'Product added successfully', product: newProduct });
});

app.put('/api/admin/products/:masp', (req, res) => {
  const { masp } = req.params;
  const updatedProduct = req.body;
  
  const index = products.findIndex(p => p.masp === masp);
  if (index !== -1) {
    products[index] = updatedProduct;
    res.json({ message: 'Product updated successfully' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/admin/products/:masp', (req, res) => {
  const { masp } = req.params;
  
  const index = products.findIndex(p => p.masp === masp);
  if (index !== -1) {
    products.splice(index, 1);
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
module.exports.carts = carts;
