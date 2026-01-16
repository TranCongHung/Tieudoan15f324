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
    user: 'root',      
    password: '',      
    database: 'tieudoan15db'
});

db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('Đã kết nối thành công đến MySQL Database.');
});

// --- HELPER FUNCTIONS ---
const handleQuery = (res, sql, params = []) => {
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// --- API ROUTES ---

// 1. ARTICLES
app.get('/api/articles', (req, res) => handleQuery(res, 'SELECT * FROM articles ORDER BY date DESC'));
app.post('/api/articles', (req, res) => {
    const { id, title, summary, content, imageUrl, date, author } = req.body;
    const sql = 'INSERT INTO articles (id, title, summary, content, image_url, date, author) VALUES (?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, title, summary, content, imageUrl, date, author]);
});
app.put('/api/articles/:id', (req, res) => {
    const { title, summary, content, imageUrl, date, author } = req.body;
    const sql = 'UPDATE articles SET title=?, summary=?, content=?, image_url=?, date=?, author=? WHERE id=?';
    handleQuery(res, sql, [title, summary, content, imageUrl, date, author, req.params.id]);
});
app.delete('/api/articles/:id', (req, res) => handleQuery(res, 'DELETE FROM articles WHERE id=?', [req.params.id]));

// 2. USERS (PERSONNEL)
app.get('/api/users', (req, res) => handleQuery(res, 'SELECT * FROM users'));
app.post('/api/users', (req, res) => {
    const { id, name, email, rank, position, unit, password, role } = req.body;
    const sql = 'INSERT INTO users (id, name, email, rank_name, position, unit, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, name, email, rank, position, unit, password, role]);
});
app.put('/api/users/:id', (req, res) => {
    const { name, email, rank, position, unit, password, role } = req.body;
    const sql = 'UPDATE users SET name=?, email=?, rank_name=?, position=?, unit=?, password=?, role=? WHERE id=?';
    handleQuery(res, sql, [name, email, rank, position, unit, password, role, req.params.id]);
});
app.delete('/api/users/:id', (req, res) => handleQuery(res, 'DELETE FROM users WHERE id=?', [req.params.id]));
// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            // Map rank_name back to rank for frontend compatibility
            const user = { ...results[0], rank: results[0].rank_name }; 
            res.json(user);
        } else {
            res.status(401).json({ message: 'Sai thông tin đăng nhập' });
        }
    });
});

// 3. MILESTONES (HISTORY)
app.get('/api/milestones', (req, res) => {
    db.query('SELECT * FROM milestones ORDER BY year ASC', (err, results) => {
        if(err) return res.status(500).json(err);
        // Milestones contain JSON quiz usually, but simpler table structure here implies separate question fetching or embedded JSON logic if updated. 
        // For simplicity, assuming quiz is stored elsewhere or not implemented deeply in DB yet. 
        // Let's assume frontend handles the 'quiz' array separately or we treat it as empty for now in this basic persistence.
        const mapped = results.map(m => ({ ...m, quiz: [] })); 
        res.json(mapped);
    });
});
app.post('/api/milestones', (req, res) => {
    const { id, year, title, subtitle, content, image, icon, story } = req.body;
    const sql = 'INSERT INTO milestones (id, year, title, subtitle, content, image, icon, story) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, year, title, subtitle, content, image, icon, story]);
});
app.put('/api/milestones/:id', (req, res) => {
    const { year, title, subtitle, content, image, icon, story } = req.body;
    const sql = 'UPDATE milestones SET year=?, title=?, subtitle=?, content=?, image=?, icon=?, story=? WHERE id=?';
    handleQuery(res, sql, [year, title, subtitle, content, image, icon, story, req.params.id]);
});
app.delete('/api/milestones/:id', (req, res) => handleQuery(res, 'DELETE FROM milestones WHERE id=?', [req.params.id]));

// 4. QUESTIONS
app.get('/api/questions', (req, res) => handleQuery(res, 'SELECT * FROM questions'));
app.post('/api/questions', (req, res) => {
    const { id, questionText, options, correctAnswerIndex, explanation } = req.body;
    const sql = 'INSERT INTO questions (id, question_text, options, correct_answer_index, explanation) VALUES (?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, questionText, JSON.stringify(options), correctAnswerIndex, explanation]);
});
app.put('/api/questions/:id', (req, res) => {
    const { questionText, options, correctAnswerIndex, explanation } = req.body;
    const sql = 'UPDATE questions SET question_text=?, options=?, correct_answer_index=?, explanation=? WHERE id=?';
    handleQuery(res, sql, [questionText, JSON.stringify(options), correctAnswerIndex, explanation, req.params.id]);
});
app.delete('/api/questions/:id', (req, res) => handleQuery(res, 'DELETE FROM questions WHERE id=?', [req.params.id]));

// 5. SCORES
app.get('/api/scores', (req, res) => handleQuery(res, 'SELECT * FROM scores'));
app.post('/api/scores', (req, res) => {
    const { id, unitName, militaryScore, politicalScore, logisticsScore, disciplineScore, totalScore, date } = req.body;
    const sql = 'INSERT INTO scores (id, unit_name, military_score, political_score, logistics_score, discipline_score, total_score, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, unitName, militaryScore, politicalScore, logisticsScore, disciplineScore, totalScore, date]);
});
app.put('/api/scores/:id', (req, res) => {
    const { unitName, militaryScore, politicalScore, logisticsScore, disciplineScore, totalScore, date } = req.body;
    const sql = 'UPDATE scores SET unit_name=?, military_score=?, political_score=?, logistics_score=?, discipline_score=?, total_score=?, date=? WHERE id=?';
    handleQuery(res, sql, [unitName, militaryScore, politicalScore, logisticsScore, disciplineScore, totalScore, date, req.params.id]);
});
app.delete('/api/scores/:id', (req, res) => handleQuery(res, 'DELETE FROM scores WHERE id=?', [req.params.id]));

// 6. DOCUMENTS
app.get('/api/documents', (req, res) => {
    db.query('SELECT * FROM documents', (err, results) => {
        if(err) return res.status(500).json(err);
        const mapped = results.map(d => ({
            id: d.id, name: d.name, isFolder: !!d.is_folder, parentId: d.parent_id, type: d.type, date: d.date, size: d.size
        }));
        res.json(mapped);
    });
});
app.post('/api/documents', (req, res) => {
    const { id, name, isFolder, parentId, type, date, size } = req.body;
    const sql = 'INSERT INTO documents (id, name, is_folder, parent_id, type, date, size) VALUES (?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, name, isFolder, parentId, type, date, size]);
});
app.put('/api/documents/:id', (req, res) => {
    const { name } = req.body; // Usually only rename
    const sql = 'UPDATE documents SET name=? WHERE id=?';
    handleQuery(res, sql, [name, req.params.id]);
});
app.delete('/api/documents/:id', (req, res) => handleQuery(res, 'DELETE FROM documents WHERE id=?', [req.params.id]));

// 7. MEDIA
app.get('/api/media', (req, res) => handleQuery(res, 'SELECT * FROM media'));
app.post('/api/media', (req, res) => {
    const { id, title, type, url, thumbnail, description, date } = req.body;
    const sql = 'INSERT INTO media (id, title, type, url, thumbnail, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, title, type, url, thumbnail, description, date]);
});
app.put('/api/media/:id', (req, res) => {
    const { title, type, url, thumbnail, description, date } = req.body;
    const sql = 'UPDATE media SET title=?, type=?, url=?, thumbnail=?, description=?, date=? WHERE id=?';
    handleQuery(res, sql, [title, type, url, thumbnail, description, date, req.params.id]);
});
app.delete('/api/media/:id', (req, res) => handleQuery(res, 'DELETE FROM media WHERE id=?', [req.params.id]));

// 8. LEADERS
app.get('/api/leaders', (req, res) => handleQuery(res, 'SELECT * FROM leaders'));
app.post('/api/leaders', (req, res) => {
    const { id, name, role, image } = req.body;
    const sql = 'INSERT INTO leaders (id, name, role, image) VALUES (?, ?, ?, ?)';
    handleQuery(res, sql, [id, name, role, image]);
});
app.put('/api/leaders/:id', (req, res) => {
    const { name, role, image } = req.body;
    const sql = 'UPDATE leaders SET name=?, role=?, image=? WHERE id=?';
    handleQuery(res, sql, [name, role, image, req.params.id]);
});
app.delete('/api/leaders/:id', (req, res) => handleQuery(res, 'DELETE FROM leaders WHERE id=?', [req.params.id]));

// 9. SETTINGS (Special Case - Key/Value Store)
app.get('/api/settings', (req, res) => {
    db.query('SELECT * FROM settings', (err, results) => {
        if(err) return res.status(500).json(err);
        const settingsObj = {};
        results.forEach(row => {
            settingsObj[row.setting_key] = row.setting_value;
        });
        res.json(settingsObj);
    });
});
app.post('/api/settings', (req, res) => {
    const settings = req.body;
    const promises = Object.keys(settings).map(key => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=?';
            db.query(sql, [key, String(settings[key]), String(settings[key])], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
    Promise.all(promises)
        .then(() => res.json({ message: 'Saved settings' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// 10. QUIZ RESULTS
app.get('/api/quiz-results', (req, res) => handleQuery(res, 'SELECT * FROM quiz_results'));
app.post('/api/quiz-results', (req, res) => {
    const { id, userId, userName, userRank, unit, topic, score, totalQuestions, timestamp } = req.body;
    const sql = 'INSERT INTO quiz_results (id, user_id, user_name, user_rank, unit, topic, score, total_questions, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    handleQuery(res, sql, [id, userId, userName, userRank, unit, topic, score, totalQuestions, timestamp]);
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
