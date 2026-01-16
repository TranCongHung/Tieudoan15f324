
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

console.log('--- Hệ thống Backend Tiểu đoàn 15 ---');

// --- ARTICLES ---
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await prisma.article.findMany({ orderBy: { date: 'desc' } });
        res.json(articles);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/articles', async (req, res) => {
    try {
        const result = await prisma.article.create({ data: req.body });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/articles/:id', async (req, res) => {
    try {
        const result = await prisma.article.update({ where: { id: req.params.id }, data: req.body });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/articles/:id', async (req, res) => {
    try {
        await prisma.article.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USERS & AUTH ---
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({ where: { email, password } });
        if (user) res.json(user);
        else res.status(401).json({ message: 'Sai thông tin đăng nhập' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SETTINGS (Key-Value) ---
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.json(settingsObj);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        for (const key in settings) {
            await prisma.setting.upsert({
                where: { key },
                update: { value: String(settings[key]) },
                create: { key, value: String(settings[key]) }
            });
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- CÁC ROUTE KHÁC (Tương tự cho Milestone, Question, Score, Document, Media, Leader) ---
// (Lưu ý: Bạn có thể tiếp tục thêm các route cho các model khác theo mẫu trên)

app.listen(PORT, () => {
    console.log(`Backend Server: http://localhost:${PORT}`);
    console.log(`Prisma Postgres is active via Accelerate.`);
});
