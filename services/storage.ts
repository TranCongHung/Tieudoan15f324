import { Article, Soldier, Question, Score, DocumentFile, User, QuizResult, MediaItem, Comment, Leader } from '../types';

// Initial Mock Data
const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Tiểu đoàn 15 ra quân huấn luyện năm 2024',
    summary: 'Sáng ngày 01/03, Tiểu đoàn 15 long trọng tổ chức lễ ra quân huấn luyện với khí thế sôi nổi.',
    content: 'Nội dung chi tiết về buổi lễ ra quân...',
    imageUrl: 'https://picsum.photos/800/400?random=1',
    date: '2024-03-01',
    author: 'Ban Chính trị'
  },
  {
    id: '2',
    title: 'Hội thi cán bộ giảng dạy chính trị giỏi',
    summary: 'Các cán bộ đại đội, trung đội tham gia hội thi nhằm nâng cao chất lượng giáo dục chính trị.',
    content: 'Nội dung chi tiết hội thi...',
    imageUrl: 'https://picsum.photos/800/400?random=2',
    date: '2024-03-15',
    author: 'Phan Văn A'
  }
];

const INITIAL_LEADERS: Leader[] = [
    {
      id: '1',
      name: "Thiếu tá Nguyễn Văn A",
      role: "Tiểu đoàn trưởng",
      image: "https://picsum.photos/200/200?random=10"
    },
    {
      id: '2',
      name: "Đại úy Trần Văn B",
      role: "Chính trị viên",
      image: "https://picsum.photos/200/200?random=11"
    },
    {
      id: '3',
      name: "Đại úy Lê Văn C",
      role: "Phó Tiểu đoàn trưởng",
      image: "https://picsum.photos/200/200?random=12"
    },
    {
      id: '4',
      name: "Đại úy Phạm Văn D",
      role: "Phó Tiểu đoàn trưởng",
      image: "https://picsum.photos/200/200?random=13"
    }
];

const INITIAL_SOLDIERS: Soldier[] = [
  { id: '1', name: 'Nguyễn Văn A', rank: 'Đại úy', position: 'Tiểu đoàn trưởng', unit: 'Tiểu đoàn 15', dateOfBirth: '1990-01-01' },
  { id: '2', name: 'Trần Văn B', rank: 'Thượng úy', position: 'Chính trị viên', unit: 'Tiểu đoàn 15', dateOfBirth: '1992-05-15' },
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    questionText: 'Sư đoàn 324 được thành lập vào ngày, tháng, năm nào?',
    options: ['01/07/1955', '22/12/1944', '19/08/1945', '03/02/1930'],
    correctAnswerIndex: 0,
    explanation: 'Sư đoàn 324 được thành lập ngày 01/07/1955 tại huyện Tĩnh Gia (nay là Thị xã Nghi Sơn), tỉnh Thanh Hóa.'
  },
  {
    id: '2',
    questionText: 'Truyền thống vẻ vang của Sư đoàn 324 là gì?',
    options: ['Trung dũng, kiên cường', 'Thần tốc, táo bạo', 'Trung dũng, kiên cường, liên tục tấn công, đoàn kết hiệp đồng, lập công tập thể', 'Quyết chiến, quyết thắng'],
    correctAnswerIndex: 2,
    explanation: '8 chữ vàng truyền thống: Trung dũng, kiên cường, liên tục tấn công, đoàn kết hiệp đồng, lập công tập thể.'
  }
];

const INITIAL_SCORES: Score[] = [
  { 
      id: '1', 
      unitName: 'Đại đội 1', 
      militaryScore: 8.5,
      politicalScore: 9.0,
      logisticsScore: 8.5,
      disciplineScore: 9.0,
      totalScore: 8.75,
      date: '2024-05-20' 
  },
  { 
      id: '2', 
      unitName: 'Đại đội 2', 
      militaryScore: 8.0,
      politicalScore: 8.5,
      logisticsScore: 8.0,
      disciplineScore: 8.5,
      totalScore: 8.25,
      date: '2024-05-20' 
  },
  { 
      id: '3', 
      unitName: 'Đại đội 3', 
      militaryScore: 9.0,
      politicalScore: 9.0,
      logisticsScore: 8.5,
      disciplineScore: 9.5,
      totalScore: 9.0,
      date: '2024-05-21' 
  },
];

const INITIAL_DOCUMENTS: DocumentFile[] = [
  // Folders
  { id: 'folder_1', name: 'Kế hoạch Huấn luyện', isFolder: true, parentId: null, date: '2024-01-01', size: '--' },
  { id: 'folder_2', name: 'Công tác Đảng - Chính trị', isFolder: true, parentId: null, date: '2024-01-01', size: '--' },
  { id: 'folder_3', name: 'Báo cáo Tuần', isFolder: true, parentId: null, date: '2024-02-01', size: '--' },
  
  // Sub-folder
  { id: 'folder_1_1', name: 'Tháng 1/2024', isFolder: true, parentId: 'folder_1', date: '2024-01-05', size: '--' },

  // Files in Root
  { id: 'file_1', name: 'Quyết định thăng quân hàm.pdf', isFolder: false, parentId: null, type: 'PDF', date: '2024-05-25', size: '2.5 MB' },
  
  // Files in Folders
  { id: 'file_2', name: 'Tiến trình biểu tuần 1.docx', isFolder: false, parentId: 'folder_1_1', type: 'DOCX', date: '2024-01-06', size: '1.2 MB' },
  { id: 'file_3', name: 'Nghị quyết tháng 6.doc', isFolder: false, parentId: 'folder_2', type: 'DOC', date: '2024-06-01', size: '3.5 MB' },
];

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: '1',
    title: 'Phim tài liệu: Sư đoàn 324 - 60 năm xây dựng và trưởng thành',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Demo Link
    thumbnail: 'https://picsum.photos/800/450?random=20',
    description: 'Bộ phim tái hiện lại chặng đường lịch sử hào hùng của Sư đoàn.',
    date: '2023-12-22'
  },
  {
    id: '2',
    title: 'Hát mãi khúc quân hành',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo Link
    description: 'Ca khúc truyền thống vang vọng mãi trong lòng người chiến sĩ.',
    date: '2024-01-15'
  },
  {
    id: '3',
    title: 'Huấn luyện chiến thuật Đại đội',
    type: 'video',
    url: 'https://www.youtube.com/embed/eng', // Demo
    thumbnail: 'https://picsum.photos/800/450?random=21',
    description: 'Ghi hình buổi diễn tập thực binh bắn đạn thật.',
    date: '2024-04-30'
  },
   {
    id: '4',
    title: 'Vì nhân dân quên mình',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Nhạc phẩm ngợi ca phẩm chất Bộ đội Cụ Hồ.',
    date: '2024-02-03'
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'admin_root',
    name: 'Super Admin',
    email: 'admin',
    rank: 'Đại tá',
    position: 'Chỉ huy trưởng',
    password: 'admin',
    role: 'admin'
  },
  {
    id: 'admin1',
    name: 'Quản trị viên',
    email: 'admin@su324.vn',
    rank: 'Thiếu tá',
    position: 'Trợ lý Tác chiến',
    password: 'admin',
    role: 'admin'
  },
  {
    id: 'user1',
    name: 'Nguyễn Văn Chiến',
    email: 'user@su324.vn',
    rank: 'Trung úy',
    position: 'Trung đội trưởng',
    password: '123',
    role: 'user'
  }
];

const INITIAL_QUIZ_RESULTS: QuizResult[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Nguyễn Văn Chiến',
    userRank: 'Trung úy',
    unit: 'Tiểu đoàn 15',
    topic: 'Lịch sử Sư đoàn 324',
    score: 2,
    totalQuestions: 2,
    timestamp: new Date().toISOString()
  },
   {
    id: '2',
    userId: 'user2',
    userName: 'Lê Văn An',
    userRank: 'Thượng sĩ',
    unit: 'Đại đội 1',
    topic: 'Lịch sử Sư đoàn 324',
    score: 1,
    totalQuestions: 2,
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

const INITIAL_COMMENTS: Comment[] = [
    {
        id: '1',
        articleId: '1',
        userId: 'user1',
        userName: 'Nguyễn Văn Chiến',
        userRank: 'Trung úy',
        content: 'Bài viết rất ý nghĩa, phản ánh đúng khí thế ra quân của đơn vị.',
        date: '2024-03-02'
    },
    {
        id: '2',
        articleId: '1',
        userId: 'user2',
        userName: 'Lê Văn An',
        userRank: 'Thượng sĩ',
        content: 'Chúc đơn vị năm nay đạt thành tích cao trong huấn luyện!',
        date: '2024-03-02'
    }
];

// Generic LocalStorage Helper
const getFromStorage = <T,>(key: string, initial: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return initial;
  }
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

// Data Access Object
export const storage = {
  getArticles: () => getFromStorage<Article[]>('articles', INITIAL_ARTICLES),
  saveArticles: (data: Article[]) => saveToStorage('articles', data),

  getLeaders: () => getFromStorage<Leader[]>('leaders', INITIAL_LEADERS),
  saveLeaders: (data: Leader[]) => saveToStorage('leaders', data),

  getSoldiers: () => getFromStorage<Soldier[]>('soldiers', INITIAL_SOLDIERS),
  saveSoldiers: (data: Soldier[]) => saveToStorage('soldiers', data),

  getQuestions: () => getFromStorage<Question[]>('questions', INITIAL_QUESTIONS),
  saveQuestions: (data: Question[]) => saveToStorage('questions', data),

  getScores: () => getFromStorage<Score[]>('scores', INITIAL_SCORES),
  saveScores: (data: Score[]) => saveToStorage('scores', data),

  getDocuments: () => getFromStorage<DocumentFile[]>('documents', INITIAL_DOCUMENTS),
  saveDocuments: (data: DocumentFile[]) => saveToStorage('documents', data),

  getMedia: () => getFromStorage<MediaItem[]>('media', INITIAL_MEDIA),
  saveMedia: (data: MediaItem[]) => saveToStorage('media', data),

  getUsers: () => getFromStorage<User[]>('users', INITIAL_USERS),
  saveUsers: (data: User[]) => saveToStorage('users', data),
  
  createUser: (user: User) => {
    const users = getFromStorage<User[]>('users', INITIAL_USERS);
    users.push(user);
    saveToStorage('users', users);
  },

  getQuizResults: () => getFromStorage<QuizResult[]>('quiz_results', INITIAL_QUIZ_RESULTS),
  saveQuizResult: (result: QuizResult) => {
      const results = getFromStorage<QuizResult[]>('quiz_results', INITIAL_QUIZ_RESULTS);
      results.push(result);
      saveToStorage('quiz_results', results);
  },

  // Comment methods
  getComments: (articleId: string) => {
      const comments = getFromStorage<Comment[]>('comments', INITIAL_COMMENTS);
      return comments.filter(c => c.articleId === articleId);
  },
  
  addComment: (comment: Comment) => {
      const comments = getFromStorage<Comment[]>('comments', INITIAL_COMMENTS);
      comments.push(comment);
      saveToStorage('comments', comments);
  }
};