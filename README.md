# Cổng Thông Tin Điện Tử Tiểu Đoàn 15 - Sư Đoàn 324

![Tiểu đoàn 15 Banner](https://picsum.photos/1000/300?grayscale&blur=2)

Chào mừng đến với mã nguồn Cổng thông tin điện tử của Tiểu đoàn 15, Sư đoàn 324. Ứng dụng này được thiết kế nhằm mục đích tuyên truyền, giáo dục truyền thống, quản lý thông tin nội bộ và kiểm tra nhận thức chính trị cho cán bộ, chiến sĩ.

## 🌟 Tính Năng Chính

### 1. Trang Chủ (Home)
*   **Giao diện hiện đại:** Thiết kế Responsive, tương thích với cả máy tính và điện thoại.
*   **Tin tức hoạt động:** Hiển thị các bài viết, sự kiện mới nhất của đơn vị.
*   **Liên kết nhanh:** Truy cập nhanh các tính năng quan trọng.

### 2. Lịch sử Truyền thống (History)
*   **Hiệu ứng Đọc sách (Book Effect):** Trải nghiệm xem lịch sử hào hùng của đơn vị dưới dạng lật trang sách tương tác.
*   **Các mốc son lịch sử:** Trình bày chi tiết các giai đoạn từ khi thành lập đến nay.
*   **Chế độ ngang (Landscape):** Tối ưu hóa trải nghiệm đọc trên thiết bị di động.

### 3. Kiểm tra Nhận thức (Quiz)
*   **Thi trắc nghiệm:** Hệ thống câu hỏi về chính trị, quân sự, pháp luật.
*   **Bảng xếp hạng (Leaderboard):** Xếp hạng thi đua giữa các cá nhân và đơn vị.
*   **Bảo mật:** Chế độ ẩn đáp án sau khi thi để đảm bảo công bằng.

### 4. Thư viện (Media)
*   **Video & Âm thanh:** Kho lưu trữ phim tài liệu và các bài hát truyền thống.
*   **Trình phát đa phương tiện:** Tích hợp trình phát video và audio trực tiếp.

### 5. Quản trị Hệ thống (Admin Dashboard)
*   **Quản lý Nội dung:** Trình soạn thảo văn bản (Rich Text Editor) để đăng bài viết.
*   **Quản lý Nhân sự:** Thêm, sửa, xóa người dùng và phân quyền.
*   **Quản lý Thi đua:** Chấm điểm và theo dõi biểu đồ thi đua giữa các đại đội (Biểu đồ Recharts).
*   **Ngân hàng câu hỏi:** Nhập câu hỏi từ file Excel (.xlsx).
*   **Quản lý Tài liệu:** Hệ thống quản lý file và thư mục trực quan.

## 🛠 Công Nghệ Sử Dụng

Dự án được xây dựng dựa trên các công nghệ web hiện đại, không cần Backend phức tạp (sử dụng LocalStorage để giả lập cơ sở dữ liệu):

*   **Core:** [React 18](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Data Handling:** [SheetJS (XLSX)](https://sheetjs.com/)

## 🚀 Hướng Dẫn Cài Đặt & Chạy

Do cấu trúc dự án đơn giản (sử dụng ES Modules trực tiếp trên trình duyệt qua CDN), bạn có thể chạy dự án theo cách truyền thống hoặc dùng các công cụ build hiện đại.

### Yêu cầu
*   Node.js (v16 trở lên)

### Bước 1: Clone dự án
```bash
git clone https://github.com/your-repo/tieu-doan-15.git
cd tieu-doan-15
```

### Bước 2: Cài đặt Dependencies
```bash
npm install
```

### Bước 3: Chạy ứng dụng
```bash
npm start
# Hoặc nếu sử dụng Vite
npm run dev
```

Truy cập `http://localhost:3000` trên trình duyệt.

## 🔐 Tài Khoản Mặc Định

Dữ liệu được khởi tạo sẵn trong `LocalStorage` khi chạy lần đầu:

*   **Quản trị viên (Admin):**
    *   Email: `admin@su324.vn`
    *   Password: `admin`
*   **Người dùng (User):**
    *   Email: `user@su324.vn`
    *   Password: `123`

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/     # Các thành phần giao diện dùng chung (Layout, v.v.)
├── context/        # Quản lý trạng thái đăng nhập và điều hướng (AuthContext)
├── pages/          # Các trang chính (Home, History, Quiz, Admin...)
│   └── admin/      # Giao diện quản trị
├── services/       # Xử lý dữ liệu (StorageService)
├── types/          # Định nghĩa kiểu dữ liệu TypeScript
├── App.tsx         # Component gốc và Routing
└── index.tsx       # Điểm khởi chạy ứng dụng
```

## 📜 Giấy Phép

Dự án nội bộ phục vụ công tác giáo dục và tuyên truyền của đơn vị.

---
&copy; 2024 Tiểu đoàn 15 - Sư đoàn 324.
