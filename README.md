# Cổng Thông Tin Điện Tử Tiểu Đoàn 15 - Sư Đoàn 324

Hệ thống quản lý thông tin nội bộ, giáo dục truyền thống và kiểm tra nhận thức chính trị tích hợp cơ sở dữ liệu SQLite cục bộ.

## 🚀 Hướng Dẫn Cài Đặt (Dành cho máy mới)

Để sử dụng hệ thống sau khi tải (git clone) về, đồng chí thực hiện theo các bước sau:

### 1. Cài đặt môi trường
Đảm bảo máy tính đã cài đặt **Node.js** (Phiên bản 18 trở lên).

### 2. Cài đặt thư viện (Dependencies)
Mở terminal (CMD hoặc PowerShell) tại thư mục dự án và chạy:
```bash
npm install
```

### 3. Khởi tạo Cơ sở dữ liệu (SQLite)
Hệ thống sử dụng SQLite giúp lưu trữ dữ liệu ngay trong thư mục dự án (file `prisma/dev.db`). Chạy lệnh sau để tạo cấu trúc bảng:
```bash
npx prisma db push
```

### 4. Chạy ứng dụng
Hệ thống gồm 2 phần cần chạy song song:

*   **Cửa sổ 1 - Chạy Backend (Xử lý dữ liệu):**
    ```bash
    npm run server
    ```
    *(Server sẽ chạy tại http://localhost:5000)*

*   **Cửa sổ 2 - Chạy Frontend (Giao diện):**
    ```bash
    npm run dev
    ```
    *(Giao diện sẽ chạy tại http://localhost:3000)*

---

## 🔐 Thông tin Đăng nhập mặc định

Sau khi chạy, đồng chí có thể đăng nhập bằng tài khoản Quản trị để bắt đầu nhập dữ liệu:

*   **Tài khoản Admin:** `admin@su324.vn`
*   **Mật khẩu:** `admin`

---

## 🛠 Các tính năng chính

1.  **Trang chủ:** Hiển thị bài viết, tin tức hoạt động của Tiểu đoàn.
2.  **Lịch sử (Đoàn Ngự Bình):** Xem lịch sử dưới dạng sách lật tương tác, có tích hợp bài thi sau mỗi chương.
3.  **Kiểm tra nhận thức:** Hệ thống thi trắc nghiệm trực tuyến, có bảng xếp hạng thi đua thời gian thực.
4.  **Thư viện:** Kho lưu trữ Video (Youtube/Upload) và Audio (Nhạc truyền thống).
5.  **Quản trị (Admin):**
    *   Soạn thảo bài viết với trình soạn thảo trực quan (như Word).
    *   Quản lý nhân sự, cấp bậc, chức vụ.
    *   Chấm điểm thi đua đại đội và xem biểu đồ thống kê.
    *   Quản lý kho tài liệu, văn bản (hỗ trợ tạo thư mục, kéo thả tệp).
    *   Cấu hình giao diện (Đổi logo, màu sắc, ảnh nền) ngay trên trình duyệt.

## 📂 Cấu trúc thư mục
*   `/prisma`: Chứa cấu hình database và file dữ liệu `dev.db`.
*   `/server.js`: Mã nguồn xử lý dữ liệu (Node.js).
*   `/src`: Mã nguồn giao diện (React + Vite).
*   `/services/api.ts`: Cầu nối giao tiếp giữa Giao diện và Database.

---
**Lưu ý:** Nếu đồng chí copy thư mục dự án sang máy khác, hãy copy cả file `prisma/dev.db` để giữ nguyên các dữ liệu đã nhập.