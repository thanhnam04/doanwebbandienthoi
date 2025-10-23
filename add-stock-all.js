const fs = require('fs');
const path = require('path');

// Đọc file products.js
const productsPath = path.join(__dirname, 'data', 'products.js');
let content = fs.readFileSync(productsPath, 'utf8');

// Thêm stock: 25 cho tất cả sản phẩm chưa có stock
content = content.replace(/"rateCount": (\d+),(?!\s*"stock":)/g, '"rateCount": $1,\n    "stock": 25,');

// Ghi lại file
fs.writeFileSync(productsPath, content, 'utf8');

console.log('✅ Đã thêm stock: 25 cho tất cả sản phẩm!');