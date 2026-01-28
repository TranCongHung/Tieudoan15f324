import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';

class ApiClientPHP {
    private baseUrl: string;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private cacheDuration = 5 * 60 * 1000; // 5 minutes cache

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    private getCached(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    private invalidateCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // --- AUTHENTICATION ---
    async login(email: string, password: string): Promise<User | null> {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await this.request('/users', {
                method: 'POST',
                body: formData,
                headers: {}, // Let browser set Content-Type for FormData
            });

            return {
                ...response,
                rank: response.rank_name || response.rank
            } as User;
        } catch (error: any) {
            throw new Error(error.message || 'Đăng nhập thất bại');
        }
    }

    async register(user: User): Promise<boolean> {
        try {
            await this.request('/users', {
                method: 'POST',
                body: JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    rank_name: user.rank,
                    position: user.position,
                    unit: user.unit,
                    password: user.password,
                    role: user.role
                }),
            });
            this.invalidateCache('users');
            return true;
        } catch (error: any) {
            throw new Error(error.message || 'Đăng ký thất bại');
        }
    }

    // --- ARTICLES ---
    async getArticles(): Promise<Article[]> {
        try {
            const cached = this.getCached('articles');
            if (cached) return cached;

            const data = await this.request('/articles');
            const result = (data || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                content: item.content,
                imageUrl: item.image_url || item.imageUrl,
                date: item.date,
                author: item.author
            })) as Article[];

            this.setCache('articles', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải bài viết thất bại');
        }
    }

    async createArticle(article: Article): Promise<void> {
        try {
            await this.request('/articles', {
                method: 'POST',
                body: JSON.stringify({
                    id: article.id,
                    title: article.title,
                    summary: article.summary,
                    content: article.content,
                    image_url: article.imageUrl,
                    date: article.date,
                    author: article.author
                }),
            });
            this.invalidateCache('articles');
        } catch (error: any) {
            throw new Error(error.message || 'Tạo bài viết thất bại');
        }
    }

    async updateArticle(id: string, article: Partial<Article>): Promise<void> {
        try {
            const payload: any = { ...article };
            if (article.imageUrl) {
                payload.image_url = article.imageUrl;
                delete payload.imageUrl;
            }
            
            await this.request(`/articles/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('articles');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật bài viết thất bại');
        }
    }

    async deleteArticle(id: string): Promise<void> {
        try {
            await this.request(`/articles/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('articles');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa bài viết thất bại');
        }
    }

    // --- MILESTONES ---
    async getHistory(): Promise<Milestone[]> {
        try {
            const cached = this.getCached('milestones');
            if (cached) return cached;

            const data = await this.request('/milestones');
            const result = (data || []).map((m: any) => ({
                id: m.id,
                year: m.year,
                title: m.title,
                subtitle: m.subtitle,
                content: m.content,
                image: m.image,
                icon: m.icon,
                story: m.story,
                quiz: m.quiz || [],
                narrationAudio: m.narration_audio
            }));

            this.setCache('milestones', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải lịch sử thất bại');
        }
    }

    async createMilestone(m: Milestone): Promise<void> {
        try {
            const payload: any = {
                id: m.id,
                year: m.year,
                title: m.title,
                subtitle: m.subtitle,
                content: m.content,
                image: m.image,
                icon: m.icon,
                story: m.story,
                quiz: m.quiz
            };
            if (m.narrationAudio) {
                payload.narration_audio = m.narrationAudio;
            }

            await this.request('/milestones', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('milestones');
        } catch (error: any) {
            throw new Error(error.message || 'Tạo mốc lịch sử thất bại');
        }
    }

    async updateMilestone(id: string, m: Partial<Milestone>): Promise<void> {
        try {
            const payload: any = {};
            if (m.id !== undefined) payload.id = m.id;
            if (m.year !== undefined) payload.year = m.year;
            if (m.title !== undefined) payload.title = m.title;
            if (m.subtitle !== undefined) payload.subtitle = m.subtitle;
            if (m.content !== undefined) payload.content = m.content;
            if (m.image !== undefined) payload.image = m.image;
            if (m.icon !== undefined) payload.icon = m.icon;
            if (m.story !== undefined) payload.story = m.story;
            if (m.quiz !== undefined) payload.quiz = m.quiz;
            if (m.narrationAudio !== undefined) payload.narration_audio = m.narrationAudio;

            await this.request(`/milestones/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('milestones');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật mốc lịch sử thất bại');
        }
    }

    async deleteMilestone(id: string): Promise<void> {
        try {
            await this.request(`/milestones/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('milestones');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa mốc lịch sử thất bại');
        }
    }

    // --- USERS ---
    async getUsers(): Promise<User[]> {
        try {
            const cached = this.getCached('users');
            if (cached) return cached;

            const data = await this.request('/users');
            const result = (data || []).map((u: any) => ({
                ...u,
                rank: u.rank_name || u.rank
            })) as User[];

            this.setCache('users', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải người dùng thất bại');
        }
    }

    async createUser(user: User): Promise<void> {
        try {
            await this.request('/users', {
                method: 'POST',
                body: JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    rank_name: user.rank,
                    position: user.position,
                    unit: user.unit,
                    password: user.password,
                    role: user.role
                }),
            });
            this.invalidateCache('users');
        } catch (error: any) {
            throw new Error(error.message || 'Thêm người dùng thất bại');
        }
    }

    async updateUser(id: string, u: Partial<User>): Promise<void> {
        try {
            const payload: any = { ...u };
            if (u.rank) {
                payload.rank_name = u.rank;
                delete payload.rank;
            }

            await this.request(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('users');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật người dùng thất bại');
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await this.request(`/users/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('users');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa người dùng thất bại');
        }
    }

    // --- SETTINGS ---
    async getSettings(): Promise<SiteSettings> {
        try {
            const data = await this.request('/settings');
            return data as SiteSettings;
        } catch (error: any) {
            console.warn('Failed to load settings:', error.message);
            return {} as SiteSettings;
        }
    }

    async saveSettings(settings: SiteSettings): Promise<void> {
        try {
            await this.request('/settings', {
                method: 'POST',
                body: JSON.stringify(settings),
            });
        } catch (error: any) {
            throw new Error(error.message || 'Lưu cấu hình thất bại');
        }
    }

    // --- QUESTIONS ---
    async getQuestions(): Promise<Question[]> {
        try {
            const cached = this.getCached('questions');
            if (cached) return cached;

            const data = await this.request('/questions');
            const result = (data || []).map((q: any) => ({
                id: q.id,
                questionText: q.question_text,
                options: q.options || [],
                correctAnswerIndex: q.correct_answer_index,
                explanation: q.explanation
            }));

            this.setCache('questions', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải câu hỏi thất bại');
        }
    }

    async createQuestion(q: Question): Promise<void> {
        try {
            await this.request('/questions', {
                method: 'POST',
                body: JSON.stringify({
                    id: q.id,
                    question_text: q.questionText,
                    options: q.options,
                    correct_answer_index: q.correctAnswerIndex,
                    explanation: q.explanation
                }),
            });
            this.invalidateCache('questions');
        } catch (error: any) {
            throw new Error(error.message || 'Thêm câu hỏi thất bại');
        }
    }

    async updateQuestion(id: string, q: Partial<Question>): Promise<void> {
        try {
            const payload: any = {};
            if (q.questionText) payload.question_text = q.questionText;
            if (q.options) payload.options = q.options;
            if (q.correctAnswerIndex !== undefined) payload.correct_answer_index = q.correctAnswerIndex;
            if (q.explanation) payload.explanation = q.explanation;

            await this.request(`/questions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('questions');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật câu hỏi thất bại');
        }
    }

    async deleteQuestion(id: string): Promise<void> {
        try {
            await this.request(`/questions/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('questions');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa câu hỏi thất bại');
        }
    }

    // --- SCORES ---
    async getScores(): Promise<Score[]> {
        try {
            const cached = this.getCached('scores');
            if (cached) return cached;

            const data = await this.request('/scores');
            const result = (data || []).map((s: any) => ({
                id: s.id,
                unitName: s.unit_name,
                militaryScore: s.military_score,
                politicalScore: s.political_score,
                logisticsScore: s.logistics_score,
                disciplineScore: s.discipline_score,
                totalScore: s.total_score,
                date: s.date
            }));

            this.setCache('scores', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải điểm số thất bại');
        }
    }

    async createScore(s: Score): Promise<void> {
        try {
            await this.request('/scores', {
                method: 'POST',
                body: JSON.stringify({
                    id: s.id,
                    unit_name: s.unitName,
                    military_score: s.militaryScore,
                    political_score: s.politicalScore,
                    logistics_score: s.logisticsScore,
                    discipline_score: s.disciplineScore,
                    total_score: s.totalScore,
                    date: s.date
                }),
            });
            this.invalidateCache('scores');
        } catch (error: any) {
            throw new Error(error.message || 'Thêm điểm số thất bại');
        }
    }

    async updateScore(id: string, s: Partial<Score>): Promise<void> {
        try {
            const payload: any = {};
            if (s.unitName) payload.unit_name = s.unitName;
            if (s.militaryScore !== undefined) payload.military_score = s.militaryScore;
            if (s.politicalScore !== undefined) payload.political_score = s.politicalScore;
            if (s.logisticsScore !== undefined) payload.logistics_score = s.logisticsScore;
            if (s.disciplineScore !== undefined) payload.discipline_score = s.disciplineScore;
            if (s.totalScore !== undefined) payload.total_score = s.totalScore;
            if (s.date) payload.date = s.date;

            await this.request(`/scores/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('scores');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật điểm số thất bại');
        }
    }

    async deleteScore(id: string): Promise<void> {
        try {
            await this.request(`/scores/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('scores');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa điểm số thất bại');
        }
    }

    // --- DOCUMENTS ---
    async getDocuments(): Promise<DocumentFile[]> {
        try {
            const cached = this.getCached('documents');
            if (cached) return cached;

            const data = await this.request('/documents');
            const result = (data || []).map((d: any) => ({
                id: d.id,
                name: d.name,
                isFolder: d.is_folder,
                parentId: d.parent_id,
                type: d.type,
                date: d.date,
                size: d.size
            }));

            this.setCache('documents', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải tài liệu thất bại');
        }
    }

    async createDocument(d: DocumentFile): Promise<void> {
        try {
            await this.request('/documents', {
                method: 'POST',
                body: JSON.stringify({
                    id: d.id,
                    name: d.name,
                    is_folder: d.isFolder,
                    parent_id: d.parentId,
                    type: d.type,
                    date: d.date,
                    size: d.size
                }),
            });
            this.invalidateCache('documents');
        } catch (error: any) {
            throw new Error(error.message || 'Thêm tài liệu thất bại');
        }
    }

    async updateDocument(id: string, d: Partial<DocumentFile>): Promise<void> {
        try {
            const payload: any = { ...d };
            if (d.isFolder !== undefined) { 
                payload.is_folder = d.isFolder; 
                delete payload.isFolder; 
            }
            if (d.parentId !== undefined) { 
                payload.parent_id = d.parentId; 
                delete payload.parentId; 
            }

            await this.request(`/documents/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            this.invalidateCache('documents');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật tài liệu thất bại');
        }
    }

    async deleteDocument(id: string): Promise<void> {
        try {
            await this.request(`/documents/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('documents');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa tài liệu thất bại');
        }
    }

    // --- LEADERS ---
    async getLeaders(): Promise<Leader[]> {
        try {
            const cached = this.getCached('leaders');
            if (cached) return cached;

            const data = await this.request('/leaders');
            const result = data || [];

            this.setCache('leaders', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải ban chỉ huy thất bại');
        }
    }

    async createLeader(leader: Leader): Promise<void> {
        try {
            await this.request('/leaders', {
                method: 'POST',
                body: JSON.stringify(leader),
            });
            this.invalidateCache('leaders');
        } catch (error: any) {
            throw new Error(error.message || 'Thêm cán bộ thất bại');
        }
    }

    async updateLeader(id: string, leader: Partial<Leader>): Promise<void> {
        try {
            await this.request(`/leaders/${id}`, {
                method: 'PUT',
                body: JSON.stringify(leader),
            });
            this.invalidateCache('leaders');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật cán bộ thất bại');
        }
    }

    async deleteLeader(id: string): Promise<void> {
        try {
            await this.request(`/leaders/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('leaders');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa cán bộ thất bại');
        }
    }

    // --- MEDIA ---
    async getMedia(): Promise<MediaItem[]> {
        try {
            const cached = this.getCached('media');
            if (cached) return cached;

            const data = await this.request('/media');
            const result = data || [];

            this.setCache('media', result);
            return result;
        } catch (error: any) {
            throw new Error(error.message || 'Tải thư viện media thất bại');
        }
    }

    async createMedia(m: MediaItem): Promise<void> {
        try {
            await this.request('/media', {
                method: 'POST',
                body: JSON.stringify(m),
            });
            this.invalidateCache('media');
        } catch (error: any) {
            throw new Error(error.message || 'Thêm media thất bại');
        }
    }

    async updateMedia(id: string, m: Partial<MediaItem>): Promise<void> {
        try {
            await this.request(`/media/${id}`, {
                method: 'PUT',
                body: JSON.stringify(m),
            });
            this.invalidateCache('media');
        } catch (error: any) {
            throw new Error(error.message || 'Cập nhật media thất bại');
        }
    }

    async deleteMedia(id: string): Promise<void> {
        try {
            await this.request(`/media/${id}`, {
                method: 'DELETE',
            });
            this.invalidateCache('media');
        } catch (error: any) {
            throw new Error(error.message || 'Xóa media thất bại');
        }
    }

    // --- QUIZ RESULTS ---
    async getQuizResults(): Promise<QuizResult[]> {
        try {
            const data = await this.request('/quiz-results');
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
        } catch (error: any) {
            throw new Error(error.message || 'Tải kết quả thi thất bại');
        }
    }

    async saveQuizResult(r: QuizResult): Promise<void> {
        try {
            await this.request('/quiz-results', {
                method: 'POST',
                body: JSON.stringify({
                    id: r.id,
                    user_id: r.userId,
                    user_name: r.userName,
                    user_rank: r.userRank,
                    unit: r.unit,
                    topic: r.topic,
                    score: r.score,
                    total_questions: r.totalQuestions,
                    timestamp: r.timestamp
                }),
            });
        } catch (error: any) {
            throw new Error(error.message || 'Lưu kết quả thi thất bại');
        }
    }

    // --- COMMENTS ---
    async getComments(articleId: string): Promise<Comment[]> {
        try {
            const data = await this.request(`/comments?articleId=${articleId}`);
            return (data || []).map((c: any) => ({
                id: c.id,
                articleId: c.article_id,
                userId: c.user_id,
                userName: c.user_name,
                userRank: c.user_rank,
                content: c.content,
                date: c.date
            }));
        } catch (error: any) {
            throw new Error(error.message || 'Tải bình luận thất bại');
        }
    }

    async addComment(c: Comment): Promise<void> {
        try {
            await this.request('/comments', {
                method: 'POST',
                body: JSON.stringify({
                    id: c.id,
                    article_id: c.articleId,
                    user_id: c.userId,
                    user_name: c.userName,
                    user_rank: c.userRank,
                    content: c.content,
                    date: c.date
                }),
            });
        } catch (error: any) {
            throw new Error(error.message || 'Thêm bình luận thất bại');
        }
    }

    // --- READ HISTORY ---
    async markMilestoneAsRead(userId: string, userName: string, userRank: string, unit: string, milestoneId: string, milestoneTitle: string): Promise<void> {
        try {
            await this.request('/read-history/mark', {
                method: 'POST',
                body: JSON.stringify({
                    userId,
                    userName,
                    userRank,
                    unit,
                    milestoneId,
                    milestoneTitle
                }),
            });
            console.log('✅ Đã ghi nhận thành công: người dùng', userName, 'đã đọc', milestoneTitle);
        } catch (error: any) {
            console.error('❌ Lỗi ghi nhận đã đọc:', error.message);
            throw new Error(error.message || 'Ghi nhận đã đọc thất bại');
        }
    }

    async checkUserHasReadMilestone(userId: string, milestoneId: string): Promise<boolean> {
        try {
            const data = await this.request(`/read-history/check/${userId}/${milestoneId}`);
            return data.hasRead || false;
        } catch (error: any) {
            console.error('❌ Lỗi kiểm tra lịch sử đọc:', error.message);
            return false;
        }
    }
}

export const apiClientPHP = new ApiClientPHP();
export default ApiClientPHP;
