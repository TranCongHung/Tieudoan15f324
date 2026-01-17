-- Quick setup script - Copy this to Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rank_name VARCHAR(50), 
    position VARCHAR(100),
    unit VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
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

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB, 
    correct_answer_index INTEGER,
    explanation TEXT
);

-- Create quiz_results table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
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

-- Create media table
CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    type VARCHAR(10),
    url TEXT,
    thumbnail TEXT,
    description TEXT,
    date DATE
);

-- Create milestones table
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

-- Create leaders table
CREATE TABLE IF NOT EXISTS leaders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(100),
    image TEXT
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    article_id VARCHAR(50),
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    user_rank VARCHAR(50),
    content TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_folder BOOLEAN DEFAULT FALSE,
    parent_id VARCHAR(50),
    type VARCHAR(50),
    date DATE,
    size VARCHAR(50)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT
);

-- Insert default admin user
INSERT INTO users (id, name, email, rank_name, position, unit, password, role) 
VALUES ('admin_root', 'Super Admin', 'admin@su324.vn', 'Đại tá', 'Chỉ huy trưởng', 'Sư đoàn 324', 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations on articles" ON articles FOR ALL USING (true);
CREATE POLICY "Enable all operations on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Enable all operations on quiz_results" ON quiz_results FOR ALL USING (true);
CREATE POLICY "Enable all operations on scores" ON scores FOR ALL USING (true);
CREATE POLICY "Enable all operations on media" ON media FOR ALL USING (true);
CREATE POLICY "Enable all operations on milestones" ON milestones FOR ALL USING (true);
CREATE POLICY "Enable all operations on leaders" ON leaders FOR ALL USING (true);
CREATE POLICY "Enable all operations on comments" ON comments FOR ALL USING (true);
CREATE POLICY "Enable all operations on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Enable all operations on settings" ON settings FOR ALL USING (true);
