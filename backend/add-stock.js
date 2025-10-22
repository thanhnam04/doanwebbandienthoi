const fs = require('fs');
const path = require('path');

// Read the products file
const productsPath = path.join(__dirname, '../data/products.js');
let content = fs.readFileSync(productsPath, 'utf8');

// Add stock field to all products that don't have it
// Generate random stock between 10-50 for each product
const addStockToProducts = (content) => {
  // Find all product objects and add stock if missing
  return content.replace(/"rateCount":\s*(\d+),(?!\s*"stock":)/g, (match, rateCount) => {
    const stock = Math.floor(Math.random() * 41) + 10; // Random 10-50
    return `"rateCount": ${rateCount},\r\n    "stock": ${stock},`;
  });
};

// Apply the transformation
const updatedContent = addStockToProducts(content);

// Write back to file
fs.writeFileSync(productsPath, updatedContent, 'utf8');

console.log('✅ Added stock field to all products successfully!');