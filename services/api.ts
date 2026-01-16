import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';
import { storage } from './storage';

const API_URL = 'http://localhost:5000/api';

// Biến trạng thái kết nối Backend. 
// Mặc định là true (thử kết nối). Nếu thất bại 1 lần sẽ chuyển sang false (Offline Mode).
let isBackendOnline = true;

// Hàm helper để gọi API với cơ chế tự động chuyển sang LocalStorage nếu lỗi
async function withFallback<T>(
    apiCall: () => Promise<T>, 
    fallback: () => T | Promise<T>
): Promise<T> {
    // Nếu đã biết Backend offline, dùng ngay LocalStorage để không gây lag/lỗi console
    if (!isBackendOnline) {
        return Promise.resolve(fallback());
    }

    try {
        return await apiCall();
    } catch (error) {
        // Chỉ log warning 1 lần duy nhất khi bắt đầu mất kết nối
        if (isBackendOnline) {
            console.info("%cBackend không phản hồi. Chuyển sang chế độ Offline (LocalStorage).", "color: orange; font-weight: bold;");
            isBackendOnline = false;
        }
        return Promise.resolve(fallback());
    }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Kiểm tra nhanh để tránh gọi fetch nếu đã biết offline
    if (!isBackendOnline) throw new Error("Backend offline");

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
}

export const apiService = {
    // --- Articles ---
    getArticles: () => withFallback(
        () => fetchApi<Article[]>('/articles'),
        () => storage.getArticles()
    ),
    createArticle: (article: Article) => withFallback(
        () => fetchApi('/articles', { method: 'POST', body: JSON.stringify(article) }),
        () => {
            const data = storage.getArticles();
            storage.saveArticles([article, ...data]);
            return { message: 'Saved locally' };
        }
    ),
    updateArticle: (id: string, article: Article) => withFallback(
        () => fetchApi(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(article) }),
        () => {
            const data = storage.getArticles().map(a => a.id === id ? article : a);
            storage.saveArticles(data);
            return { message: 'Updated locally' };
        }
    ),
    deleteArticle: (id: string) => withFallback(
        () => fetchApi(`/articles/${id}`, { method: 'DELETE' }),
        () => {
            const data = storage.getArticles().filter(a => a.id !== id);
            storage.saveArticles(data);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Users ---
    getUsers: () => withFallback(
        () => fetchApi<User[]>('/users'),
        () => storage.getUsers()
    ),
    createUser: (user: User) => withFallback(
        () => fetchApi('/users', { method: 'POST', body: JSON.stringify(user) }),
        () => {
            storage.createUser(user);
            return { message: 'Created locally' };
        }
    ),
    updateUser: (id: string, user: User) => withFallback(
        () => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
        () => {
            const data = storage.getUsers().map(u => u.id === id ? user : u);
            storage.saveUsers(data);
            return { message: 'Updated locally' };
        }
    ),
    deleteUser: (id: string) => withFallback(
        () => fetchApi(`/users/${id}`, { method: 'DELETE' }),
        () => {
            const data = storage.getUsers().filter(u => u.id !== id);
            storage.saveUsers(data);
            return { message: 'Deleted locally' };
        }
    ),
    login: (email: string, pass: string) => withFallback(
        () => fetchApi<User>('/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) }),
        () => {
            const users = storage.getUsers();
            const found = users.find(u => u.email === email && u.password === pass);
            if (found) return found;
            throw new Error('Invalid credentials');
        }
    ),
    register: (user: User) => withFallback(
        () => fetchApi('/users', { method: 'POST', body: JSON.stringify(user) }),
        () => {
            storage.createUser(user);
            return { message: 'Registered locally' };
        }
    ),

    // --- Milestones (History) ---
    getHistory: () => withFallback(
        () => fetchApi<Milestone[]>('/milestones'),
        () => storage.getHistory()
    ),
    createMilestone: (data: Milestone) => withFallback(
        () => fetchApi('/milestones', { method: 'POST', body: JSON.stringify(data) }),
        () => {
            const list = storage.getHistory();
            // Sort by year loosely
            const newList = [...list, data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
            storage.saveHistory(newList);
            return { message: 'Saved locally' };
        }
    ),
    updateMilestone: (id: string, data: Milestone) => withFallback(
        () => fetchApi(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        () => {
            const list = storage.getHistory().map(m => m.id === id ? data : m);
            storage.saveHistory(list);
            return { message: 'Updated locally' };
        }
    ),
    deleteMilestone: (id: string) => withFallback(
        () => fetchApi(`/milestones/${id}`, { method: 'DELETE' }),
        () => {
            const list = storage.getHistory().filter(m => m.id !== id);
            storage.saveHistory(list);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Questions ---
    getQuestions: () => withFallback(
        () => fetchApi<Question[]>('/questions'),
        () => storage.getQuestions()
    ),
    createQuestion: (data: Question) => withFallback(
        () => fetchApi('/questions', { method: 'POST', body: JSON.stringify(data) }),
        () => {
            const list = storage.getQuestions();
            storage.saveQuestions([...list, data]);
            return { message: 'Saved locally' };
        }
    ),
    updateQuestion: (id: string, data: Question) => withFallback(
        () => fetchApi(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        () => {
            const list = storage.getQuestions().map(q => q.id === id ? data : q);
            storage.saveQuestions(list);
            return { message: 'Updated locally' };
        }
    ),
    deleteQuestion: (id: string) => withFallback(
        () => fetchApi(`/questions/${id}`, { method: 'DELETE' }),
        () => {
            const list = storage.getQuestions().filter(q => q.id !== id);
            storage.saveQuestions(list);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Scores ---
    getScores: () => withFallback(
        () => fetchApi<Score[]>('/scores'),
        () => storage.getScores()
    ),
    createScore: (data: Score) => withFallback(
        () => fetchApi('/scores', { method: 'POST', body: JSON.stringify(data) }),
        () => {
            const list = storage.getScores();
            storage.saveScores([...list, data]);
            return { message: 'Saved locally' };
        }
    ),
    updateScore: (id: string, data: Score) => withFallback(
        () => fetchApi(`/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        () => {
            const list = storage.getScores().map(s => s.id === id ? data : s);
            storage.saveScores(list);
            return { message: 'Updated locally' };
        }
    ),
    deleteScore: (id: string) => withFallback(
        () => fetchApi(`/scores/${id}`, { method: 'DELETE' }),
        () => {
            const list = storage.getScores().filter(s => s.id !== id);
            storage.saveScores(list);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Documents ---
    getDocuments: () => withFallback(
        () => fetchApi<DocumentFile[]>('/documents'),
        () => storage.getDocuments()
    ),
    createDocument: (data: DocumentFile) => withFallback(
        () => fetchApi('/documents', { method: 'POST', body: JSON.stringify(data) }),
        () => {
            const list = storage.getDocuments();
            storage.saveDocuments([...list, data]);
            return { message: 'Saved locally' };
        }
    ),
    updateDocument: (id: string, data: Partial<DocumentFile>) => withFallback(
        () => fetchApi(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        () => {
            const list = storage.getDocuments().map(d => d.id === id ? { ...d, ...data } : d);
            storage.saveDocuments(list);
            return { message: 'Updated locally' };
        }
    ),
    deleteDocument: (id: string) => withFallback(
        () => fetchApi(`/documents/${id}`, { method: 'DELETE' }),
        () => {
            const list = storage.getDocuments().filter(d => d.id !== id);
            storage.saveDocuments(list);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Media ---
    getMedia: () => withFallback(
        () => fetchApi<MediaItem[]>('/media'),
        () => storage.getMedia()
    ),
    createMedia: (data: MediaItem) => withFallback(
        () => fetchApi('/media', { method: 'POST', body: JSON.stringify(data) }),
        () => {
            const list = storage.getMedia();
            storage.saveMedia([data, ...list]);
            return { message: 'Saved locally' };
        }
    ),
    updateMedia: (id: string, data: MediaItem) => withFallback(
        () => fetchApi(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        () => {
            const list = storage.getMedia().map(m => m.id === id ? data : m);
            storage.saveMedia(list);
            return { message: 'Updated locally' };
        }
    ),
    deleteMedia: (id: string) => withFallback(
        () => fetchApi(`/media/${id}`, { method: 'DELETE' }),
        () => {
            const list = storage.getMedia().filter(m => m.id !== id);
            storage.saveMedia(list);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Leaders ---
    getLeaders: () => withFallback(
        () => fetchApi<Leader[]>('/leaders'),
        () => storage.getLeaders()
    ),
    createLeader: (data: Leader) => withFallback(
        () => fetchApi('/leaders', { method: 'POST', body: JSON.stringify(data) }),
        () => {
            const list = storage.getLeaders();
            storage.saveLeaders([...list, data]);
            return { message: 'Saved locally' };
        }
    ),
    updateLeader: (id: string, data: Leader) => withFallback(
        () => fetchApi(`/leaders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        () => {
            const list = storage.getLeaders().map(l => l.id === id ? data : l);
            storage.saveLeaders(list);
            return { message: 'Updated locally' };
        }
    ),
    deleteLeader: (id: string) => withFallback(
        () => fetchApi(`/leaders/${id}`, { method: 'DELETE' }),
        () => {
            const list = storage.getLeaders().filter(l => l.id !== id);
            storage.saveLeaders(list);
            return { message: 'Deleted locally' };
        }
    ),

    // --- Settings ---
    getSettings: () => withFallback(
        () => fetchApi<SiteSettings>('/settings'),
        () => storage.getSettings()
    ),
    saveSettings: (settings: SiteSettings) => withFallback(
        () => fetchApi('/settings', { method: 'POST', body: JSON.stringify(settings) }),
        () => {
            storage.saveSettings(settings);
            return { message: 'Saved locally' };
        }
    ),

    // --- Quiz Results ---
    getQuizResults: () => withFallback(
        () => fetchApi<QuizResult[]>('/quiz-results'),
        () => storage.getQuizResults()
    ),
    saveQuizResult: (result: QuizResult) => withFallback(
        () => fetchApi('/quiz-results', { method: 'POST', body: JSON.stringify(result) }),
        () => {
            storage.saveQuizResult(result);
            return { message: 'Saved locally' };
        }
    ),
    
    // --- Comments ---
    getComments: (articleId: string) => withFallback(
        () => fetchApi<Comment[]>(`/comments?articleId=${articleId}`),
        () => storage.getComments(articleId)
    ),
    addComment: (comment: Comment) => withFallback(
        () => fetchApi('/comments', { method: 'POST', body: JSON.stringify(comment) }),
        () => {
            storage.addComment(comment);
            return { message: 'Saved locally' };
        }
    ),
};
