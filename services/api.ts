<<<<<<< HEAD

import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';
import { storage } from './storage';

const API_URL = 'http://localhost:5000/api';

/**
 * Lớp Dịch vụ API - Trung tâm điều phối dữ liệu
 */
class ApiClient {
    private isOnline = true;

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.isOnline = true;
            return await response.json();
        } catch (error) {
            console.error(`[API ERROR] Endpoint ${endpoint}:`, error);
            this.isOnline = false;
            throw error;
        }
    }

    private async callWithFallback<T>(apiFunc: () => Promise<T>, storageFunc: () => T | Promise<T>): Promise<T> {
        try {
            return await apiFunc();
        } catch (e) {
            console.warn("[FALLBACK] Sử dụng LocalStorage");
            return storageFunc();
        }
    }

    // --- Articles ---
    getArticles = () => this.callWithFallback(() => this.request<Article[]>('/articles'), () => storage.getArticles());
    createArticle = (data: Article) => this.request('/articles', { method: 'POST', body: JSON.stringify(data) });
    updateArticle = (id: string, data: Article) => this.request(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteArticle = (id: string) => this.request(`/articles/${id}`, { method: 'DELETE' });

    // --- History ---
    getHistory = () => this.callWithFallback(() => this.request<Milestone[]>('/milestones'), () => storage.getHistory());
    createMilestone = (data: Milestone) => this.request('/milestones', { method: 'POST', body: JSON.stringify(data) });
    updateMilestone = (id: string, data: Milestone) => this.request(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteMilestone = (id: string) => this.request(`/milestones/${id}`, { method: 'DELETE' });

    // --- Questions ---
    getQuestions = () => this.callWithFallback(() => this.request<Question[]>('/questions'), () => storage.getQuestions());
    createQuestion = (data: Question) => this.request('/questions', { method: 'POST', body: JSON.stringify(data) });
    updateQuestion = (id: string, data: Question) => this.request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteQuestion = (id: string) => this.request(`/questions/${id}`, { method: 'DELETE' });

    // --- Settings ---
    getSettings = () => this.callWithFallback(() => this.request<SiteSettings>('/settings'), () => storage.getSettings());
    saveSettings = (data: SiteSettings) => this.request('/settings', { method: 'POST', body: JSON.stringify(data) });

    // --- Users ---
    getUsers = () => this.request<User[]>('/users');
    createUser = (data: User) => this.request('/users', { method: 'POST', body: JSON.stringify(data) });
    updateUser = (id: string, data: User) => this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteUser = (id: string) => this.request(`/users/${id}`, { method: 'DELETE' });
    login = (email: string, pass: string) => this.request<User>('/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });

    // --- Others (Leaders, Media, Scores, Docs, Comments, Results) ---
    getLeaders = () => this.callWithFallback(() => this.request<Leader[]>('/leaders'), () => storage.getLeaders());
    createLeader = (data: Leader) => this.request('/leaders', { method: 'POST', body: JSON.stringify(data) });
    updateLeader = (id: string, data: Leader) => this.request(`/leaders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteLeader = (id: string) => this.request(`/leaders/${id}`, { method: 'DELETE' });

    getMedia = () => this.callWithFallback(() => this.request<MediaItem[]>('/media'), () => storage.getMedia());
    createMedia = (data: MediaItem) => this.request('/media', { method: 'POST', body: JSON.stringify(data) });
    updateMedia = (id: string, data: MediaItem) => this.request(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteMedia = (id: string) => this.request(`/media/${id}`, { method: 'DELETE' });

    getScores = () => this.callWithFallback(() => this.request<Score[]>('/scores'), () => storage.getScores());
    createScore = (data: Score) => this.request('/scores', { method: 'POST', body: JSON.stringify(data) });
    updateScore = (id: string, data: Score) => this.request(`/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteScore = (id: string) => this.request(`/scores/${id}`, { method: 'DELETE' });

    getDocuments = () => this.callWithFallback(() => this.request<DocumentFile[]>('/documents'), () => storage.getDocuments());
    createDocument = (data: DocumentFile) => this.request('/documents', { method: 'POST', body: JSON.stringify(data) });
    updateDocument = (id: string, data: DocumentFile) => this.request(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    deleteDocument = (id: string) => this.request(`/documents/${id}`, { method: 'DELETE' });

    getQuizResults = () => this.request<QuizResult[]>('/quiz-results');
    saveQuizResult = (data: QuizResult) => this.request('/quiz-results', { method: 'POST', body: JSON.stringify(data) });

    getComments = (articleId: string) => this.request<Comment[]>(`/comments?articleId=${articleId}`);
    addComment = (data: Comment) => this.request('/comments', { method: 'POST', body: JSON.stringify(data) });
}

export const apiService = new ApiClient();
=======
>>>>>>> 722ff39 (feat: Rebuild authentication system with enhanced security and user experience)
