const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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

// Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
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

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
