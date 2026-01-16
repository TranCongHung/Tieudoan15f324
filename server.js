const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Limit lớn để upload ảnh base64

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Thay bằng user MySQL của bạn
    password: '',      // Thay bằng mật khẩu MySQL của bạn
    database: 'tieudoan15db'
});

db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('Đã kết nối thành công đến MySQL Database.');
});

// --- API ROUTES (Ví dụ cho Articles và Users) ---

// 1. Lấy danh sách bài viết
app.get('/api/articles', (req, res) => {
    const sql = 'SELECT * FROM articles ORDER BY date DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 2. Thêm bài viết mới
app.post('/api/articles', (req, res) => {
    const { id, title, summary, content, imageUrl, date, author } = req.body;
    const sql = 'INSERT INTO articles (id, title, summary, content, image_url, date, author) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [id, title, summary, content, imageUrl, date, author], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Bài viết đã được lưu', id });
    });
});

// 3. Đăng nhập
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            // Lưu ý: Thực tế nên dùng JWT Token và Hash mật khẩu (bcrypt)
            res.json(results[0]);
        } else {
            res.status(401).json({ message: 'Sai thông tin đăng nhập' });
        }
    });
});

// 4. Lưu kết quả thi
app.post('/api/quiz-results', (req, res) => {
    const data = req.body;
    const sql = 'INSERT INTO quiz_results SET ?';
    db.query(sql, data, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Lưu kết quả thành công' });
    });
});

// ... Các API khác tương tự cho Milestones, Media, v.v.

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
