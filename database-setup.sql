-- Run this SQL script in your Supabase SQL Editor to set up the database tables

-- 1. Bảng Users (Cán bộ, chiến sĩ)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rank_name VARCHAR(50), 
    position VARCHAR(100),
    unit VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Articles (Bài viết)
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    date DATE,
    author VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng History Milestones (Lịch sử)
CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(50) PRIMARY KEY,
    year VARCHAR(20),
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content TEXT,
    image TEXT,
    icon VARCHAR(50),
    story TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Questions (Câu hỏi trắc nghiệm)
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB, 
    correct_answer_index INTEGER,
    explanation TEXT
);

-- 5. Bảng Quiz Results (Kết quả thi)
CREATE TABLE IF NOT EXISTS quiz_results (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    user_rank VARCHAR(50),
    unit VARCHAR(100),
    topic VARCHAR(255),
    score INTEGER,
    total_questions INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Bảng Scores (Điểm thi đua)
CREATE TABLE IF NOT EXISTS scores (
    id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(100),
    military_score NUMERIC,
    political_score NUMERIC,
    logistics_score NUMERIC,
    discipline_score NUMERIC,
    total_score NUMERIC,
    date DATE
);

-- 7. Bảng Media (Thư viện)
CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    type VARCHAR(10) CHECK (type IN ('video', 'audio')),
    url TEXT,
    thumbnail TEXT,
    description TEXT,
    date DATE
);

-- 8. Bảng Leaders (Ban chỉ huy)
CREATE TABLE IF NOT EXISTS leaders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(100),
    image TEXT
);

-- 9. Bảng Comments (Bình luận)
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    article_id VARCHAR(50),
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    user_rank VARCHAR(50),
    content TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Bảng Documents (Tài liệu)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_folder BOOLEAN DEFAULT FALSE,
    parent_id VARCHAR(50),
    type VARCHAR(50),
    date DATE,
    size VARCHAR(50)
);

-- 11. Bảng Settings (Cấu hình hệ thống)
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT
);

-- Dữ liệu mẫu Admin mặc định
INSERT INTO users (id, name, email, rank_name, position, unit, password, role) 
VALUES ('admin_root', 'Super Admin', 'admin@su324.vn', 'Đại tá', 'Chỉ huy trưởng', 'Sư đoàn 324', 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all articles" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all articles" ON articles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all articles" ON articles FOR DELETE USING (true);

-- Similar policies for other tables...
CREATE POLICY "Enable full access to milestones" ON milestones FOR ALL USING (true);
CREATE POLICY "Enable full access to questions" ON questions FOR ALL USING (true);
CREATE POLICY "Enable full access to quiz_results" ON quiz_results FOR ALL USING (true);
CREATE POLICY "Enable full access to scores" ON scores FOR ALL USING (true);
CREATE POLICY "Enable full access to media" ON media FOR ALL USING (true);
CREATE POLICY "Enable full access to leaders" ON leaders FOR ALL USING (true);
CREATE POLICY "Enable full access to comments" ON comments FOR ALL USING (true);
CREATE POLICY "Enable full access to documents" ON documents FOR ALL USING (true);
CREATE POLICY "Enable full access to settings" ON settings FOR ALL USING (true);
