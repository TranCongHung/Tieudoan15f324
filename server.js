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

// Generic CRUD Generator
const createCrud = (endpointName, prismaModelName, jsonFields = []) => {
    // GET ALL
    app.get(`/api/${endpointName}`, async (req, res) => {
        try {
            let data = await prisma[prismaModelName].findMany();
            if (jsonFields.length > 0) {
                data = data.map(item => {
                    const newItem = { ...item };
                    jsonFields.forEach(f => { newItem[f] = safeParse(newItem[f]); });
                    return newItem;
                });
            }
            res.json(data);
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
            const result = await prisma[prismaModelName].create({ data: body });
            res.json(result);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // PUT
    app.put(`/api/${endpointName}/:id`, async (req, res) => {
        try {
            const body = { ...req.body };
            delete body.id;
            jsonFields.forEach(f => { body[f] = safeStringify(body[f]); });
            const result = await prisma[prismaModelName].update({ 
                where: { id: req.params.id }, 
                data: body 
            });
            res.json(result);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    // DELETE
    app.delete(`/api/${endpointName}/:id`, async (req, res) => {
        try {
            await prisma[prismaModelName].delete({ where: { id: req.params.id } });
            res.json({ success: true });
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
};

// Khởi tạo các Endpoint
createCrud('articles', 'article');
createCrud('milestones', 'milestone', ['quiz']);
createCrud('questions', 'question', ['options']);
createCrud('users', 'user');
createCrud('scores', 'score');
createCrud('leaders', 'leader');
createCrud('media', 'media');
createCrud('documents', 'document');
createCrud('quiz-results', 'quizResult');
createCrud('soldiers', 'soldier');

// API Settings (Key-Value)
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

// Auth API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({ where: { email, password } });
        if (user) res.json(user);
        else res.status(401).json({ message: 'Sai thông tin đăng nhập' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Comments API
app.get('/api/comments', async (req, res) => {
    try {
        const { articleId } = req.query;
        const data = await prisma.comment.findMany({ where: { articleId: String(articleId) } });
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/comments', async (req, res) => {
    try {
        const result = await prisma.comment.create({ data: req.body });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
    console.log(`\n🚀 SERVER ĐANG CHẠY TẠI: http://localhost:${PORT}`);
    console.log(`📂 DATABASE: SQLite (prisma/dev.db)`);
    console.log(`✅ Hệ thống Tiểu đoàn 15 sẵn sàng!\n`);
});
