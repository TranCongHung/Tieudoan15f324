-- Add read_history table for tracking user reading progress
USE tieudoan15db;

CREATE TABLE IF NOT EXISTS read_history (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    user_rank VARCHAR(50),
    unit VARCHAR(100),
    milestone_id VARCHAR(50) NOT NULL,
    milestone_title VARCHAR(255),
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_milestone (user_id, milestone_id),
    INDEX idx_user_read (user_id, read_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
