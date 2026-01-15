
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  date: string;
  author: string;
}

export interface Soldier {
  id: string;
  name: string;
  rank: string; // Cấp bậc
  position: string; // Chức vụ
  unit: string; // Đơn vị
  dateOfBirth: string;
}

export interface Leader {
  id: string;
  name: string;
  role: string; // Chức vụ hiển thị (VD: Tiểu đoàn trưởng)
  image: string; // URL ảnh
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
  unitName: string; // Tên đơn vị được chấm
  militaryScore: number;    // Quân sự
  politicalScore: number;   // Chính trị
  logisticsScore: number;   // Hậu cần
  disciplineScore: number;  // Xây dựng chính quy
  totalScore: number;       // Điểm tổng kết (Trung bình cộng)
  date: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  isFolder: boolean; // True nếu là thư mục
  parentId: string | null; // ID của thư mục cha (null nếu ở gốc)
  type?: string; // Loại file (pdf, docx...) hoặc Label cho thư mục
  date: string;
  size?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'audio';
  url: string; // YouTube embed link or MP3 url
  thumbnail?: string; // For videos
  description?: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string; // Gmail
  rank: string; // Cấp bậc
  position: string; // Chức vụ
  unit?: string; // Đơn vị
  password: string;
  role: 'admin' | 'user';
}

export interface QuizResult {
  id: string;
  userId: string;
  userName: string;
  userRank: string;
  unit: string; // Đơn vị của người dùng (nếu có, hoặc lấy từ user info)
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
  userRank?: string; // Optional rank to display
  content: string;
  date: string;
}

// Menu items type for navigation
export type NavigationItem = {
  name: string;
  path: string;
  current: boolean;
};