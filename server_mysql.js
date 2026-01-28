const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 8080;

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tieudoan15db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- UTILS ---
const safeParse = (str) => {
  if (!str) return [];
  try {
    if (typeof str !== 'string') return str;
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
};

const safeStringify = (obj) => {
  if (typeof obj === 'string') return obj;
  return JSON.stringify(obj || []);
};

// --- API ENDPOINTS ---

// Generic CRUD Generator for MySQL
const createCrud = (endpointName, tableName, jsonFields = [], orderBy = null) => {
  // GET ALL
  app.get(`/api/${endpointName}`, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${tableName}${orderBy ? ` ORDER BY ${orderBy}` : ''}`);
      let result = rows;
      if (jsonFields.length > 0) {
        result = rows.map(item => {
          const newItem = { ...item };
          jsonFields.forEach(f => { newItem[f] = safeParse(newItem[f]); });
          return newItem;
        });
      }
      res.json(result);
    } catch (e) {
      console.error(`Error GET /api/${endpointName}:`, e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST
  app.post(`/api/${endpointName}`, async (req, res) => {
    try {
      const body = { ...req.body };
      jsonFields.forEach(f => { body[f] = safeStringify(body[f]); });
      
      const [result] = await pool.query(`INSERT INTO ${tableName} SET ?`, [body]);
      const [[newItem]] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
      res.json(newItem);
    } catch (e) {
      console.error(`Error POST /api/${endpointName}:`, e);
      res.status(500).json({ error: e.message });
    }
  });

  // PUT
  app.put(`/api/${endpointName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const body = { ...req.body };
      jsonFields.forEach(f => { body[f] = safeStringify(body[f]); });
      
      await pool.query(`UPDATE ${tableName} SET ? WHERE id = ?`, [body, id]);
      const [[updatedItem]] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
      res.json(updatedItem);
    } catch (e) {
      console.error(`Error PUT /api/${endpointName}:`, e);
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE
  app.delete(`/api/${endpointName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
      res.json({ success: true });
    } catch (e) {
      console.error(`Error DELETE /api/${endpointName}:`, e);
      res.status(500).json({ error: e.message });
    }
  });
};

// --- TABLES ---
createCrud('articles', 'articles', [], 'date DESC');
createCrud('milestones', 'milestones', ['quiz'], 'year ASC');
createCrud('questions', 'questions', ['options']);
createCrud('scores', 'scores', [], 'date DESC');
createCrud('media', 'media', [], 'date DESC');
createCrud('leaders', 'leaders', []);
createCrud('comments', 'comments', [], 'date ASC');
createCrud('documents', 'documents', [], 'date DESC');
createCrud('quiz-results', 'quiz_results', [], 'timestamp DESC');
createCrud('read-history', 'read_history', [], 'read_at DESC');

// --- USERS (with login) ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [[user]] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (!user) {
      return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
    }
    res.json(user);
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

createCrud('users', 'users', []);

// --- SETTINGS (key-value) ---
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings');
    const obj = {};
    rows.forEach(r => { obj[r.setting_key] = r.setting_value; });
    res.json(obj);
  } catch (e) {
    console.error('GET /api/settings error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const entries = Object.entries(req.body).map(([key, value]) => [key, String(value)]);
    await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES ? ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [entries]);
    res.json({ success: true });
  } catch (e) {
    console.error('POST /api/settings error:', e);
    res.status(500).json({ error: e.message });
  }
});

// --- READ HISTORY ---
app.post('/api/read-history/mark', async (req, res) => {
  try {
    const { userId, userName, userRank, unit, milestoneId, milestoneTitle } = req.body;
    const readHistoryId = `read_${userId}_${milestoneId}_${Date.now()}`;
    await pool.query(
      'INSERT INTO read_history (id, user_id, user_name, user_rank, unit, milestone_id, milestone_title, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [readHistoryId, userId, userName, userRank, unit, milestoneId, milestoneTitle, new Date().toISOString()]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Mark read error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/read-history/check/:userId/:milestoneId', async (req, res) => {
  try {
    const { userId, milestoneId } = req.params;
    const [[row]] = await pool.query(
      'SELECT id FROM read_history WHERE user_id = ? AND milestone_id = ? LIMIT 1',
      [userId, milestoneId]
    );
    res.json({ hasRead: !!row });
  } catch (e) {
    console.error('Check read error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MySQL API server running on http://localhost:${PORT}`);
});
