import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
const PORT = 8080;

// Initialize Supabase client
const supabase = createClient(
    'https://hpgyuftvxnmogbcdlymc.supabase.co',
    process.env.API_KEY || 'MISSING_KEY'
);

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

// Generic CRUD Generator for Supabase
const createCrud = (endpointName, tableName, jsonFields = []) => {
    // GET ALL
    app.get(`/api/${endpointName}`, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*');
            
            if (error) throw error;
            
            let result = data;
            if (jsonFields.length > 0) {
                result = data.map(item => {
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
            
            const { data, error } = await supabase
                .from(tableName)
                .insert(body)
                .select();
            
            if (error) throw error;
            res.json(data[0]);
        } catch (e) { 
            console.error(`Error POST /api/${endpointName}:`, e);
            res.status(500).json({ error: e.message }); 
        }
    });

    // PUT
    app.put(`/api/${endpointName}/:id`, async (req, res) => {
        try {
            const body = { ...req.body };
            delete body.id;
            jsonFields.forEach(f => { body[f] = safeStringify(body[f]); });
            
            const { data, error } = await supabase
                .from(tableName)
                .update(body)
                .eq('id', req.params.id)
                .select();
            
            if (error) throw error;
            res.json(data[0]);
        } catch (e) { 
            console.error(`Error PUT /api/${endpointName}:`, e);
            res.status(500).json({ error: e.message }); 
        }
    });

    // DELETE
    app.delete(`/api/${endpointName}/:id`, async (req, res) => {
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', req.params.id);
            
            if (error) throw error;
            res.json({ success: true });
        } catch (e) { 
            console.error(`Error DELETE /api/${endpointName}:`, e);
            res.status(500).json({ error: e.message }); 
        }
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
        const { data, error } = await supabase
            .from('settings')
            .select('*');
        
        if (error) throw error;
        
        const obj = {};
        data.forEach(s => obj[s.key] = s.value);
        res.json(obj);
    } catch (e) { 
        console.error('Error GET /api/settings:', e);
        res.status(500).json({ error: e.message }); 
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        const tasks = Object.entries(req.body).map(([key, value]) => 
            supabase
                .from('settings')
                .upsert({ key, value: String(value) })
                .select()
        );
        
        const results = await Promise.all(tasks);
        
        // Check for errors
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;
        
        res.json({ success: true });
    } catch (e) { 
        console.error('Error POST /api/settings:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// Auth API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) res.json(data);
        else res.status(401).json({ message: 'Sai thông tin đăng nhập' });
    } catch (e) { 
        console.error('Error POST /api/login:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// Comments API
app.get('/api/comments', async (req, res) => {
    try {
        const { articleId } = req.query;
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('articleId', String(articleId));
        
        if (error) throw error;
        res.json(data);
    } catch (e) { 
        console.error('Error GET /api/comments:', e);
        res.status(500).json({ error: e.message }); 
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert(req.body)
            .select();
        
        if (error) throw error;
        res.json(data[0]);
    } catch (e) { 
        console.error('Error POST /api/comments:', e);
        res.status(500).json({ error: e.message }); 
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 SERVER ĐANG CHẠY TẠI: http://localhost:${PORT}`);
    console.log(`📂 DATABASE: Supabase PostgreSQL`);
    console.log(`✅ Hệ thống Tiểu đoàn 15 sẵn sàng!\n`);
});
