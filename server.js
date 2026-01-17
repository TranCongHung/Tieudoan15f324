
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- UTILS ---
const safeParse = (str) => {
    try { return JSON.parse(str); } catch (e) { return []; }
};

const safeStringify = (obj) => {
    return typeof obj === 'string' ? obj : JSON.stringify(obj);
};

// --- API ENDPOINTS ---

// Generic CRUD Generator for simple models
const createCrud = (name, model, jsonFields = []) => {
    // GET ALL
    app.get(`/api/${name}`, async (req, res) => {
        try {
            let data = await prisma[model].findMany();
            if (jsonFields.length > 0) {
                data = data.map(item => {
                    const newItem = { ...item };
                    jsonFields.forEach(f => { newItem[f] = safeParse(newItem[f]); });
                    return newItem;
                });
            }
            res.json(data);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // POST
    app.post(`/api/${name}`, async (req, res) => {
        try {
            const body = { ...req.body };
            jsonFields.forEach(f => { body[f] = safeStringify(body[f]); });
            const result = await prisma[model].create({ data: body });
            res.json(result);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // PUT
    app.put(`/api/${name}/:id`, async (req, res) => {
        try {
            const body = { ...req.body };
            delete body.id; // Tránh lỗi update PK
            jsonFields.forEach(f => { body[f] = safeStringify(body[f]); });
            const result = await prisma[model].update({ where: { id: req.params.id }, data: body });
            res.json(result);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // DELETE
    app.delete(`/api/${name}/:id`, async (req, res) => {
        try {
            await prisma[model].delete({ where: { id: req.params.id } });
            res.json({ success: true });
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
};

// Register CRUDs
createCrud('articles', 'article');
createCrud('milestones', 'milestone', ['quiz']);
createCrud('questions', 'question', ['options']);
createCrud('users', 'user');
createCrud('scores', 'score');
createCrud('leaders', 'leader');
createCrud('media', 'media');
createCrud('documents', 'document');
createCrud('quiz-results', 'quizResult');

// Special API: Settings (Key-Value style)
app.get('/api/settings', async (req, res) => {
    try {
        const data = await prisma.setting.findMany();
        const obj = {};
        data.forEach(s => obj[s.key] = s.value);
        res.json(obj);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings', async (req, res) => {
    try {
        const tasks = Object.entries(req.body).map(([key, value]) => 
            prisma.setting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            })
        );
        await Promise.all(tasks);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Special API: Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({ where: { email, password } });
        if (user) res.json(user);
        else res.status(401).json({ message: 'Sai thông tin đăng nhập' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Special API: Comments
app.get('/api/comments', async (req, res) => {
    const { articleId } = req.query;
    const data = await prisma.comment.findMany({ where: { articleId } });
    res.json(data);
});
app.post('/api/comments', async (req, res) => {
    const result = await prisma.comment.create({ data: req.body });
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`[OK] Server chạy tại http://localhost:${PORT}`);
    console.log(`[OK] Chế độ Database: SQLite (prisma/dev.db)`);
});
