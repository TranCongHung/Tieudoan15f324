
import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';
import { supabase } from './supabase';

class ApiClient {
    /**
     * Hàm bóc tách lỗi "Cú chốt": Chống lại [object Object] 100%
     */
    private parseError(error: any, context: string): string {
        if (!error) return `${context}: Lỗi không xác định.`;
        
        console.error(`[DEBUG API] ${context}:`, error);

        let message = "";

        if (typeof error === 'string') {
            message = error;
        } else if (error.message) {
            // Nếu là object lỗi của Supabase
            message = error.message;
            if (error.details) message += ` (Chi tiết: ${error.details})`;
            if (error.hint) message += ` - Gợi ý: ${error.hint}`;
        } else {
            // Nếu là object lạ, ép kiểu sang JSON string để đọc được nội dung
            try {
                message = JSON.stringify(error);
            } catch (e) {
                message = String(error);
            }
        }

        // Kiểm tra các lỗi bảo mật/cấu hình phổ biến
        if (message.includes("Invalid API key") || message.includes("JWT") || message.includes("MISSING_KEY")) {
            return `LỖI CẤU HÌNH: Khóa API (Supabase Key) không hợp lệ hoặc chưa được thiết lập trên Vercel. Vui lòng kiểm tra lại biến môi trường API_KEY.`;
        }

        if (message.includes("failed to fetch") || message.includes("NetworkError")) {
            return `${context}: Lỗi kết nối mạng hoặc Supabase đang bị chặn.`;
        }

        return `${context}: ${message}`;
    }

    // --- AUTHENTICATION ---
    async login(email: string, pass: string): Promise<User | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', pass)
                .maybeSingle();
            
            if (error) throw new Error(this.parseError(error, "Đăng nhập"));
            if (!data) return null;

            return {
                ...data,
                rank: data.rank_name || data.rank
            } as User;
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async register(user: User): Promise<boolean> {
        try {
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
            if (error) throw new Error(this.parseError(error, "Đăng ký"));
            return true;
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- BÀI VIẾT (Articles) ---
    async getArticles(): Promise<Article[]> {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('date', { ascending: false });
            
            if (error) throw new Error(this.parseError(error, "Tải bài viết"));

            return (data || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                content: item.content,
                imageUrl: item.image_url || item.imageUrl,
                date: item.date,
                author: item.author
            })) as Article[];
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createArticle(article: Article) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Tạo bài viết"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateArticle(id: string, article: Partial<Article>) {
        try {
            const payload: any = { ...article };
            if (article.imageUrl) {
                payload.image_url = article.imageUrl;
                delete payload.imageUrl;
            }
            const { error } = await supabase.from('articles').update(payload).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật bài viết"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteArticle(id: string) {
        try {
            const { error } = await supabase.from('articles').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa bài viết"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- LỊCH SỬ (Milestones) ---
    async getHistory(): Promise<Milestone[]> {
        try {
            const { data, error } = await supabase
                .from('milestones')
                .select('*')
                .order('year', { ascending: true });
            
            if (error) throw new Error(this.parseError(error, "Tải lịch sử"));

            return (data || []).map((m: any) => ({
                ...m,
                quiz: typeof m.quiz === 'string' ? JSON.parse(m.quiz) : (m.quiz || [])
            }));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createMilestone(m: Milestone) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Tạo mốc lịch sử"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateMilestone(id: string, m: Partial<Milestone>) {
        try {
            const payload: any = { ...m };
            if (m.quiz) payload.quiz = JSON.stringify(m.quiz);
            const { error } = await supabase.from('milestones').update(payload).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật mốc lịch sử"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteMilestone(id: string) {
        try {
            const { error } = await supabase.from('milestones').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa mốc lịch sử"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- NGƯỜI DÙNG (Personnel) ---
    async getUsers(): Promise<User[]> {
        try {
            const { data, error } = await supabase.from('users').select('*');
            if (error) throw new Error(this.parseError(error, "Tải người dùng"));
            return (data || []).map((u: any) => ({
                ...u,
                rank: u.rank_name || u.rank
            })) as User[];
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createUser(user: User) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Thêm người dùng"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateUser(id: string, u: Partial<User>) {
        try {
            const payload: any = { ...u };
            if (u.rank) {
                payload.rank_name = u.rank;
                delete payload.rank;
            }
            const { error } = await supabase.from('users').update(payload).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật người dùng"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteUser(id: string) {
        try {
            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa người dùng"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- CẤU HÌNH (Settings) ---
    async getSettings(): Promise<SiteSettings> {
        try {
            const { data, error } = await supabase.from('settings').select('*');
            if (error) return {} as SiteSettings;
            const obj: any = {};
            data.forEach((item: any) => { obj[item.setting_key] = item.setting_value; });
            return obj as SiteSettings;
        } catch (error) {
            return {} as SiteSettings;
        }
    }

    async saveSettings(settings: SiteSettings) {
        try {
            const entries = Object.entries(settings).map(([key, value]) => ({ 
                setting_key: key, 
                setting_value: String(value) 
            }));
            const { error } = await supabase.from('settings').upsert(entries, { onConflict: 'setting_key' });
            if (error) throw new Error(this.parseError(error, "Lưu cấu hình"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- CÂU HỎI (Questions) ---
    async getQuestions(): Promise<Question[]> {
        try {
            const { data, error } = await supabase.from('questions').select('*');
            if (error) throw new Error(this.parseError(error, "Tải câu hỏi"));
            return (data || []).map((q: any) => ({
                id: q.id,
                questionText: q.question_text,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                correctAnswerIndex: q.correct_answer_index,
                explanation: q.explanation
            }));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createQuestion(q: Question) {
        try {
            const payload = {
                id: q.id,
                question_text: q.questionText,
                options: JSON.stringify(q.options),
                correct_answer_index: q.correctAnswerIndex,
                explanation: q.explanation
            };
            const { error } = await supabase.from('questions').insert([payload]);
            if (error) throw new Error(this.parseError(error, "Thêm câu hỏi"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateQuestion(id: string, q: Partial<Question>) {
        try {
            const payload: any = {};
            if (q.questionText) payload.question_text = q.questionText;
            if (q.options) payload.options = JSON.stringify(q.options);
            if (q.correctAnswerIndex !== undefined) payload.correct_answer_index = q.correctAnswerIndex;
            if (q.explanation) payload.explanation = q.explanation;
            const { error } = await supabase.from('questions').update(payload).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật câu hỏi"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteQuestion(id: string) {
        try {
            const { error } = await supabase.from('questions').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa câu hỏi"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- ĐIỂM SỐ (Scores) ---
    async getScores(): Promise<Score[]> {
        try {
            const { data, error } = await supabase.from('scores').select('*').order('date', { ascending: false });
            if (error) throw new Error(this.parseError(error, "Tải điểm số"));
            return (data || []).map((s: any) => ({
                id: s.id,
                unitName: s.unit_name,
                militaryScore: s.military_score,
                politicalScore: s.political_score,
                logisticsScore: s.logistics_score,
                disciplineScore: s.discipline_score,
                totalScore: s.total_score,
                date: s.date
            }));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createScore(s: Score) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Thêm điểm số"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateScore(id: string, s: Partial<Score>) {
        try {
            const payload: any = {};
            if (s.unitName) payload.unit_name = s.unitName;
            if (s.militaryScore !== undefined) payload.military_score = s.militaryScore;
            if (s.politicalScore !== undefined) payload.political_score = s.politicalScore;
            if (s.logisticsScore !== undefined) payload.logistics_score = s.logisticsScore;
            if (s.disciplineScore !== undefined) payload.discipline_score = s.disciplineScore;
            if (s.totalScore !== undefined) payload.total_score = s.totalScore;
            if (s.date) payload.date = s.date;
            const { error } = await supabase.from('scores').update(payload).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật điểm số"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteScore(id: string) {
        try {
            const { error } = await supabase.from('scores').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa điểm số"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- KHO TÀI LIỆU (Documents) ---
    async getDocuments(): Promise<DocumentFile[]> {
        try {
            const { data, error } = await supabase.from('documents').select('*');
            if (error) throw new Error(this.parseError(error, "Tải tài liệu"));
            return (data || []).map((d: any) => ({
                id: d.id,
                name: d.name,
                isFolder: d.is_folder,
                parentId: d.parent_id,
                type: d.type,
                date: d.date,
                size: d.size
            }));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createDocument(d: DocumentFile) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Thêm tài liệu"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateDocument(id: string, d: Partial<DocumentFile>) {
        try {
            const payload: any = { ...d };
            if (d.isFolder !== undefined) { payload.is_folder = d.isFolder; delete payload.isFolder; }
            if (d.parentId !== undefined) { payload.parent_id = d.parentId; delete payload.parentId; }
            const { error } = await supabase.from('documents').update(payload).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật tài liệu"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteDocument(id: string) {
        try {
            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa tài liệu"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- BAN CHỈ HUY (Leaders) ---
    async getLeaders(): Promise<Leader[]> {
        try {
            const { data, error } = await supabase.from('leaders').select('*');
            if (error) throw new Error(this.parseError(error, "Tải ban chỉ huy"));
            return data || [];
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createLeader(leader: Leader) {
        try {
            const { error } = await supabase.from('leaders').insert([leader]);
            if (error) throw new Error(this.parseError(error, "Thêm cán bộ"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateLeader(id: string, leader: Partial<Leader>) {
        try {
            const { error } = await supabase.from('leaders').update(leader).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật cán bộ"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteLeader(id: string) {
        try {
            const { error } = await supabase.from('leaders').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa cán bộ"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- MEDIA ---
    async getMedia(): Promise<MediaItem[]> {
        try {
            const { data, error } = await supabase.from('media').select('*');
            if (error) throw new Error(this.parseError(error, "Tải thư viện media"));
            return data || [];
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async createMedia(m: MediaItem) {
        try {
            const { error } = await supabase.from('media').insert([m]);
            if (error) throw new Error(this.parseError(error, "Thêm media"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateMedia(id: string, m: Partial<MediaItem>) {
        try {
            const { error } = await supabase.from('media').update(m).eq('id', id);
            if (error) throw new Error(this.parseError(error, "Cập nhật media"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async deleteMedia(id: string) {
        try {
            const { error } = await supabase.from('media').delete().eq('id', id);
            if (error) throw new Error(this.parseError(error, "Xóa media"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- QUIZ RESULTS ---
    async getQuizResults(): Promise<QuizResult[]> {
        try {
            const { data, error } = await supabase.from('quiz_results').select('*').order('timestamp', { ascending: false });
            if (error) throw new Error(this.parseError(error, "Tải kết quả thi"));
            return (data || []).map((r: any) => ({
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
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async saveQuizResult(r: QuizResult) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Lưu kết quả thi"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    // --- COMMENTS ---
    async getComments(articleId: string): Promise<Comment[]> {
        try {
            const { data, error } = await supabase.from('comments').select('*').eq('article_id', articleId).order('date', { ascending: true });
            if (error) throw new Error(this.parseError(error, "Tải bình luận"));
            return (data || []).map((c: any) => ({
                id: c.id,
                articleId: c.article_id,
                userId: c.user_id,
                userName: c.user_name,
                userRank: c.user_rank,
                content: c.content,
                date: c.date
            }));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addComment(c: Comment) {
        try {
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
            if (error) throw new Error(this.parseError(error, "Thêm bình luận"));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}

export const apiService = new ApiClient();
