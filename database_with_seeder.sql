-- Database with Seeder Data for InfinityFree
-- KHÔNG CÓ CREATE DATABASE - SẴN SÀNG IMPORT

-- 1. Bảng Users (Cán bộ, chiến sĩ)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rank_name VARCHAR(50), 
    position VARCHAR(100),
    unit VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Articles (Bài viết)
CREATE TABLE articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content LONGTEXT,
    image_url LONGTEXT,
    date DATE,
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Categories (Danh mục)
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Media (File media)
CREATE TABLE media (
    id VARCHAR(50) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INT,
    upload_path VARCHAR(500),
    uploaded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Settings (Cấu hình hệ thống)
CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Activity Logs (Nhật ký hoạt động)
CREATE TABLE activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Sessions (Phiên đăng nhập)
CREATE TABLE sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SEEDER DATA ====================

-- Insert Categories
INSERT INTO categories (id, name, description) VALUES
('cat_1', 'Tin tức', 'Các tin tức và thông báo quan trọng'),
('cat_2', 'Sự kiện', 'Các sự kiện hoạt động của đơn vị'),
('cat_3', 'Đào tạo', 'Thông tin về đào tạo và huấn luyện'),
('cat_4', 'Khen thưởng', 'Quyết định khen thưởng và vinh danh'),
('cat_5', 'Chỉ thị', 'Các chỉ thị và hướng dẫn');

-- Insert Users (Admin + Users mẫu)
-- Password: admin123 (hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO users (id, name, email, rank_name, position, unit, password, role) VALUES
('user_admin', 'Trần Công Hùng', 'admin@tieudoan15.local', 'Đại úy', 'Chỉ huy trưởng', 'Tiểu Đoàn 15', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user_1', 'Nguyễn Văn An', 'an.nv@tieudoan15.local', 'Thiếu úy', 'Trung đội trưởng', 'Trung đội 1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('user_2', 'Lê Thị Bình', 'binh.lt@tieudoan15.local', 'Trung úy', 'Chính trị viên', 'Trung đội 2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('user_3', 'Phạm Văn Cường', 'cuong.pv@tieudoan15.local', 'Thượng úy', 'Hậu cần', 'Tiểu Đoàn 15', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert Articles (Dữ liệu mẫu)
INSERT INTO articles (id, title, summary, content, image_url, date, author) VALUES
('art_1', 
'Lễ Khai Giảng Lớp Bồi Dưỡng Chỉ Huy Phó', 
'Tiểu Đoàn 15 long trọng tổ chức lễ khai giảng lớp bồi dưỡng chỉ huy phó kỳ I năm 2025.',
'<h2>Lễ Khai Giảng Lớp Bồi Dưỡng Chỉ Huy Phó</h2>
<p>Sáng ngày 28/01/2025, tại hội trường Tiểu Đoàn 15, đã diễn ra lễ khai giảng lớp bồi dưỡng chỉ huy phó kỳ I năm 2025. Tham dự buổi lễ có đồng chí Đại úy Trần Công Hùng, Chỉ huy trưởng Tiểu Đoàn 15.</p>
<p>Phát biểu khai mạc, đồng chí Chỉ huy trưởng nhấn mạnh tầm quan trọng của việc bồi dưỡng kiến thức, kỹ năng cho đội ngũ chỉ huy phó, góp phần nâng cao năng lực lãnh đạo, chỉ huy trong tình hình mới.</p>
<p>Lớp học kéo dài 8 tuần với 25 học viên là các đồng chí chỉ huy phó các trung đội. Nội dung bồi dưỡng bao gồm: kiến thức quân sự, kỹ năng chỉ huy, công tác Đảng, công tác chính trị...</p>
<p><strong>Thời gian:</strong> 28/01/2025 - 25/03/2025<br>
<strong>Địa điểm:</strong> Hội trường Tiểu Đoàn 15<br>
<strong>Sĩ số:</strong> 25 học viên</p>',
'/assets/images/khai-giang-2025.jpg', 
'2025-01-28', 
'Trần Công Hùng'),

('art_2',
'Chỉ Thị Về Việc Tăng Cường An Ninh Giao Thông',
'Tiểu Đoàn 15 ban hành chỉ thị tăng cường đảm bảo an toàn giao thông trong đơn vị.',
'<h2>Chỉ Thị Về An Ninh Giao Thông</h2>
<p>Căn cứ tình hình thực tế, Tiểu Đoàn 15 ban hành chỉ thị số 01/CT-TĐ15 về việc tăng cường đảm bảo an toàn giao thông trong toàn đơn vị.</p>
<h3>Nội dung chính:</h3>
<ul>
<li>Tuyên truyền, giáo dục pháp luật về giao thông đường bộ</li>
<li>Tổ chức kiểm tra, xử lý vi phạm giao thông trong đơn vị</li>
<li>Tăng cường quản lý phương tiện giao thông</li>
<li>Thực hiện nghiêm túc "Đã uống rượu bia không lái xe"</li>
</ul>
<p>Chỉ thị có hiệu lực từ ngày ký và thay thế các quy định trước đây.</p>',
'/assets/images/an-ninh-giao-thong.jpg',
'2025-01-25',
'Nguyễn Văn An'),

('art_3',
'Hội Nghị Tổng Kết Công Tác Năm 2024',
'Tổng kết thành tích và đề ra phương hướng nhiệm vụ năm 2025.',
'<h2>Hội Nghị Tổng Kết Công Tác Năm 2024</h2>
<p>Ngày 20/01/2025, Tiểu Đoàn 15 tổ chức hội nghị tổng kết công tác năm 2024 và triển khai nhiệm vụ năm 2025.</p>
<h3>Thành tích nổi bật năm 2024:</h3>
<ul>
<li>Hoàn thành xuất sắc 100% nhiệm vụ được giao</li>
<li>Đơn vị trong sạch vững mạnh xuất sắc</li>
<li>Có 15 đồng chí được khen thưởng các loại</li>
<li>Tổ chức thành công 5 đợt huấn luyện</li>
</ul>
<h3>Phương hướng 2025:</h3>
<ul>
<li>Tiếp tục xây dựng đơn vị vững mạnh toàn diện</li>
<li>Nâng cao chất lượng huấn luyện, sẵn sàng chiến đấu</li>
<li>Tăng cường công tác chính trị, tư tưởng</li>
</ul>',
'/assets/images/tong-ket-2024.jpg',
'2025-01-20',
'Lê Thị Bình'),

('art_4',
'Khen Thưởng Các Tập Thê, Cá Nhân Xuất Sắc',
'Khen thưởng các tập thể, cá nhân có thành tích xuất sắc trong công tác.',
'<h2>Khen Thưởng Xuất Sắc</h2>
<p>Theo quyết định số 15/QĐ-TĐ15, Tiểu Đoàn 15 khen thưởng các tập thể, cá nhân có thành tích xuất sắc năm 2024.</p>
<h3>Tập thể xuất sắc:</h3>
<ul>
<li>Trung đội 1 - Hoàn thành xuất sắc nhiệm vụ</li>
<li>Trung đội 3 - Đơn vị trong sạch vững mạnh xuất sắc</li>
</ul>
<h3>Cá nhân xuất sắc:</h3>
<ul>
<li>Đại úy Trần Công Hùng - Chỉ huy trưởng</li>
<li>Thiếu úy Nguyễn Văn An - Trung đội trưởng</li>
<li>Trung úy Lê Thị Bình - Chính trị viên</li>
</ul>',
'/assets/images/khen-thuong-2024.jpg',
'2025-01-15',
'Phạm Văn Cường'),

('art_5',
'Chỉ Đạo Đợt Huấn Luyện Mùa Xuân 2025',
'Triển khai kế hoạch huấn luyện mùa xuân năm 2025.',
'<h2>Đợt Huấn Luyện Mùa Xuân 2025</h2>
<p>Tiểu Đoàn 15 bắt đầu đợt huấn luyện mùa xuân 2025 từ ngày 10/01/2025.</p>
<h3>Nội dung huấn luyện:</h3>
<ul>
<li>Kỹ năng chiến đấu bộ binh</li>
<li>Vận hành vũ khí trang bị</li>
<li>Chỉ huy chiến thuật</li>
<li>Công tác dân quân tự vệ</li>
</ul>
<h3>Thời gian và địa điểm:</h3>
<p>Thời gian: 8 tuần<br>
Địa điểm: Bãi tập Tiểu Đoàn 15</p>',
'/assets/images/huan-luyen-xuan-2025.jpg',
'2025-01-10',
'Trần Công Hùng');

-- Insert Settings
INSERT INTO settings (id, setting_key, setting_value, description) VALUES
('set_1', 'site_title', 'Tiểu Đoàn 15', 'Tiêu đề website'),
('set_2', 'site_description', 'Cổng thông tin Tiểu Đoàn 15 - Quân khu 7', 'Mô tả website'),
('set_3', 'maintenance_mode', 'false', 'Chế độ bảo trì'),
('set_4', 'max_file_size', '10485760', 'Kích thước file tối đa (bytes)'),
('set_5', 'allowed_file_types', 'jpg,jpeg,png,gif,pdf,doc,docx', 'Các loại file cho phép'),
('set_6', 'contact_email', 'info@tieudoan15.vn', 'Email liên hệ'),
('set_7', 'phone_number', '0123.456.789', 'Số điện thoại'),
('set_8', 'address', 'Đường ABC, Quận XYZ, TP.HCM', 'Địa chỉ đơn vị'),
('set_9', 'facebook_url', 'https://facebook.com/tieudoan15', 'Fanpage Facebook'),
('set_10', 'youtube_url', 'https://youtube.com/tieudoan15', 'Kênh YouTube');

-- Insert Media (Files mẫu)
INSERT INTO media (id, filename, original_name, file_type, file_size, upload_path, uploaded_by) VALUES
('med_1', 'khai-giang-2025.jpg', 'khai-giang-2025.jpg', 'image/jpeg', 1024576, '/assets/images/', 'user_admin'),
('med_2', 'an-ninh-giao-thong.jpg', 'an-ninh-giao-thong.jpg', 'image/jpeg', 856432, '/assets/images/', 'user_1'),
('med_3', 'tong-ket-2024.jpg', 'tong-ket-2024.jpg', 'image/jpeg', 1245678, '/assets/images/', 'user_2'),
('med_4', 'khen-thuong-2024.jpg', 'khen-thuong-2024.jpg', 'image/jpeg', 987654, '/assets/images/', 'user_3'),
('med_5', 'huan-luyen-xuan-2025.jpg', 'huan-luyen-xuan-2025.jpg', 'image/jpeg', 1123456, '/assets/images/', 'user_admin');

-- Insert Activity Logs (Nhật ký hoạt động mẫu)
INSERT INTO activity_logs (id, user_id, action, description, ip_address, user_agent, created_at) VALUES
('log_1', 'user_admin', 'LOGIN', 'Đăng nhập hệ thống', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-01-28 08:00:00'),
('log_2', 'user_admin', 'CREATE_ARTICLE', 'Tạo bài viết "Lễ Khai Giảng Lớp Bồi Dưỡng"', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-01-28 08:30:00'),
('log_3', 'user_1', 'LOGIN', 'Đăng nhập hệ thống', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-01-28 09:00:00'),
('log_4', 'user_1', 'UPDATE_ARTICLE', 'Cập nhật bài viết "Chỉ Thị An Ninh Giao Thông"', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-01-28 09:15:00'),
('log_5', 'user_2', 'LOGIN', 'Đăng nhập hệ thống', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '2025-01-28 10:00:00');

-- ==================== THÔNG TIN TÀI KHOẢN TEST ====================

-- Tài khoản admin:
-- Username: admin@tieudoan15.local
-- Password: admin123

-- Tài khoản user mẫu:
-- Username: an.nv@tieudoan15.local
-- Password: admin123

-- Username: binh.lt@tieudoan15.local  
-- Password: admin123

-- Username: cuong.pv@tieudoan15.local
-- Password: admin123

-- ==================== GHI CHÚ QUAN TRỌNG ====================

-- 1. File này đã sẵn sàng import vào InfinityFree
-- 2. Không cần sửa gì thêm
-- 3. Có đủ dữ liệu để test ngay lập tức
-- 4. Password được hash bằng bcrypt, an toàn
-- 5. Các bài viết có nội dung đầy đủ, hình ảnh placeholder
