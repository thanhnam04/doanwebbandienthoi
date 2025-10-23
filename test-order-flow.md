# Test Order Flow

## Flow mới đã sửa:

1. **Khách hàng đặt hàng** → Status: `pending` (Chờ xử lý)
2. **Admin bấm "Duyệt"** → Status: `approved` (Đã duyệt - Chờ giao hàng)  
3. **Admin bấm "Giao hàng"** → Status: `delivered` (Đã giao hàng)

## Hoặc:
1. **Khách hàng đặt hàng** → Status: `pending` (Chờ xử lý)
2. **Admin bấm "Hủy"** → Status: `cancelled` (Đã hủy)

## Các thay đổi đã thực hiện:

### 1. Frontend Admin (admin.js):
- Sửa `mapOrderStatus()` để map đúng trạng thái
- Sửa logic hiển thị nút:
  - Nút "Duyệt" chỉ hiện khi status = "Chờ xử lý"
  - Nút "Giao hàng" chỉ hiện khi status = "Đã duyệt - Chờ giao hàng"
  - Nút "Hủy" hiện khi chưa giao hàng và chưa hủy

### 2. Frontend User (nguoidung.js):
- Thêm `mapOrderStatusForUser()` để hiển thị trạng thái tiếng Việt
- Cập nhật hiển thị trạng thái trong bảng đơn hàng

### 3. API (api.js):
- Sửa port từ 3001 về 3000 để phù hợp README

## Test Cases:

### Test 1: Đặt hàng mới
- Khách hàng đặt hàng → Kiểm tra status = "Chờ xử lý"

### Test 2: Admin duyệt đơn
- Admin bấm "Duyệt" → Status chuyển thành "Đã duyệt - Chờ giao hàng"
- Nút "Duyệt" biến mất, nút "Giao hàng" xuất hiện

### Test 3: Admin giao hàng
- Admin bấm "Giao hàng" → Status chuyển thành "Đã giao hàng"  
- Tất cả nút action biến mất (chỉ còn "In hóa đơn")

### Test 4: Admin hủy đơn
- Admin bấm "Hủy" → Status chuyển thành "Đã hủy"
- Tất cả nút action biến mất

### Test 5: Hiển thị ở trang khách hàng
- Kiểm tra trạng thái hiển thị đúng tiếng Việt
- Kiểm tra flow: Chờ xử lý → Đã duyệt - Chờ giao hàng → Đã giao hàng