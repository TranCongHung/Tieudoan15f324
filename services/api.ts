
import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';
import { supabase } from './supabase';

class ApiClient {
    /**
     * Hàm xử lý lỗi tập trung: Chuyển đổi đối tượng lỗi thành chuỗi thông báo dễ đọc.
     */
    private handleError(error: any) {
        if (error) {
            console.error("Supabase Raw Error:", error);
            // Lấy message từ error object, nếu không có thì stringify toàn bộ object
            const message = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            throw new Error(message);
        }
    }

    // --- AUTHENTICATION ---
    async login(email: string, pass: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', pass)
            .maybeSingle();
        
        if (error) return null;
        if (!data) return null;

        return {
            ...data,
            rank: data.rank_name || data.rank
        } as User;
    }

    async register(user: User): Promise<boolean> {
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            rank_name: user.rank,
            position: user.position,
            unit: user.unit,
            password: user.password,
            role: user.role
        };
        const { error } = await supabase.from('users').insert([payload]);
        if (error) {
            console.error("Register Error:", error);
            return false;
        }
        return true;
    }

    // --- BÀI VIẾT (Articles) ---
    async getArticles(): Promise<Article[]> {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('date', { ascending: false });
        
        this.handleError(error);

        return (data || []).map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            imageUrl: item.image_url || item.imageUrl,
            date: item.date,
            author: item.author
        })) as Article[];
    }

    async createArticle(article: Article) {
        const payload = {
            id: article.id,
            title: article.title,
            summary: article.summary,
            content: article.content,
            image_url: article.imageUrl,
            date: article.date,
            author: article.author
        };
        const { error } = await supabase.from('articles').insert([payload]);
        this.handleError(error);
    }

    async updateArticle(id: string, article: Partial<Article>) {
        const payload: any = { ...article };
        if (article.imageUrl) {
            payload.image_url = article.imageUrl;
            delete payload.imageUrl;
        }
        const { error } = await supabase.from('articles').update(payload).eq('id', id);
        this.handleError(error);
    }

    async deleteArticle(id: string) {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        this.handleError(error);
    }

    // --- LỊCH SỬ (Milestones) ---
    async getHistory(): Promise<Milestone[]> {
        const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .order('year', { ascending: true });
        
        this.handleError(error);

        return (data || []).map(m => ({
            ...m,
            quiz: typeof m.quiz === 'string' ? JSON.parse(m.quiz) : (m.quiz || [])
        }));
    }

    async createMilestone(m: Milestone) {
        const payload = {
            id: m.id,
            year: m.year,
            title: m.title,
            subtitle: m.subtitle,
            content: m.content,
            image: m.image,
            icon: m.icon,
            story: m.story,
            quiz: JSON.stringify(m.quiz)
        };
        const { error } = await supabase.from('milestones').insert([payload]);
        this.handleError(error);
    }

    async updateMilestone(id: string, m: Partial<Milestone>) {
        const payload: any = { ...m };
        if (m.quiz) payload.quiz = JSON.stringify(m.quiz);
        const { error } = await supabase.from('milestones').update(payload).eq('id', id);
        this.handleError(error);
    }

    async deleteMilestone(id: string) {
        const { error } = await supabase.from('milestones').delete().eq('id', id);
        this.handleError(error);
    }

    // --- NGƯỜI DÙNG (Personnel) ---
    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase.from('users').select('*');
        this.handleError(error);
        return (data || []).map(u => ({
            ...u,
            rank: u.rank_name || u.rank
        })) as User[];
    }

    async createUser(user: User) {
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            rank_name: user.rank,
            position: user.position,
            unit: user.unit,
            password: user.password,
            role: user.role
        };
        const { error } = await supabase.from('users').insert([payload]);
        this.handleError(error);
    }

    async updateUser(id: string, u: Partial<User>) {
        const payload: any = { ...u };
        if (u.rank) {
            payload.rank_name = u.rank;
            delete payload.rank;
        }
        const { error } = await supabase.from('users').update(payload).eq('id', id);
        this.handleError(error);
    }

    async deleteUser(id: string) {
        const { error } = await supabase.from('users').delete().eq('id', id);
        this.handleError(error);
    }

    // --- CẤU HÌNH (Settings) ---
    async getSettings(): Promise<SiteSettings> {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) return {} as SiteSettings;
        const obj: any = {};
        data.forEach((item: any) => { obj[item.setting_key] = item.setting_value; });
        return obj as SiteSettings;
    }

    async saveSettings(settings: SiteSettings) {
        const entries = Object.entries(settings).map(([key, value]) => ({ 
            setting_key: key, 
            setting_value: String(value) 
        }));
        const { error } = await supabase.from('settings').upsert(entries, { onConflict: 'setting_key' });
        this.handleError(error);
    }

    // --- CÂU HỎI (Questions) ---
    async getQuestions(): Promise<Question[]> {
        const { data, error } = await supabase.from('questions').select('*');
        this.handleError(error);
        return (data || []).map(q => ({
            id: q.id,
            questionText: q.question_text,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctAnswerIndex: q.correct_answer_index,
            explanation: q.explanation
        }));
    }

    async createQuestion(q: Question) {
        const payload = {
            id: q.id,
            question_text: q.questionText,
            options: JSON.stringify(q.options),
            correct_answer_index: q.correctAnswerIndex,
            explanation: q.explanation
        };
        const { error } = await supabase.from('questions').insert([payload]);
        this.handleError(error);
    }

    async updateQuestion(id: string, q: Partial<Question>) {
        const payload: any = {};
        if (q.questionText) payload.question_text = q.questionText;
        if (q.options) payload.options = JSON.stringify(q.options);
        if (q.correctAnswerIndex !== undefined) payload.correct_answer_index = q.correctAnswerIndex;
        if (q.explanation) payload.explanation = q.explanation;
        const { error } = await supabase.from('questions').update(payload).eq('id', id);
        this.handleError(error);
    }

    async deleteQuestion(id: string) {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        this.handleError(error);
    }

    // --- ĐIỂM SỐ (Scores) ---
    async getScores(): Promise<Score[]> {
        const { data, error } = await supabase.from('scores').select('*').order('date', { ascending: false });
        this.handleError(error);
        return (data || []).map(s => ({
            id: s.id,
            unitName: s.unit_name,
            militaryScore: s.military_score,
            politicalScore: s.political_score,
            logisticsScore: s.logistics_score,
            disciplineScore: s.discipline_score,
            totalScore: s.total_score,
            date: s.date
        }));
    }

    async createScore(s: Score) {
        const payload = {
            id: s.id,
            unit_name: s.unitName,
            military_score: s.militaryScore,
            political_score: s.politicalScore,
            logistics_score: s.logisticsScore,
            discipline_score: s.disciplineScore,
            total_score: s.totalScore,
            date: s.date
        };
        const { error } = await supabase.from('scores').insert([payload]);
        this.handleError(error);
    }

    async updateScore(id: string, s: Partial<Score>) {
        const payload: any = {};
        if (s.unitName) payload.unit_name = s.unitName;
        if (s.militaryScore !== undefined) payload.military_score = s.militaryScore;
        if (s.politicalScore !== undefined) payload.political_score = s.politicalScore;
        if (s.logisticsScore !== undefined) payload.logistics_score = s.logisticsScore;
        if (s.disciplineScore !== undefined) payload.discipline_score = s.disciplineScore;
        if (s.totalScore !== undefined) payload.total_score = s.totalScore;
        if (s.date) payload.date = s.date;
        const { error } = await supabase.from('scores').update(payload).eq('id', id);
        this.handleError(error);
    }

    async deleteScore(id: string) {
        const { error } = await supabase.from('scores').delete().eq('id', id);
        this.handleError(error);
    }

    // --- BAN CHỈ HUY (Leaders) ---
    async getLeaders(): Promise<Leader[]> {
        const { data, error } = await supabase.from('leaders').select('*');
        this.handleError(error);
        return data || [];
    }

    async createLeader(l: Leader) {
        const { error } = await supabase.from('leaders').insert([l]);
        this.handleError(error);
    }

    async updateLeader(id: string, l: Partial<Leader>) {
        const { error } = await supabase.from('leaders').update(l).eq('id', id);
        this.handleError(error);
    }

    async deleteLeader(id: string) {
        const { error } = await supabase.from('leaders').delete().eq('id', id);
        this.handleError(error);
    }

    // --- KHO TÀI LIỆU (Documents) ---
    async getDocuments(): Promise<DocumentFile[]> {
        const { data, error } = await supabase.from('documents').select('*');
        this.handleError(error);
        return (data || []).map(d => ({
            id: d.id,
            name: d.name,
            isFolder: d.is_folder,
            parentId: d.parent_id,
            type: d.type,
            date: d.date,
            size: d.size
        }));
    }

    async createDocument(d: DocumentFile) {
        const payload = {
            id: d.id,
            name: d.name,
            is_folder: d.isFolder,
            parent_id: d.parentId,
            type: d.type,
            date: d.date,
            size: d.size
        };
        const { error } = await supabase.from('documents').insert([payload]);
        this.handleError(error);
    }

    async updateDocument(id: string, d: Partial<DocumentFile>) {
        const payload: any = { ...d };
        if (d.isFolder !== undefined) { payload.is_folder = d.isFolder; delete payload.isFolder; }
        if (d.parentId !== undefined) { payload.parent_id = d.parentId; delete payload.parentId; }
        const { error } = await supabase.from('documents').update(payload).eq('id', id);
        this.handleError(error);
    }

    async deleteDocument(id: string) {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        this.handleError(error);
    }

    // --- MEDIA ---
    async getMedia(): Promise<MediaItem[]> {
        const { data, error } = await supabase.from('media').select('*');
        this.handleError(error);
        return data || [];
    }

    async createMedia(m: MediaItem) {
        const { error } = await supabase.from('media').insert([m]);
        this.handleError(error);
    }

    async updateMedia(id: string, m: Partial<MediaItem>) {
        const { error } = await supabase.from('media').update(m).eq('id', id);
        this.handleError(error);
    }

    async deleteMedia(id: string) {
        const { error } = await supabase.from('media').delete().eq('id', id);
        this.handleError(error);
    }

    // --- QUIZ RESULTS ---
    async getQuizResults(): Promise<QuizResult[]> {
        const { data, error } = await supabase.from('quiz_results').select('*').order('timestamp', { ascending: false });
        this.handleError(error);
        return (data || []).map(r => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name,
            userRank: r.user_rank,
            unit: r.unit,
            topic: r.topic,
            score: r.score,
            totalQuestions: r.total_questions,
            timestamp: r.timestamp
        }));
    }

    async saveQuizResult(r: QuizResult) {
        const payload = {
            id: r.id,
            user_id: r.userId,
            user_name: r.userName,
            user_rank: r.userRank,
            unit: r.unit,
            topic: r.topic,
            score: r.score,
            total_questions: r.totalQuestions,
            timestamp: r.timestamp
        };
        const { error } = await supabase.from('quiz_results').insert([payload]);
        this.handleError(error);
    }

    // --- COMMENTS ---
    async getComments(articleId: string): Promise<Comment[]> {
        const { data, error } = await supabase.from('comments').select('*').eq('article_id', articleId).order('date', { ascending: true });
        this.handleError(error);
        return (data || []).map(c => ({
            id: c.id,
            articleId: c.article_id,
            userId: c.user_id,
            userName: c.user_name,
            userRank: c.user_rank,
            content: c.content,
            date: c.date
        }));
    }

    async addComment(c: Comment) {
        const payload = {
            id: c.id,
            article_id: c.articleId,
            user_id: c.userId,
            user_name: c.userName,
            user_rank: c.userRank,
            content: c.content,
            date: c.date
        };
        const { error } = await supabase.from('comments').insert([payload]);
        this.handleError(error);
    }
}

export const apiService = new ApiClient();
