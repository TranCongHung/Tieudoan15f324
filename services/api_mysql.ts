import { Article, User, QuizResult, Milestone, MediaItem, Leader, Score, DocumentFile, Comment, SiteSettings, Question } from '../types';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

class ApiClient {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes cache

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

  private async request(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API ${endpoint} error: ${res.status} ${err}`);
    }
    return res.json();
  }

  // --- AUTHENTICATION ---
  async login(email: string, pass: string): Promise<User | null> {
    try {
      const data = await this.request('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      return {
        ...data,
        rank: data.rank_name || data.rank,
      } as User;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async register(user: User): Promise<boolean> {
    try {
      await this.request('/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      this.invalidateCache('users');
      return true;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- ARTICLES ---
  async getArticles(): Promise<Article[]> {
    try {
      const cached = this.getCached('articles');
      if (cached) return cached;

      const data = await this.request('/articles');
      this.setCache('articles', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createArticle(article: Article) {
    try {
      await this.request('/articles', {
        method: 'POST',
        body: JSON.stringify(article),
      });
      this.invalidateCache('articles');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateArticle(id: string, article: Partial<Article>) {
    try {
      await this.request(`/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
      });
      this.invalidateCache('articles');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteArticle(id: string) {
    try {
      await this.request(`/articles/${id}`, { method: 'DELETE' });
      this.invalidateCache('articles');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- MILESTONES ---
  async getHistory(): Promise<Milestone[]> {
    try {
      const cached = this.getCached('milestones');
      if (cached) return cached;

      const data = await this.request('/milestones');
      this.setCache('milestones', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createMilestone(m: Milestone) {
    try {
      await this.request('/milestones', {
        method: 'POST',
        body: JSON.stringify(m),
      });
      this.invalidateCache('milestones');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateMilestone(id: string, m: Partial<Milestone>) {
    try {
      await this.request(`/milestones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(m),
      });
      this.invalidateCache('milestones');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteMilestone(id: string) {
    try {
      await this.request(`/milestones/${id}`, { method: 'DELETE' });
      this.invalidateCache('milestones');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    try {
      const cached = this.getCached('users');
      if (cached) return cached;

      const data = await this.request('/users');
      this.setCache('users', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createUser(user: User) {
    try {
      await this.request('/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      this.invalidateCache('users');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateUser(id: string, u: Partial<User>) {
    try {
      await this.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(u),
      });
      this.invalidateCache('users');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteUser(id: string) {
    try {
      await this.request(`/users/${id}`, { method: 'DELETE' });
      this.invalidateCache('users');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- QUESTIONS ---
  async getQuestions(): Promise<Question[]> {
    try {
      const cached = this.getCached('questions');
      if (cached) return cached;

      const data = await this.request('/questions');
      this.setCache('questions', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createQuestion(q: Question) {
    try {
      await this.request('/questions', {
        method: 'POST',
        body: JSON.stringify(q),
      });
      this.invalidateCache('questions');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateQuestion(id: string, q: Partial<Question>) {
    try {
      await this.request(`/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(q),
      });
      this.invalidateCache('questions');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteQuestion(id: string) {
    try {
      await this.request(`/questions/${id}`, { method: 'DELETE' });
      this.invalidateCache('questions');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- SCORES ---
  async getScores(): Promise<Score[]> {
    try {
      const cached = this.getCached('scores');
      if (cached) return cached;

      const data = await this.request('/scores');
      this.setCache('scores', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createScore(s: Score) {
    try {
      await this.request('/scores', {
        method: 'POST',
        body: JSON.stringify(s),
      });
      this.invalidateCache('scores');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateScore(id: string, s: Partial<Score>) {
    try {
      await this.request(`/scores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(s),
      });
      this.invalidateCache('scores');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteScore(id: string) {
    try {
      await this.request(`/scores/${id}`, { method: 'DELETE' });
      this.invalidateCache('scores');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- DOCUMENTS ---
  async getDocuments(): Promise<DocumentFile[]> {
    try {
      const cached = this.getCached('documents');
      if (cached) return cached;

      const data = await this.request('/documents');
      this.setCache('documents', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createDocument(d: DocumentFile) {
    try {
      await this.request('/documents', {
        method: 'POST',
        body: JSON.stringify(d),
      });
      this.invalidateCache('documents');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateDocument(id: string, d: Partial<DocumentFile>) {
    try {
      await this.request(`/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(d),
      });
      this.invalidateCache('documents');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteDocument(id: string) {
    try {
      await this.request(`/documents/${id}`, { method: 'DELETE' });
      this.invalidateCache('documents');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- MEDIA ---
  async getMedia(): Promise<MediaItem[]> {
    try {
      const cached = this.getCached('media');
      if (cached) return cached;

      const data = await this.request('/media');
      this.setCache('media', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createMedia(m: MediaItem) {
    try {
      await this.request('/media', {
        method: 'POST',
        body: JSON.stringify(m),
      });
      this.invalidateCache('media');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateMedia(id: string, m: Partial<MediaItem>) {
    try {
      await this.request(`/media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(m),
      });
      this.invalidateCache('media');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteMedia(id: string) {
    try {
      await this.request(`/media/${id}`, { method: 'DELETE' });
      this.invalidateCache('media');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- LEADERS ---
  async getLeaders(): Promise<Leader[]> {
    try {
      const cached = this.getCached('leaders');
      if (cached) return cached;

      const data = await this.request('/leaders');
      this.setCache('leaders', data);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async createLeader(leader: Leader) {
    try {
      await this.request('/leaders', {
        method: 'POST',
        body: JSON.stringify(leader),
      });
      this.invalidateCache('leaders');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateLeader(id: string, leader: Partial<Leader>) {
    try {
      await this.request(`/leaders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leader),
      });
      this.invalidateCache('leaders');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async deleteLeader(id: string) {
    try {
      await this.request(`/leaders/${id}`, { method: 'DELETE' });
      this.invalidateCache('leaders');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    try {
      const data = await this.request('/settings');
      return data as SiteSettings;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async saveSettings(settings: SiteSettings) {
    try {
      await this.request('/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- QUIZ RESULTS ---
  async getQuizResults(): Promise<QuizResult[]> {
    try {
      const data = await this.request('/quiz-results');
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async saveQuizResult(r: QuizResult) {
    try {
      await this.request('/quiz-results', {
        method: 'POST',
        body: JSON.stringify(r),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- COMMENTS ---
  async getComments(articleId: string): Promise<Comment[]> {
    try {
      const data = await this.request(`/comments?articleId=${articleId}`);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async addComment(c: Comment) {
    try {
      await this.request('/comments', {
        method: 'POST',
        body: JSON.stringify(c),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // --- READ HISTORY ---
  async markMilestoneAsRead(userId: string, userName: string, userRank: string, unit: string, milestoneId: string, milestoneTitle: string) {
    try {
      await this.request('/read-history/mark', {
        method: 'POST',
        body: JSON.stringify({ userId, userName, userRank, unit, milestoneId, milestoneTitle }),
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getReadHistoryByMilestone(milestoneId: string): Promise<any[]> {
    try {
      const data = await this.request(`/read-history?milestoneId=${milestoneId}`);
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async checkUserHasReadMilestone(userId: string, milestoneId: string): Promise<boolean> {
    try {
      const data = await this.request(`/read-history/check/${userId}/${milestoneId}`);
      return data.hasRead;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export const apiService = new ApiClient();
