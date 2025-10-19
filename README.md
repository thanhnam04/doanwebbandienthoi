# 📱 NAPC Smartphone Store

> Đồ án môn **Phân tích thiết kế hệ thống thông tin** - Trang web bán điện thoại với kiến trúc Frontend-Backend hoàn chỉnh

## 🚀 Tổng quan

Hệ thống e-commerce bán điện thoại với giao diện thân thiện, chức năng đầy đủ và kiến trúc hiện đại:
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Authentication**: JWT tokens
- **API**: RESTful APIs

## ⚡ Cài đặt và Chạy

### 1. Yêu cầu hệ thống
- Node.js >= 14.0.0
- npm >= 6.0.0

### 2. Cài đặt Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Khởi tạo database
npm run init-db

# Chạy server (Development)
npm run dev

# Hoặc chạy Production
npm start
```

### 3. Chạy Frontend
```bash
# Mở file index.html bằng Live Server
# Hoặc serve static files:
python -m http.server 8080
# Truy cập: http://localhost:8080
```

### 4. Truy cập ứng dụng
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:8080/admin.html

## 🏗️ Kiến trúc hệ thống

### Frontend Structure
```
├── index.html              # Trang chủ
├── admin.html              # Trang quản trị
├── giohang.html           # Giỏ hàng
├── nguoidung.html         # Trang người dùng
├── chitietsanpham.html    # Chi tiết sản phẩm
├── css/                   # Stylesheets
├── js/                    # JavaScript modules
│   ├── api.js            # API client
│   ├── admin.js          # Admin functions
│   ├── dungchung.js      # Common utilities
│   ├── trangchu.js       # Homepage logic
│   ├── giohang.js        # Cart functionality
│   ├── nguoidung.js      # User profile
│   ├── chitietsanpham.js # Product details
│   ├── classes.js        # Object classes
│   └── lienhe.js         # Contact page
├── img/                   # Images & assets
└── data/
    └── products.js        # Product data
```

### Backend Structure
```
backend/
├── server.js              # Main server file
├── database.js            # Database connection
├── middleware.js          # Auth middleware
├── auth.js               # Authentication routes
├── orders.js             # Order management
├── admin.js              # Admin routes
├── package.json          # Dependencies
└── database.db           # SQLite database
```

## 🔧 Chức năng chính

### 👤 User Features
-  **Đăng ký/Đăng nhập** với JWT authentication
-  **Trang chủ** với sản phẩm phân loại (nổi bật, mới, khuyến mãi)
-  **Tìm kiếm/Lọc** sản phẩm theo hãng, giá, đánh giá
-  **Chi tiết sản phẩm** với gợi ý sản phẩm tương tự
-  **Giỏ hàng** với CRUD operations
-  **Thanh toán** và tạo đơn hàng
-  **Trang cá nhân** với lịch sử mua hàng
-  **Cập nhật thông tin** cá nhân

### 🛠️ Admin Features
-  **Dashboard** với thống kê doanh thu (Chart.js)
-  **Quản lý sản phẩm** (CRUD) với upload ảnh
-  **Quản lý đơn hàng** với cập nhật trạng thái
-  **Quản lý khách hàng** với khóa/mở tài khoản
-  **Báo cáo** doanh thu theo hãng

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register     # Đăng ký
POST /api/auth/login        # Đăng nhập
GET  /api/auth/profile/:id  # Lấy thông tin user
PUT  /api/auth/profile/:id  # Cập nhật thông tin
```

### Products
```
GET  /api/products          # Lấy tất cả sản phẩm
GET  /api/products/:id      # Lấy sản phẩm theo ID
POST /api/admin/products    # Thêm sản phẩm (Admin)
PUT  /api/admin/products/:id # Sửa sản phẩm (Admin)
DELETE /api/admin/products/:id # Xóa sản phẩm (Admin)
```

### Cart & Orders
```
GET  /api/cart/:userId      # Lấy giỏ hàng
POST /api/cart/add          # Thêm vào giỏ
PUT  /api/cart/update       # Cập nhật giỏ hàng
DELETE /api/cart/remove     # Xóa khỏi giỏ
POST /api/orders            # Tạo đơn hàng
GET  /api/orders/user/:id   # Lịch sử đơn hàng
```

### Admin
```
GET  /api/admin/stats       # Thống kê doanh thu
GET  /api/admin/orders      # Tất cả đơn hàng
GET  /api/admin/users       # Tất cả khách hàng
PUT  /api/admin/orders/:id/status # Cập nhật trạng thái
DELETE /api/admin/users/:id # Xóa khách hàng
```

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders & Order Items
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    masp TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id)
);
```

## 🔐 Authentication Flow

1. **Đăng ký**: `POST /api/auth/register` → Tạo user mới
2. **Đăng nhập**: `POST /api/auth/login` → Trả về JWT token
3. **Lưu token**: Frontend lưu vào localStorage
4. **Gửi requests**: Attach token vào Authorization header
5. **Middleware**: Backend verify token cho protected routes

## 🛡️ Security Features

-  **JWT Authentication** cho session management
-  **Password hashing** với bcrypt
-  **Input validation** và sanitization
-  **CORS** configuration
-  **SQL injection** protection với prepared statements
-  **XSS protection** với input encoding

## 📊 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design, Flexbox, Grid
- **JavaScript ES6+** - Async/await, Modules, Classes
- **Chart.js** - Data visualization
- **Font Awesome** - Icons
- **Owl Carousel** - Image sliders

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin requests

## 🔧 Development

### Code Structure
- **Modular JavaScript** - Tách biệt concerns
- **API-first approach** - Frontend hoàn toàn dựa vào API
- **RESTful design** - Consistent API endpoints
- **Error handling** - Comprehensive error management
- **Responsive design** - Mobile-friendly UI

### Best Practices
-  **Separation of concerns** - Frontend/Backend tách biệt
-  **API consistency** - Chuẩn RESTful
-  **Error handling** - User-friendly messages
-  **Security first** - Authentication & validation
-  **Performance** - Optimized queries & caching

## 🎯 Admin Account

**Username**: `admini`  
**Password**: `adadad`

## 🚦 Trạng thái dự án

-  **Frontend-Backend Integration** - Hoàn thành
-  **Authentication System** - JWT tokens
-  **CRUD Operations** - Products, Orders, Users
-  **Admin Dashboard** - Statistics & Management
-  **Shopping Cart** - Full functionality
-  **Order Management** - Complete workflow
-  **Responsive Design** - Mobile-friendly
-  **Error Handling** - User-friendly messages
-  **Security** - Input validation & protection

## 🐛 Troubleshooting

### Backend không khởi động
```bash
# Kiểm tra port 3000 có bị chiếm không
netstat -ano | findstr :3000

# Thay đổi port trong server.js nếu cần
const PORT = process.env.PORT || 3001;
```

### Database lỗi
```bash
# Xóa database cũ và tạo lại
rm backend/database.db
npm run init-db
```

### CORS errors
- Đảm bảo backend đang chạy trên port 3000
- Kiểm tra CORS configuration trong server.js

## 📝 Changelog

### v2.0.0 (Latest)
-  Hoàn thành tích hợp Frontend-Backend
-  Loại bỏ localStorage fallbacks
-  Thêm JWT authentication
-  API-driven architecture
-  Responsive admin dashboard
-  Real-time statistics

### v1.0.0
-  Static website với localStorage
-  Basic CRUD operations
-  Simple authentication

## 👥 Contributors

**Nhóm tứ đại chiến tướng**
- Trần Đức Anh
- Phạm Kim Chung  
- Nguyễn Thành Nam
- Bùi Tấn Phát

---

**🎉 Dự án hoàn thành với kiến trúc Frontend-Backend hiện đại, sẵn sàng cho production!**

## 📸 Screenshots

### 🛍️ User Interface

| Feature | Screenshot |
|---------|------------|
| **Trang chủ** | ![Trang chủ](./screenshots/Screenshot_1a.png) |
| **Danh sách sản phẩm** | ![Sản phẩm](./screenshots/Screenshot_2a.png) |
| **Chi tiết sản phẩm** | ![Chi tiết](./screenshots/Screenshot_3a.png) |
| **Đăng nhập** | ![Đăng nhập](./screenshots/Screenshot_4.png) |
| **Đăng ký** | ![Đăng ký](./screenshots/Screenshot_5.png) |
| **Trang cá nhân** | ![Người dùng](./screenshots/Screenshot_6a.png) |
| **Giỏ hàng** | ![Giỏ hàng](./screenshots/Screenshot_7a.png) |
| **Tìm kiếm & Lọc** | ![Tìm kiếm](./screenshots/Screenshot_8a.png) |

### 🛠️ Admin Dashboard

| Feature | Screenshot |
|---------|------------|
| **Thống kê doanh thu** | ![Thống kê](./screenshots/Screenshot_9a.png) |
| **Quản lý sản phẩm** | ![Sản phẩm](./screenshots/Screenshot_10a.png) |
| **Quản lý đơn hàng** | ![Đơn hàng](./screenshots/Screenshot_11a.png) |
| **Quản lý khách hàng** | ![Khách hàng](./screenshots/Screenshot_12a.png) |
