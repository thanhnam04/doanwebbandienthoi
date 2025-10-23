// Script to add stock field to all products
const fs = require('fs');
const path = require('path');

// Read products file
const productsPath = path.join(__dirname, '../data/products.js');
let content = fs.readFileSync(productsPath, 'utf8');

// Add stock field after rateCount for products that don't have it
let updatedContent = content;

// Replace patterns to add stock field
const patterns = [
  { search: /"rateCount": 0,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 0,\r\n    "stock": 30,\r\n    "promo":' },
  { search: /"rateCount": 188,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 188,\r\n    "stock": 45,\r\n    "promo":' },
  { search: /"rateCount": 7,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 7,\r\n    "stock": 20,\r\n    "promo":' },
  { search: /"rateCount": 10,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 10,\r\n    "stock": 15,\r\n    "promo":' },
  { search: /"rateCount": 16,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 16,\r\n    "stock": 35,\r\n    "promo":' },
  { search: /"rateCount": 104,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 104,\r\n    "stock": 25,\r\n    "promo":' },
  { search: /"rateCount": 80,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 80,\r\n    "stock": 40,\r\n    "promo":' },
  { search: /"rateCount": 87,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 87,\r\n    "stock": 50,\r\n    "promo":' },
  { search: /"rateCount": 372,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 372,\r\n    "stock": 30,\r\n    "promo":' },
  { search: /"rateCount": 347,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 347,\r\n    "stock": 25,\r\n    "promo":' },
  { search: /"rateCount": 4,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 4,\r\n    "stock": 12,\r\n    "promo":' },
  { search: /"rateCount": 22,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 22,\r\n    "stock": 18,\r\n    "promo":' },
  { search: /"rateCount": 54,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 54,\r\n    "stock": 35,\r\n    "promo":' },
  { search: /"rateCount": 9,\s*\r?\n\s*"promo":/g, replace: '"rateCount": 9,\r\n    "stock": 5,\r\n    "promo":' }
];

// Apply all patterns
patterns.forEach(pattern => {
  updatedContent = updatedContent.replace(pattern.search, pattern.replace);
});

// Add stock to remaining products with generic pattern
updatedContent = updatedContent.replace(/"rateCount": (\d+),\s*\r?\n(\s*)"promo":/g, (match, count, spaces) => {
  if (match.includes('"stock":')) return match; // Skip if already has stock
  const stock = Math.floor(Math.random() * 41) + 10; // Random 10-50
  return `"rateCount": ${count},\r\n${spaces}"stock": ${stock},\r\n${spaces}"promo":`;
});

// Write back to file
fs.writeFileSync(productsPath, updatedContent, 'utf8');
console.log('✅ Added stock to all products!');