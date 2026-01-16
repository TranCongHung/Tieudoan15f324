import { Article, Soldier, Question, Score, DocumentFile, User, QuizResult, MediaItem, Comment, Leader, SiteSettings, Milestone } from '../types';

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

const INITIAL_MILESTONES: Milestone[] = [
    {
      id: '1',
      year: "1955",
      title: "Thành lập Sư đoàn",
      subtitle: "Khởi đầu hào hùng",
      content: "Ngày 01/07/1955, Sư đoàn 324 được thành lập tại Tĩnh Gia, Thanh Hóa.",
      image: "https://picsum.photos/600/400?random=50",
      icon: "Flag",
      story: `Ngày 1 tháng 7 năm 1955, tại vùng biển Tĩnh Gia (Thanh Hóa), Sư đoàn 324 được thành lập. Đây là Sư đoàn chủ lực cơ động đầu tiên của Quân khu 4, ra đời trong bối cảnh miền Bắc vừa được giải phóng, bắt tay vào công cuộc xây dựng CNXH, miền Nam tiếp tục cuộc đấu tranh thống nhất nước nhà.

Ngay từ những ngày đầu thành lập, cán bộ, chiến sĩ Sư đoàn đã quán triệt sâu sắc nhiệm vụ chính trị, nhanh chóng ổn định tổ chức biên chế, bước vào huấn luyện quân sự, giáo dục chính trị với khí thế "Thao trường đổ mồ hôi, chiến trường bớt đổ máu".

Hình ảnh người chiến sĩ Sư đoàn 324 những ngày đầu gian khó nhưng đầy lạc quan đã trở thành biểu tượng đẹp đẽ của tình quân dân cá nước trên mảnh đất Thanh Hóa anh hùng. Đơn vị đã giúp dân đắp đê, làm thủy lợi, khai hoang phục hóa, để lại ấn tượng sâu đậm trong lòng nhân dân.

Tháng 6 năm 1961, Sư đoàn vinh dự được đón Bác Hồ về thăm. Lời Bác dạy: "Các chú phải ra sức học tập chính trị, quân sự, văn hóa để tiến bộ mãi..." đã trở thành kim chỉ nam cho mọi hành động của cán bộ, chiến sĩ Sư đoàn trong suốt chặng đường lịch sử.

Những năm tháng đầu tiên ấy, dù thiếu thốn trăm bề về cơ sở vật chất, vũ khí trang bị còn thô sơ, nhưng với tinh thần đoàn kết, ý chí tự lực tự cường, Sư đoàn đã đặt những viên gạch vững chắc đầu tiên, xây dựng nền móng cho một đơn vị anh hùng sau này.`,
      quiz: [
        {
            id: 'q1',
            questionText: "Sư đoàn 324 được thành lập vào ngày tháng năm nào?",
            options: ["01/07/1955", "22/12/1944", "19/08/1945", "03/02/1930"],
            correctAnswerIndex: 0,
            explanation: "Sư đoàn 324 được thành lập ngày 01/07/1955 tại Tĩnh Gia, Thanh Hóa."
        },
        {
            id: 'q2',
            questionText: "Địa điểm thành lập Sư đoàn 324 là ở đâu?",
            options: ["Nghệ An", "Hà Tĩnh", "Thanh Hóa", "Quảng Bình"],
            correctAnswerIndex: 2,
            explanation: "Sư đoàn được thành lập tại vùng biển Tĩnh Gia, Thanh Hóa."
        }
      ]
    },
    {
      id: '2',
      year: "1967",
      title: "Chiến trường Trị - Thiên",
      subtitle: "Lửa thử vàng, gian nan thử sức",
      content: "Tham gia các chiến dịch lớn tại Cồn Tiên, Dốc Miếu, đường 9 Nam Lào.",
      image: "https://picsum.photos/600/400?random=51",
      icon: "Map",
      story: `Những năm tháng chiến đấu trên chiến trường Trị - Thiên khói lửa là quãng thời gian gian khổ nhất nhưng cũng vẻ vang nhất của Sư đoàn. Nơi đây được ví như "túi bom", "chảo lửa", nơi thử thách bản lĩnh và ý chí của người lính.

Tại Cồn Tiên, Dốc Miếu, Đường 9, Khe Sanh... những cái tên đã đi vào lịch sử như những mốc son chói lọi. Đối mặt với kẻ thù được trang bị vũ khí tối tân, bom đạn cày xới nát từng tấc đất, nhưng với ý chí "Một tấc không đi, một ly không rời", cán bộ chiến sĩ Sư đoàn đã bám trụ kiên cường.

Danh hiệu "Đoàn Ngự Bình" vang lên khiến quân thù khiếp sợ. Những trận đánh táo bạo, bất ngờ, những cách đánh sáng tạo như "vây lấn, tấn diệt" đã làm phá sản nhiều chiến thuật của địch, góp phần quan trọng vào thắng lợi chung của toàn mặt trận.`,
       quiz: [
        {
            id: 'q3',
            questionText: "Biệt danh nào thường được dùng để gọi Sư đoàn 324?",
            options: ["Đoàn Sông Lam", "Đoàn Ngự Bình", "Đoàn Tây Nguyên", "Đoàn Đồng Bằng"],
            correctAnswerIndex: 1,
            explanation: "Danh hiệu 'Đoàn Ngự Bình' gắn liền với những chiến công vang dội tại chiến trường Trị - Thiên."
        }
      ]
    },
    {
      id: '3',
      year: "1975",
      title: "Đại thắng Mùa Xuân",
      subtitle: "Thần tốc - Táo bạo - Quyết thắng",
      content: "Tham gia chiến dịch Huế - Đà Nẵng, thần tốc tiến quân giải phóng miền Nam.",
      image: "https://picsum.photos/600/400?random=52",
      icon: "Star",
      story: `Mùa xuân năm 1975, thực hiện mệnh lệnh "Thần tốc, thần tốc hơn nữa, táo bạo, táo bạo hơn nữa", Sư đoàn 324 đã cùng các cánh quân khác ồ ạt tiến về phía Nam trong khí thế hào hùng của cả dân tộc ra trận.

Tham gia chiến dịch Huế - Đà Nẵng, Sư đoàn đã đập tan tuyến phòng thủ kiên cố của địch ở phía Tây Nam Huế, cắt đứt đường rút lui của địch, góp phần quan trọng giải phóng Cố đô Huế và thành phố Đà Nẵng. Khí thế tiến công như vũ bão, quân đi đến đâu dân đón chào đến đó.

Tiếp đà thắng lợi, Sư đoàn hành quân thần tốc vào Nam, tham gia Chiến dịch Hồ Chí Minh lịch sử. Vượt qua bao gian khổ, hy sinh, cán bộ chiến sĩ Sư đoàn đã có mặt tại sào huyệt cuối cùng của địch.`,
      quiz: [
        {
            id: 'q4',
            questionText: "Sư đoàn tham gia giải phóng thành phố nào trong chiến dịch Xuân 1975?",
            options: ["Hà Nội", "Huế & Đà Nẵng", "Cần Thơ", "Hải Phòng"],
            correctAnswerIndex: 1,
            explanation: "Sư đoàn 324 đã góp phần quan trọng giải phóng Cố đô Huế và thành phố Đà Nẵng."
        }
      ]
    },
    {
      id: '4',
      year: "Nay",
      title: "Xây dựng và Bảo vệ Tổ quốc",
      subtitle: "Vững bước dưới quân kỳ",
      content: "Xây dựng đơn vị vững mạnh toàn diện 'Mẫu mực, tiêu biểu'.",
      image: "https://picsum.photos/600/400?random=53",
      icon: "Award",
      story: `Phát huy truyền thống vẻ vang, ngày nay Tiểu đoàn 15 và Sư đoàn 324 đang ra sức xây dựng đơn vị vững mạnh toàn diện "Mẫu mực, tiêu biểu". Nhiệm vụ bảo vệ Tổ quốc trong tình hình mới đặt ra những yêu cầu ngày càng cao.

Công tác huấn luyện luôn bám sát phương châm "Cơ bản, thiết thực, vững chắc", coi trọng huấn luyện đồng bộ, chuyên sâu. Cán bộ chiến sĩ không ngừng học tập, rèn luyện làm chủ vũ khí trang bị kỹ thuật hiện đại, sẵn sàng chiến đấu cao.

Bên cạnh đó, đơn vị luôn là lực lượng nòng cốt trong phòng chống thiên tai, cứu hộ cứu nạn. Hình ảnh cán bộ chiến sĩ Sư đoàn dầm mình trong mưa lũ giúp dân sơ tán, cứu tài sản đã tô thắm thêm phẩm chất "Bộ đội Cụ Hồ".`,
       quiz: [
        {
            id: 'q5',
            questionText: "Phương châm huấn luyện hiện nay của đơn vị là gì?",
            options: ["Nhanh, mạnh, chính xác", "Cơ bản, thiết thực, vững chắc", "Đoàn kết, kỷ luật", "Trung thực, dũng cảm"],
            correctAnswerIndex: 1,
            explanation: "Phương châm: Cơ bản, thiết thực, vững chắc."
        }
      ]
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

const INITIAL_SETTINGS: SiteSettings = {
    siteTitle: 'Tiểu đoàn 15',
    siteSubtitle: 'Sư đoàn 324 - Quân Khu 4',
    logoUrl: '', // Default to Shield icon
    primaryColor: '#14532d', // green-900 (Tailwind defaults)
    secondaryColor: '#eab308', // yellow-500
    heroImage: 'https://picsum.photos/1920/1080?grayscale&blur=2',
    heroTitle: 'Phát huy truyền thống Đoàn Ngự Bình',
    heroSubtitle: 'Tiểu đoàn 15 quyết tâm hoàn thành xuất sắc mọi nhiệm vụ được giao, xứng danh Bộ đội Cụ Hồ thời kỳ mới.',
    contactAddress: 'Quân khu 4, Nghệ An',
    contactEmail: 'contact@su324.vn',
    contactPhone: '069.xxxx.xxx',
    customCss: ''
};

// Generic LocalStorage Helper
const getFromStorage = <T,>(key: string, initial: T): T => {
  try {
    const item = localStorage.getItem(key);
    // Check for "undefined" or "null" strings which can cause JSON.parse to crash
    if (!item || item === "undefined" || item === "null") return initial;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    // If error occurs (e.g. syntax error), clear the corrupted key
    localStorage.removeItem(key);
    return initial;
  }
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    if (data === undefined) {
      localStorage.removeItem(key);
      return;
    }
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
  },

  // History
  getHistory: () => getFromStorage<Milestone[]>('history', INITIAL_MILESTONES),
  saveHistory: (data: Milestone[]) => saveToStorage('history', data),

  // Site Settings
  getSettings: () => getFromStorage<SiteSettings>('site_settings', INITIAL_SETTINGS),
  saveSettings: (settings: SiteSettings) => saveToStorage('site_settings', settings),
};