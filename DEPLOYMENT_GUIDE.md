# Hướng dẫn triển khai Tiểu đoàn 15 Portal trên InfinityFree

## Tổng quan
InfinityFree chỉ hỗ trợ PHP/MySQL, không hỗ trợ Node.js. Guide này sẽ giúp bạn chuyển đổi dự án từ Node.js/Express sang PHP/MySQL.

## Các bước chuẩn bị

### 1. Tạo tài khoản InfinityFree
1. Truy cập [InfinityFree](https://infinityfree.net/)
2. Đăng ký tài khoản miễn phí
3. Tạo website mới với tên miền phụ (subdomain)

### 2. Cấu hình MySQL Database
1. Trong dashboard InfinityFree, vào "MySQL Databases"
2. Tạo database mới với tên: `tieudoan15db`
3. Ghi lại thông tin kết nối:
   - Host: Thường là `sql311.infinityfree.com` (hoặc tương tự)
   - Username: `if0_xxxxxxxx`
   - Password: Mật khẩu bạn đặt
   - Database: `if0_xxxxxxxx_tieudoan15db`

### 3. Cập nhật cấu hình PHP
Mở file `api/config.php` và cập nhật thông tin database:

```php
define('DB_HOST', 'sql311.infinityfree.com'); // Thay bằng host của bạn
define('DB_USER', 'if0_38341624'); // Thay bằng username của bạn
define('DB_PASS', 'your_password_here'); // Thay bằng password của bạn
define('DB_NAME', 'if0_38341624_tieudoan15db'); // Thay bằng database name của bạn
```

## Các bước triển khai

### 1. Upload file lên InfinityFree
Sử dụng FTP client (FileZilla) hoặc File Manager của InfinityFree để upload:

```
📁 public_html/
├── api/
│   ├── config.php
│   ├── index.php
│   └── .htaccess
├── assets/ (nếu có)
├── index.html
├── main.js (build từ React)
└── các file tĩnh khác
```

### 2. Import database
1. Vào phpMyAdmin trong dashboard InfinityFree
2. Chọn database của bạn
3. Import file `database.sql` để tạo các bảng
4. Chạy thêm file `migrations/add_read_history_table.sql` để tạo bảng read_history

### 3. Build frontend React
Chạy lệnh để build production version:

```bash
npm run build
```

Copy các file trong thư mục `dist` lên hosting.

### 4. Cấu hình frontend để sử dụng PHP API
Trong file `services/api.ts`, thay đổi import:

```typescript
// Thay thế
import { apiClient } from './api';
// Bằng
import { apiClientPHP } from './api_php';
```

Hoặc tạo file config để switch giữa development và production:

```typescript
// config.ts
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production: dùng PHP API
  : 'http://localhost:8080/api'; // Development: dùng Node.js API

export const apiClient = process.env.NODE_ENV === 'production'
  ? apiClientPHP
  : apiClient;
```

## Cấu trúc file trên hosting

```
public_html/
├── .htaccess (cho rewrite rules)
├── api/
│   ├── config.php
│   ├── index.php
│   └── .htaccess
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── index.html
└── (các file build khác)
```

## Kiểm tra hoạt động

### 1. Test API endpoints
Mở trình duyệt và truy cập:
- `https://your-domain.infinityfreeapp.com/api/articles` - nên trả về danh sách bài viết
- `https://your-domain.infinityfreeapp/api/settings` - nên trả về cấu hình

### 2. Test frontend
Truy cập `https://your-domain.infinityfreeapp.com` và kiểm tra các chức năng:
- Đăng nhập
- Xem bài viết
- Lịch sử
- Quiz

## Trouleshooting

### 1. Lỗi 500 Internal Server Error
- Kiểm tra log lỗi trong cPanel InfinityFree
- Đảm bảo file PHP có đúng permissions (644)
- Kiểm tra syntax PHP

### 2. Lỗi kết nối database
- Xác nhận thông tin kết nối đúng
- Kiểm tra database đã được tạo chưa
- Đảm bảo user có quyền truy cập database

### 3. CORS errors
- File `.htaccess` trong thư mục `api/` đã có các headers CORS
- Kiểm tra frontend gọi đúng URL

### 4. Upload file size quá lớn
- InfinityFree có giới hạn upload file, có thể cần nén hình ảnh
- Kiểm tra `upload_max_filesize` và `post_max_size` trong `.htaccess`

## Tối ưu hóa

### 1. Caching
- PHP API đã có caching 5 phút cho các endpoint thường dùng
- Có thể tăng thời gian cache nếu cần

### 2. Image optimization
- Nén ảnh trước khi upload
- Sử dụng WebP format nếu có thể

### 3. Database optimization
- Thêm indexes cho các trường thường query
- Clean up dữ liệu cũ định kỳ

## Backup và maintenance

### 1. Backup database
- Sử dụng phpMyAdmin để export database định kỳ
- Lưu file backup ở nơi an toàn

### 2. Backup files
- Download toàn bộ source code định kỳ
- Giữ nhiều phiên bản backup

### 3. Monitoring
- Kiểm tra log errors thường xuyên
- Monitor disk space usage

## Lưu ý quan trọng

1. **Security**: Luôn cập nhật mật khẩu database mạnh
2. **Performance**: InfinityFree là hosting miễn phí, có thể chậm hơn hosting trả phí
3. **Limitations**: Có giới hạn về bandwidth, storage, và concurrent connections
4. **SSL**: InfinityFree cung cấp SSL miễn phí, nên enable cho security

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra [Documentation InfinityFree](https://infinityfree.com/support/)
2. Tìm kiếm trên các forum về PHP hosting
3. Liên hệ support của InfinityFree

Chúc bạn triển khai thành công!
