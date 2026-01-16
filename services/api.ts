import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';

const API_URL = 'http://localhost:5000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

export const apiService = {
    // Articles
    getArticles: () => fetchApi<Article[]>('/articles'),
    createArticle: (article: Article) => fetchApi('/articles', { method: 'POST', body: JSON.stringify(article) }),
    updateArticle: (id: string, article: Article) => fetchApi(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(article) }),
    deleteArticle: (id: string) => fetchApi(`/articles/${id}`, { method: 'DELETE' }),

    // Users
    getUsers: () => fetchApi<User[]>('/users'),
    createUser: (user: User) => fetchApi('/users', { method: 'POST', body: JSON.stringify(user) }),
    updateUser: (id: string, user: User) => fetchApi(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
    deleteUser: (id: string) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
    login: (email: string, pass: string) => fetchApi<User>('/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) }),
    register: (user: User) => fetchApi('/users', { method: 'POST', body: JSON.stringify(user) }),

    // Milestones (History)
    getHistory: () => fetchApi<Milestone[]>('/milestones'),
    createMilestone: (data: Milestone) => fetchApi('/milestones', { method: 'POST', body: JSON.stringify(data) }),
    updateMilestone: (id: string, data: Milestone) => fetchApi(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMilestone: (id: string) => fetchApi(`/milestones/${id}`, { method: 'DELETE' }),

    // Questions
    getQuestions: () => fetchApi<Question[]>('/questions'),
    createQuestion: (data: Question) => fetchApi('/questions', { method: 'POST', body: JSON.stringify(data) }),
    updateQuestion: (id: string, data: Question) => fetchApi(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteQuestion: (id: string) => fetchApi(`/questions/${id}`, { method: 'DELETE' }),

    // Scores
    getScores: () => fetchApi<Score[]>('/scores'),
    createScore: (data: Score) => fetchApi('/scores', { method: 'POST', body: JSON.stringify(data) }),
    updateScore: (id: string, data: Score) => fetchApi(`/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteScore: (id: string) => fetchApi(`/scores/${id}`, { method: 'DELETE' }),

    // Documents
    getDocuments: () => fetchApi<DocumentFile[]>('/documents'),
    createDocument: (data: DocumentFile) => fetchApi('/documents', { method: 'POST', body: JSON.stringify(data) }),
    updateDocument: (id: string, data: Partial<DocumentFile>) => fetchApi(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDocument: (id: string) => fetchApi(`/documents/${id}`, { method: 'DELETE' }),

    // Media
    getMedia: () => fetchApi<MediaItem[]>('/media'),
    createMedia: (data: MediaItem) => fetchApi('/media', { method: 'POST', body: JSON.stringify(data) }),
    updateMedia: (id: string, data: MediaItem) => fetchApi(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMedia: (id: string) => fetchApi(`/media/${id}`, { method: 'DELETE' }),

    // Leaders
    getLeaders: () => fetchApi<Leader[]>('/leaders'),
    createLeader: (data: Leader) => fetchApi('/leaders', { method: 'POST', body: JSON.stringify(data) }),
    updateLeader: (id: string, data: Leader) => fetchApi(`/leaders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLeader: (id: string) => fetchApi(`/leaders/${id}`, { method: 'DELETE' }),

    // Settings
    getSettings: () => fetchApi<SiteSettings>('/settings'),
    saveSettings: (settings: SiteSettings) => fetchApi('/settings', { method: 'POST', body: JSON.stringify(settings) }),

    // Quiz Results
    getQuizResults: () => fetchApi<QuizResult[]>('/quiz-results'),
    saveQuizResult: (result: QuizResult) => fetchApi('/quiz-results', { method: 'POST', body: JSON.stringify(result) }),
    
    // Comments
    getComments: (articleId: string) => fetchApi<Comment[]>(`/comments?articleId=${articleId}`),
    addComment: (comment: Comment) => fetchApi('/comments', { method: 'POST', body: JSON.stringify(comment) }),
};
