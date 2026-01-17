-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS tieudoan15db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tieudoan15db;

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
);

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
);

-- 3. Bảng History Milestones (Lịch sử)
CREATE TABLE milestones (
    id VARCHAR(50) PRIMARY KEY,
    year VARCHAR(20),
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content TEXT,
    image LONGTEXT,
    icon VARCHAR(50),
    story LONGTEXT,
    quiz JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Questions (Câu hỏi trắc nghiệm)
CREATE TABLE questions (
    id VARCHAR(50) PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSON, 
    correct_answer_index INT,
    explanation TEXT
);

-- 5. Bảng Quiz Results (Kết quả thi)
CREATE TABLE quiz_results (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    user_rank VARCHAR(50),
    unit VARCHAR(100),
    topic VARCHAR(255),
    score INT,
    total_questions INT,
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Bảng Scores (Điểm thi đua)
CREATE TABLE scores (
    id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(100),
    military_score FLOAT,
    political_score FLOAT,
    logistics_score FLOAT,
    discipline_score FLOAT,
    total_score FLOAT,
    date DATE
);

-- 7. Bảng Media (Thư viện)
CREATE TABLE media (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    type ENUM('video', 'audio'),
    url LONGTEXT,
    thumbnail LONGTEXT,
    description TEXT,
    date DATE
);

-- 8. Bảng Leaders (Ban chỉ huy)
CREATE TABLE leaders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(100),
    image LONGTEXT
);

-- 9. Bảng Comments (Bình luận)
CREATE TABLE comments (
    id VARCHAR(50) PRIMARY KEY,
    article_id VARCHAR(50),
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    user_rank VARCHAR(50),
    content TEXT,
    date DATE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Bảng Documents (Tài liệu)
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_folder BOOLEAN DEFAULT FALSE,
    parent_id VARCHAR(50) DEFAULT NULL,
    type VARCHAR(50),
    date DATE,
    size VARCHAR(50)
);

-- 11. Bảng Settings (Cấu hình hệ thống - Lưu key-value để linh hoạt)
CREATE TABLE settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value LONGTEXT
);

-- Dữ liệu mẫu Admin mặc định
INSERT INTO users (id, name, email, rank_name, position, unit, password, role) 
VALUES ('admin_root', 'Super Admin', 'admin@su324.vn', 'Đại tá', 'Chỉ huy trưởng', 'Sư đoàn 324', 'admin', 'admin')
ON DUPLICATE KEY UPDATE name=name;
