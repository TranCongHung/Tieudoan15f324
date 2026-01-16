import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment } from '../types';

const API_URL = 'http://localhost:5000/api';

// Hàm helper để gọi API
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
    saveArticle: (article: Article) => fetchApi('/articles', { method: 'POST', body: JSON.stringify(article) }),
    deleteArticle: (id: string) => fetchApi(`/articles/${id}`, { method: 'DELETE' }),

    // Users (Auth)
    login: (email: string, pass: string) => fetchApi<User>('/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) }),
    register: (user: User) => fetchApi('/users', { method: 'POST', body: JSON.stringify(user) }),
    getUsers: () => fetchApi<User[]>('/users'),

    // History
    getHistory: () => fetchApi<Milestone[]>('/milestones'),
    saveHistory: (data: Milestone[]) => fetchApi('/milestones', { method: 'POST', body: JSON.stringify(data) }),

    // Quiz
    getQuizResults: () => fetchApi<QuizResult[]>('/quiz-results'),
    saveQuizResult: (result: QuizResult) => fetchApi('/quiz-results', { method: 'POST', body: JSON.stringify(result) }),
    getQuestions: () => fetchApi<any[]>('/questions'),

    // Scores
    getScores: () => fetchApi<Score[]>('/scores'),
    saveScore: (score: Score) => fetchApi('/scores', { method: 'POST', body: JSON.stringify(score) }),

    // Media
    getMedia: () => fetchApi<MediaItem[]>('/media'),
    saveMedia: (item: MediaItem) => fetchApi('/media', { method: 'POST', body: JSON.stringify(item) }),

    // Leaders
    getLeaders: () => fetchApi<Leader[]>('/leaders'),
    
    // Comments
    getComments: (articleId: string) => fetchApi<Comment[]>(`/comments?articleId=${articleId}`),
    addComment: (comment: Comment) => fetchApi('/comments', { method: 'POST', body: JSON.stringify(comment) }),
};
