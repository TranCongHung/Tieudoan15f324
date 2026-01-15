import React, { useState, useEffect } from 'react';
import { Star, Map, Flag, Award, BookOpen, ChevronDown, X, Book, ChevronLeft, ChevronRight, HelpCircle, CheckCircle, XCircle, RotateCcw, Lock, Save, ArrowLeft } from 'lucide-react';
import { Link } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { QuizResult } from '../types';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Milestone {
  year: string;
  title: string;
  subtitle: string;
  content: string;
  image: string;
  icon: any;
  story: string;
  quiz: QuizQuestion[];
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0); // 0 = Cover + Page 1, 1 = Page 2 + Page 3, etc.
  
  // State for Quiz Mode
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Reset khi mở cuốn sách mới
  useEffect(() => {
    if (selectedMilestone) {
      resetBookState();
    }
  }, [selectedMilestone]);

  const resetBookState = () => {
    setCurrentSpread(0);
    setQuizMode(false);
    setIsSubmitted(false);
    setScore(0);
    setUserAnswers([]);
  };

  // Chia nhỏ văn bản thành các trang (mỗi trang 1 đoạn văn để tạo cảm giác sách dày)
  const getPages = (text: string) => {
    return text.split('\n').filter(p => p.trim() !== '');
  };

  const milestones: Milestone[] = [
    {
      year: "1955",
      title: "Thành lập Sư đoàn",
      subtitle: "Khởi đầu hào hùng",
      content: "Ngày 01/07/1955, Sư đoàn 324 được thành lập tại Tĩnh Gia, Thanh Hóa.",
      image: "https://picsum.photos/600/400?random=50",
      icon: Flag,
      story: `Ngày 1 tháng 7 năm 1955, tại vùng biển Tĩnh Gia (Thanh Hóa), Sư đoàn 324 được thành lập. Đây là Sư đoàn chủ lực cơ động đầu tiên của Quân khu 4, ra đời trong bối cảnh miền Bắc vừa được giải phóng, bắt tay vào công cuộc xây dựng CNXH, miền Nam tiếp tục cuộc đấu tranh thống nhất nước nhà.

Ngay từ những ngày đầu thành lập, cán bộ, chiến sĩ Sư đoàn đã quán triệt sâu sắc nhiệm vụ chính trị, nhanh chóng ổn định tổ chức biên chế, bước vào huấn luyện quân sự, giáo dục chính trị với khí thế "Thao trường đổ mồ hôi, chiến trường bớt đổ máu".

Hình ảnh người chiến sĩ Sư đoàn 324 những ngày đầu gian khó nhưng đầy lạc quan đã trở thành biểu tượng đẹp đẽ của tình quân dân cá nước trên mảnh đất Thanh Hóa anh hùng. Đơn vị đã giúp dân đắp đê, làm thủy lợi, khai hoang phục hóa, để lại ấn tượng sâu đậm trong lòng nhân dân.

Tháng 6 năm 1961, Sư đoàn vinh dự được đón Bác Hồ về thăm. Lời Bác dạy: "Các chú phải ra sức học tập chính trị, quân sự, văn hóa để tiến bộ mãi..." đã trở thành kim chỉ nam cho mọi hành động của cán bộ, chiến sĩ Sư đoàn trong suốt chặng đường lịch sử.

Những năm tháng đầu tiên ấy, dù thiếu thốn trăm bề về cơ sở vật chất, vũ khí trang bị còn thô sơ, nhưng với tinh thần đoàn kết, ý chí tự lực tự cường, Sư đoàn đã đặt những viên gạch vững chắc đầu tiên, xây dựng nền móng cho một đơn vị anh hùng sau này.`,
      quiz: [
        {
            question: "Sư đoàn 324 được thành lập vào ngày tháng năm nào?",
            options: ["01/07/1955", "22/12/1944", "19/08/1945", "03/02/1930"],
            correctIndex: 0,
            explanation: "Sư đoàn 324 được thành lập ngày 01/07/1955 tại Tĩnh Gia, Thanh Hóa."
        },
        {
            question: "Địa điểm thành lập Sư đoàn 324 là ở đâu?",
            options: ["Nghệ An", "Hà Tĩnh", "Thanh Hóa", "Quảng Bình"],
            correctIndex: 2,
            explanation: "Sư đoàn được thành lập tại vùng biển Tĩnh Gia, Thanh Hóa."
        },
        {
            question: "Lời Bác Hồ dạy khi về thăm Sư đoàn năm 1961 là gì?",
            options: [
                "Trung với Đảng, hiếu với dân", 
                "Các chú phải ra sức học tập chính trị, quân sự, văn hóa để tiến bộ mãi", 
                "Quyết chiến quyết thắng",
                "Đoàn kết, kỷ luật, quyết thắng"
            ],
            correctIndex: 1,
            explanation: "Bác dạy: 'Các chú phải ra sức học tập chính trị, quân sự, văn hóa để tiến bộ mãi...'"
        }
      ]
    },
    {
      year: "1967",
      title: "Chiến trường Trị - Thiên",
      subtitle: "Lửa thử vàng, gian nan thử sức",
      content: "Tham gia các chiến dịch lớn tại Cồn Tiên, Dốc Miếu, đường 9 Nam Lào.",
      image: "https://picsum.photos/600/400?random=51",
      icon: Map,
      story: `Những năm tháng chiến đấu trên chiến trường Trị - Thiên khói lửa là quãng thời gian gian khổ nhất nhưng cũng vẻ vang nhất của Sư đoàn. Nơi đây được ví như "túi bom", "chảo lửa", nơi thử thách bản lĩnh và ý chí của người lính.

Tại Cồn Tiên, Dốc Miếu, Đường 9, Khe Sanh... những cái tên đã đi vào lịch sử như những mốc son chói lọi. Đối mặt với kẻ thù được trang bị vũ khí tối tân, bom đạn cày xới nát từng tấc đất, nhưng với ý chí "Một tấc không đi, một ly không rời", cán bộ chiến sĩ Sư đoàn đã bám trụ kiên cường.

Danh hiệu "Đoàn Ngự Bình" vang lên khiến quân thù khiếp sợ. Những trận đánh táo bạo, bất ngờ, những cách đánh sáng tạo như "vây lấn, tấn diệt" đã làm phá sản nhiều chiến thuật của địch, góp phần quan trọng vào thắng lợi chung của toàn mặt trận.

Trong chiến dịch Đường 9 - Nam Lào, Sư đoàn đã phối hợp chặt chẽ với các đơn vị bạn, đập tan cuộc hành quân Lam Sơn 719 của địch, bảo vệ vững chắc tuyến hành lang vận tải chiến lược Bắc - Nam. Những chiến công ấy đã được đổi bằng xương máu của biết bao anh hùng liệt sĩ.

Không chỉ chiến đấu giỏi, Sư đoàn còn làm tốt công tác dân vận, giúp đỡ nhân dân vùng giải phóng ổn định cuộc sống, xây dựng chính quyền cách mạng, được nhân dân tin yêu, che chở, đùm bọc.`,
       quiz: [
        {
            question: "Biệt danh nào thường được dùng để gọi Sư đoàn 324?",
            options: ["Đoàn Sông Lam", "Đoàn Ngự Bình", "Đoàn Tây Nguyên", "Đoàn Đồng Bằng"],
            correctIndex: 1,
            explanation: "Danh hiệu 'Đoàn Ngự Bình' gắn liền với những chiến công vang dội tại chiến trường Trị - Thiên."
        },
        {
            question: "Chiến thuật nổi tiếng nào được nhắc đến trong giai đoạn này?",
            options: ["Nở hoa trong lòng địch", "Vây lấn, tấn diệt", "Đánh điểm, diệt viện", "Du kích chiến"],
            correctIndex: 1,
            explanation: "Cách đánh sáng tạo 'vây lấn, tấn diệt' đã làm phá sản nhiều chiến thuật của địch."
        },
        {
            question: "Chiến dịch nào đập tan cuộc hành quân Lam Sơn 719?",
            options: ["Chiến dịch Điện Biên Phủ", "Chiến dịch Đường 9 - Nam Lào", "Chiến dịch Tây Nguyên", "Chiến dịch Huế - Đà Nẵng"],
            correctIndex: 1,
            explanation: "Chiến thắng Đường 9 - Nam Lào đã bảo vệ vững chắc tuyến hành lang vận tải chiến lược."
        }
      ]
    },
    {
      year: "1975",
      title: "Đại thắng Mùa Xuân",
      subtitle: "Thần tốc - Táo bạo - Quyết thắng",
      content: "Tham gia chiến dịch Huế - Đà Nẵng, thần tốc tiến quân giải phóng miền Nam.",
      image: "https://picsum.photos/600/400?random=52",
      icon: Star,
      story: `Mùa xuân năm 1975, thực hiện mệnh lệnh "Thần tốc, thần tốc hơn nữa, táo bạo, táo bạo hơn nữa", Sư đoàn 324 đã cùng các cánh quân khác ồ ạt tiến về phía Nam trong khí thế hào hùng của cả dân tộc ra trận.

Tham gia chiến dịch Huế - Đà Nẵng, Sư đoàn đã đập tan tuyến phòng thủ kiên cố của địch ở phía Tây Nam Huế, cắt đứt đường rút lui của địch, góp phần quan trọng giải phóng Cố đô Huế và thành phố Đà Nẵng. Khí thế tiến công như vũ bão, quân đi đến đâu dân đón chào đến đó.

Tiếp đà thắng lợi, Sư đoàn hành quân thần tốc vào Nam, tham gia Chiến dịch Hồ Chí Minh lịch sử. Vượt qua bao gian khổ, hy sinh, cán bộ chiến sĩ Sư đoàn đã có mặt tại sào huyệt cuối cùng của địch.

Ngày 30/4/1975 lịch sử, lá cờ Quyết thắng của Sư đoàn tung bay trên các căn cứ địch, hòa chung niềm vui vỡ òa của cả dân tộc trong ngày non sông thu về một mối. Đó là kết quả của 20 năm chiến đấu, hy sinh gian khổ nhưng vô cùng vẻ vang.

Chiến thắng 30/4 là mốc son chói lọi nhất trong lịch sử Sư đoàn, khẳng định sức mạnh bách chiến bách thắng của Quân đội nhân dân Việt Nam, và là niềm tự hào to lớn của các thế hệ cán bộ, chiến sĩ Sư đoàn 324.`,
      quiz: [
        {
            question: "Sư đoàn tham gia giải phóng thành phố nào trong chiến dịch Xuân 1975?",
            options: ["Hà Nội", "Huế & Đà Nẵng", "Cần Thơ", "Hải Phòng"],
            correctIndex: 1,
            explanation: "Sư đoàn 324 đã góp phần quan trọng giải phóng Cố đô Huế và thành phố Đà Nẵng."
        },
         {
            question: "Phương châm tác chiến trong chiến dịch Hồ Chí Minh là gì?",
            options: ["Chắc thắng mới đánh", "Thần tốc, táo bạo", "Đánh nhanh thắng nhanh", "Phòng ngự chặt"],
            correctIndex: 1,
            explanation: "Mệnh lệnh nổi tiếng: 'Thần tốc, thần tốc hơn nữa, táo bạo, táo bạo hơn nữa'."
        },
        {
            question: "Sư đoàn hoàn thành nhiệm vụ giải phóng miền Nam vào ngày nào?",
            options: ["07/05/1954", "30/04/1975", "02/09/1945", "19/05/1890"],
            correctIndex: 1,
            explanation: "Ngày 30/4/1975, miền Nam hoàn toàn giải phóng."
        }
      ]
    },
    {
      year: "Nay",
      title: "Xây dựng và Bảo vệ Tổ quốc",
      subtitle: "Vững bước dưới quân kỳ",
      content: "Xây dựng đơn vị vững mạnh toàn diện 'Mẫu mực, tiêu biểu'.",
      image: "https://picsum.photos/600/400?random=53",
      icon: Award,
      story: `Phát huy truyền thống vẻ vang, ngày nay Tiểu đoàn 15 và Sư đoàn 324 đang ra sức xây dựng đơn vị vững mạnh toàn diện "Mẫu mực, tiêu biểu". Nhiệm vụ bảo vệ Tổ quốc trong tình hình mới đặt ra những yêu cầu ngày càng cao.

Công tác huấn luyện luôn bám sát phương châm "Cơ bản, thiết thực, vững chắc", coi trọng huấn luyện đồng bộ, chuyên sâu. Cán bộ chiến sĩ không ngừng học tập, rèn luyện làm chủ vũ khí trang bị kỹ thuật hiện đại, sẵn sàng chiến đấu cao.

Bên cạnh đó, đơn vị luôn là lực lượng nòng cốt trong phòng chống thiên tai, cứu hộ cứu nạn. Hình ảnh cán bộ chiến sĩ Sư đoàn dầm mình trong mưa lũ giúp dân sơ tán, cứu tài sản đã tô thắm thêm phẩm chất "Bộ đội Cụ Hồ".

Đơn vị cũng tích cực tham gia phong trào "Quân đội chung sức xây dựng nông thôn mới", giúp đỡ nhân dân địa phương xóa đói giảm nghèo, xây dựng đời sống văn hóa, thắt chặt tình đoàn kết quân dân.

Thế hệ cán bộ, chiến sĩ hôm nay nguyện tiếp bước cha anh, viết tiếp những trang sử vàng truyền thống, xứng đáng với niềm tin yêu của Đảng, Nhà nước và Nhân dân, xứng danh là "Quả đấm thép" của Quân khu 4.`,
       quiz: [
        {
            question: "Phương châm huấn luyện hiện nay của đơn vị là gì?",
            options: ["Nhanh, mạnh, chính xác", "Cơ bản, thiết thực, vững chắc", "Đoàn kết, kỷ luật", "Trung thực, dũng cảm"],
            correctIndex: 1,
            explanation: "Phương châm: Cơ bản, thiết thực, vững chắc."
        },
        {
             question: "Mục tiêu xây dựng đơn vị hiện nay là gì?",
             options: ["Mạnh về gạo, bạo về tiền", "Mẫu mực, tiêu biểu", "Đông vui, nhộn nhịp", "Hiện đại hóa hoàn toàn"],
             correctIndex: 1,
             explanation: "Xây dựng đơn vị vững mạnh toàn diện 'Mẫu mực, tiêu biểu'."
        }
      ]
    }
  ];

  // Logic phân trang
  // textPages là mảng các đoạn văn
  const textPages = selectedMilestone ? getPages(selectedMilestone.story) : [];
  
  // Tổng số spread (cặp trang). Spread 0 luôn là Cover.
  // Spread > 0 chứa nội dung.
  // Mỗi Spread chứa 2 đoạn văn (Left/Right).
  // Ta cần đảm bảo luôn có đủ Spread để hiển thị hết Text VÀ Nút Quiz.
  // Tổng số item cần hiển thị = textPages.length.
  // Tuy nhiên, Spread 0 đã dùng textPages[0] (bên phải).
  // Số item còn lại = textPages.length - 1.
  // Mỗi spread sau đó chứa 2 item.
  // Ta cần +1 slot trống ở cuối cùng cho Quiz.
  // Công thức: Math.ceil(( (textPages.length - 1) + 1 ) / 2) = Math.ceil(textPages.length / 2)
  
  const contentSpreadsCount = Math.ceil(textPages.length / 2); 
  const totalSpreads = 1 + contentSpreadsCount; // +1 cho Spread 0

  const handleNextSpread = () => {
    if (currentSpread < totalSpreads - 1) setCurrentSpread(p => p + 1);
  };
  const handlePrevSpread = () => {
    if (currentSpread > 0) setCurrentSpread(p => p - 1);
  };

  // --- QUIZ LOGIC ---
  const startQuiz = () => {
      if (!user) {
          alert("Đồng chí cần Đăng nhập để thực hiện bài kiểm tra này!");
          return;
      }
      if (selectedMilestone) {
        setQuizMode(true);
        setUserAnswers(new Array(selectedMilestone.quiz.length).fill(null));
        setIsSubmitted(false);
        setScore(0);
      }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
      if (isSubmitted) return;
      const newAnswers = [...userAnswers];
      newAnswers[questionIndex] = optionIndex;
      setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
      if (!selectedMilestone || !user) return;
      let calculatedScore = 0;
      selectedMilestone.quiz.forEach((q, idx) => {
          if (userAnswers[idx] === q.correctIndex) calculatedScore++;
      });
      setScore(calculatedScore);
      setIsSubmitted(true);
      const result: QuizResult = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userRank: user.rank,
          unit: user.unit || user.position || 'Chiến sĩ',
          topic: `Lịch sử: ${selectedMilestone.year}`,
          score: calculatedScore,
          totalQuestions: selectedMilestone.quiz.length,
          timestamp: new Date().toISOString()
      };
      storage.saveQuizResult(result);
  };

  // Render Page Content Helper
  const renderLeftPageContent = () => {
      if (!selectedMilestone) return null;
      
      // SPREAD 0: BÌA TRÁI (Hình ảnh + Tiêu đề)
      if (currentSpread === 0) {
          return (
            <div className="h-full flex flex-col justify-center items-center text-center border-4 border-double border-yellow-500/20 p-6 relative animate-fade-in">
                <div className="w-full h-56 mb-6 overflow-hidden rounded-sm shadow-md sepia-[0.3] border border-stone-300">
                    <img src={selectedMilestone.image} alt={selectedMilestone.title} className="w-full h-full object-cover" />
                </div>
                <span className="font-display text-8xl text-yellow-500/10 absolute top-8 left-8 font-black select-none pointer-events-none">{selectedMilestone.year}</span>
                <h2 className="text-3xl md:text-4xl font-display font-black text-green-900 mb-4 relative z-10 uppercase leading-tight">{selectedMilestone.title}</h2>
                <div className="w-20 h-1 bg-yellow-500 mb-4"></div>
                <p className="text-stone-600 font-serif italic text-xl tracking-wide">{selectedMilestone.subtitle}</p>
            </div>
          );
      } 
      
      // SPREAD > 0: NỘI DUNG (Trang Chẵn)
      // Spread 1 -> textIndex = 1
      // Spread 2 -> textIndex = 3
      const textIndex = (currentSpread - 1) * 2 + 1;
      const text = textPages[textIndex];

      if (!text) {
          return (
             <div className="flex items-center justify-center h-full opacity-30">
                 <div className="text-center">
                    <div className="w-16 h-1 bg-stone-400 mx-auto mb-2"></div>
                    <div className="text-stone-500 font-serif italic">Hết nội dung</div>
                    <div className="w-16 h-1 bg-stone-400 mx-auto mt-2"></div>
                 </div>
             </div>
          );
      }

      return (
        <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose text-stone-800 animate-fade-in pt-8">
            <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-green-900 first-letter:float-left first-letter:mr-2">
                {text}
            </p>
        </div>
      );
  };

  const renderRightPageContent = () => {
      if (!selectedMilestone) return null;

      // SPREAD 0: BÌA PHẢI (Trang đầu tiên của nội dung)
      if (currentSpread === 0) {
           const text = textPages[0];
           return (
            <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose text-stone-800 animate-fade-in pt-8">
                <p className="first-letter:text-6xl first-letter:font-display first-letter:font-black first-letter:text-green-900 first-letter:float-left first-letter:mr-3 mb-4">
                    {text}
                </p>
            </div>
           );
      }

      // SPREAD > 0: NỘI DUNG (Trang Lẻ)
      // Spread 1 -> textIndex = 2
      // Spread 2 -> textIndex = 4
      const textIndex = (currentSpread - 1) * 2 + 2;
      const text = textPages[textIndex];

      // Nếu hết chữ thì hiển thị nút Quiz
      if (!text) {
          return (
            <div className="flex flex-col justify-center items-center h-full animate-fade-in">
                <div className="mt-8 p-6 border-t-2 border-b-2 border-double border-green-800/30 text-center bg-yellow-50/50 rounded-lg w-full shadow-inner">
                    <p className="font-serif italic text-stone-600 mb-4 font-bold text-lg">Đồng chí đã hoàn thành nội dung.</p>
                    <p className="font-serif text-stone-600 mb-6">Sẵn sàng kiểm tra nhận thức?</p>
                    
                    {user ? (
                        <button 
                            onClick={startQuiz}
                            className="group relative inline-flex items-center justify-center px-8 py-3 font-serif font-bold text-white transition-all duration-200 bg-green-900 rounded shadow-lg hover:bg-green-800 hover:scale-105"
                        >
                            <span className="mr-2 uppercase tracking-wide">Làm bài thi</span>
                            <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform"/>
                        </button>
                    ) : (
                        <div className="flex flex-col items-center space-y-3">
                            <div className="text-green-700 flex items-center">
                                <Lock className="w-4 h-4 mr-1"/> Yêu cầu đăng nhập
                            </div>
                            <Link to="/login" className="px-6 py-2 bg-yellow-500 text-green-900 font-bold rounded hover:bg-yellow-400 shadow-md">
                                Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
          );
      }

      return (
        <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose text-stone-800 animate-fade-in pt-8">
            <p>{text}</p>
        </div>
      );
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen"> 
       {/* Cinematic Hero */}
       <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0">
               <img src="https://picsum.photos/1920/1080?grayscale&blur=2" alt="History background" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-b from-green-900/90 via-green-900/80 to-[#fdfbf7]"></div>
           </div>
           
           <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
               <div className="w-20 h-1 bg-yellow-500 mx-auto mb-6 shadow-[0_0_15px_rgba(179,156,77,0.6)]"></div>
               <h1 className="text-5xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 uppercase mb-6 drop-shadow-sm tracking-tight">
                   Hào Khí <br/> Sông Lam
               </h1>
               <p className="text-green-100 text-xl md:text-2xl font-light italic leading-relaxed font-serif">
                 "Lịch sử là dòng chảy không ngừng, nơi hun đúc nên hồn thiêng sông núi và khí phách người lính Cụ Hồ."
               </p>
               
               <div className="mt-12 animate-bounce-slow">
                 <ChevronDown className="h-10 w-10 text-yellow-500 mx-auto opacity-80" />
               </div>
           </div>
       </div>

       {/* Timeline Section */}
       <div className="max-w-6xl mx-auto px-4 py-20 overflow-hidden">
          <div className="relative space-y-24">
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-800 via-yellow-500 to-green-800 shadow-[0_0_10px_rgba(0,0,0,0.2)]"></div>
                {milestones.map((item, index) => (
                   <div key={index} className={`flex flex-col md:flex-row items-center group relative ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                      <div className="w-full md:w-5/12 cursor-pointer" onClick={() => setSelectedMilestone(item)}>
                          <div className={`relative bg-white p-0 rounded-lg shadow-2xl border border-stone-200 overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(52,98,63,0.4)] ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:text-left`}>
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                  <div className="bg-yellow-500 text-green-900 px-4 py-2 rounded-full font-bold flex items-center">
                                      <Book className="w-4 h-4 mr-2" /> Đọc sách
                                  </div>
                              </div>
                              <div className="h-48 overflow-hidden relative">
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                  <div className={`absolute bottom-4 z-20 px-6 w-full ${index % 2 === 0 ? 'md:right-0' : 'md:left-0'}`}>
                                      <h3 className="text-white font-display font-bold text-2xl uppercase tracking-wider shadow-black drop-shadow-md">{item.title}</h3>
                                  </div>
                              </div>
                              <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                                  <p className="text-gray-700 leading-relaxed font-light line-clamp-3 font-serif">{item.content}</p>
                              </div>
                          </div>
                      </div>
                      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 flex-col items-center justify-center z-10 mt-8 md:mt-0 pointer-events-none">
                          <div className="w-20 h-20 bg-green-900 rounded-full border-4 border-yellow-500 shadow-xl flex items-center justify-center relative">
                             <span className="text-white font-display font-bold text-xl">{item.year}</span>
                          </div>
                      </div>
                      <div className="w-full md:w-5/12"></div>
                   </div>
                ))}
          </div>
       </div>

       {/* REALISTIC BOOK MODAL */}
       {selectedMilestone && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <button 
                onClick={() => setSelectedMilestone(null)}
                className="absolute top-4 right-4 text-white hover:text-yellow-500 transition-colors z-[110]"
            >
                <X className="w-10 h-10 drop-shadow-lg" />
            </button>

            {/* Book Container - Updated to Deep Green Leather from Palette (#1E2F23) */}
            <div className="relative w-full max-w-6xl aspect-[3/2] md:aspect-[2.2/1] bg-[#1E2F23] rounded-lg shadow-2xl p-2 md:p-4 flex animate-scale-up border-[4px] border-[#0f1a12]">
                
                {/* Decorative Covers */}
                <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-black/40 to-transparent pointer-events-none rounded-l-lg z-0"></div>
                <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-black/40 to-transparent pointer-events-none rounded-r-lg z-0"></div>

                {/* The Paper Block */}
                <div className="relative z-10 w-full h-full bg-[#fdfbf7] flex flex-col md:flex-row overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-sm">
                    
                    {/* Spine Effect (The Gutter) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-16 -ml-8 z-30 bg-gradient-to-r from-transparent via-[#d6cfc2]/40 to-transparent pointer-events-none"></div>
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#bfb6a5] z-30"></div>

                    {/* QUIZ MODE OVERLAY (Full Spread) */}
                    {quizMode ? (
                        <div className="w-full h-full p-8 md:p-12 relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] flex flex-col overflow-y-auto custom-scrollbar">
                             <div className="border-b-2 border-green-900 pb-4 mb-6 flex justify-between items-center sticky top-0 bg-[#fdfbf7] z-20 pt-2">
                                <button onClick={() => setQuizMode(false)} className="flex items-center text-stone-500 hover:text-green-900 font-bold">
                                    <ArrowLeft className="w-5 h-5 mr-2"/> Quay lại đọc sách
                                </button>
                                <h3 className="text-xl font-bold text-green-900 uppercase flex items-center">
                                    <Award className="w-6 h-6 mr-2"/> Bài kiểm tra: {selectedMilestone.year}
                                </h3>
                                {isSubmitted && (
                                    <span className="text-2xl font-black text-green-700">{score}/{selectedMilestone.quiz.length} điểm</span>
                                )}
                            </div>

                            <div className="max-w-4xl mx-auto w-full space-y-6 pb-20">
                                {selectedMilestone.quiz.map((q, qIdx) => {
                                    const userAnswer = userAnswers[qIdx];
                                    const isCorrect = userAnswer === q.correctIndex;
                                    return (
                                        <div key={qIdx} className={`p-6 rounded-lg border-2 shadow-sm transition-all ${isSubmitted ? (isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-stone-200 bg-white'}`}>
                                            <p className="font-bold text-stone-900 text-lg mb-4 flex">
                                                <span className="mr-3 text-green-900 bg-green-100 px-2 rounded">Câu {qIdx + 1}</span> {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, oIdx) => {
                                                    let optClass = "w-full text-left p-3 rounded-lg border flex items-center transition-all ";
                                                    if (isSubmitted) {
                                                        if (oIdx === q.correctIndex) optClass += "bg-green-200 border-green-500 text-green-900 font-bold shadow-sm scale-[1.01]";
                                                        else if (oIdx === userAnswer && !isCorrect) optClass += "bg-red-200 border-red-400 text-red-900 opacity-80";
                                                        else optClass += "opacity-50 border-gray-100";
                                                    } else {
                                                        if (userAnswer === oIdx) optClass += "bg-yellow-100 border-yellow-500 text-yellow-900 font-medium shadow-inner";
                                                        else optClass += "bg-stone-50 hover:bg-white hover:shadow-md border-stone-200";
                                                    }
                                                    return (
                                                        <button key={oIdx} onClick={() => handleSelectOption(qIdx, oIdx)} disabled={isSubmitted} className={optClass}>
                                                            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-3 text-xs flex-shrink-0 bg-white/50">{String.fromCharCode(65 + oIdx)}</span>
                                                            {opt}
                                                            {isSubmitted && oIdx === q.correctIndex && <CheckCircle className="ml-auto w-5 h-5 text-green-700"/>}
                                                            {isSubmitted && oIdx === userAnswer && !isCorrect && <XCircle className="ml-auto w-5 h-5 text-red-700"/>}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {isSubmitted && !isCorrect && (
                                                <div className="mt-4 text-sm text-stone-700 italic bg-white/60 p-3 rounded border-l-4 border-yellow-500">
                                                    <strong>Giải thích:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
                                {!isSubmitted ? (
                                    <button onClick={handleSubmitQuiz} disabled={userAnswers.includes(null)} className={`px-8 py-3 font-bold text-white rounded-full shadow-2xl transition-all flex items-center scale-110 ${userAnswers.includes(null) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 animate-pulse'}`}>
                                        <Save className="w-5 h-5 mr-2"/> Nộp bài thi
                                    </button>
                                ) : (
                                    <button onClick={() => setQuizMode(false)} className="px-8 py-3 bg-stone-600 text-white font-bold rounded-full hover:bg-stone-700 shadow-2xl">
                                        Đóng bài thi
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        // READING MODE (Double Page Spread)
                        <>
                            {/* LEFT PAGE */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] flex flex-col justify-between border-r border-[#e5e0d3]">
                                <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
                                {/* Page Content */}
                                <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                                     {renderLeftPageContent()}
                                </div>
                                {/* Footer Page Number */}
                                <div className="mt-4 text-stone-400 text-xs font-serif text-center">- {currentSpread === 0 ? 'Bìa' : (currentSpread - 1) * 2 + 1} -</div>
                            </div>

                            {/* RIGHT PAGE */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] flex flex-col justify-between">
                                <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                                {/* Page Content */}
                                <div className="flex-grow overflow-y-auto custom-scrollbar pl-4">
                                     {renderRightPageContent()}
                                </div>
                                {/* Footer Page Number */}
                                <div className="mt-4 text-stone-400 text-xs font-serif text-center">- {(currentSpread - 1) * 2 + 2} -</div>
                            </div>
                        </>
                    )}
                </div>

                {/* NAVIGATION CONTROLS (Outside the paper block) */}
                {!quizMode && (
                    <>
                        {currentSpread > 0 && (
                            <button 
                                onClick={handlePrevSpread}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 -ml-16 bg-stone-800/80 text-white p-3 rounded-full hover:bg-yellow-500 transition-all z-50 shadow-xl border-2 border-stone-600"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                        )}
                        {currentSpread < totalSpreads - 1 && (
                            <button 
                                onClick={handleNextSpread}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 -mr-16 bg-stone-800/80 text-white p-3 rounded-full hover:bg-yellow-500 transition-all z-50 shadow-xl border-2 border-stone-600"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        )}
                    </>
                )}
            </div>
         </div>
       )}
    </div>
  );
};

export default History;