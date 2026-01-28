
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: string;
  author: string;
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  image: string;
}

// Adding missing Soldier interface used in storage.ts
export interface Soldier {
  id: string;
  name: string;
  rank: string;
  position: string;
  unit: string;
  dateOfBirth: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Score {
  id: string;
  unitName: string;
  militaryScore: number;
  politicalScore: number;
  logisticsScore: number;
  disciplineScore: number;
  totalScore: number;
  date: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  isFolder: boolean;
  parentId: string | null;
  type?: string;
  date: string;
  size?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'audio';
  url: string;
  thumbnail?: string;
  description?: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  rank: string;
  position: string;
  unit?: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface QuizResult {
  id: string;
  userId: string;
  userName: string;
  userRank: string;
  unit: string;
  topic: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userRank?: string;
  content: string;
  date: string;
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  icon: string;
  story: string;
  quiz: Question[];
  narrationAudio?: string;
}

export interface ReadHistory {
  id: string;
  userId: string;
  userName: string;
  userRank: string;
  unit: string;
  milestoneId: string;
  milestoneTitle: string;
  readAt: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  customCss: string;
}