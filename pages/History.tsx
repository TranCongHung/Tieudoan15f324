
import React, { useState, useEffect } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight, Award, Loader2, Calendar, CheckCircle, AlertCircle, HelpCircle, XCircle, RotateCcw, Flag, Star, BookMarked, MousePointerClick, Bookmark, RotateCw, Zap, Target, TrendingUp, Trophy } from 'lucide-react';
import { useAuth, useNavigate } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Milestone, Question, QuizResult } from '../types';
import { useSiteSettings } from '../context/SiteContext';

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  // Book State
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Quiz State inside Book
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
        // Kiểm tra xem có phải mobile không (dựa vào width) và đang xoay dọc không
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await apiService.getHistory();
            console.log('Milestones loaded:', data);
            data.forEach((m, idx) => {
                console.log(`Milestone ${idx}:`, m.title, '- Quiz count:', m.quiz?.length || 0);
            });
            setMilestones(data);
        } catch (error) {
            console.error("Lỗi lấy lịch sử từ Supabase:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Reset quiz state when opening a new book
  useEffect(() => {
    if (selectedMilestone) {
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
        setCurrentSpread(0);
        setResultSaved(false);
        setIsSavingResult(false);
    }
  }, [selectedMilestone]);

  const getPages = (html: string) => {
    if (!html) return [];
    
    // Đầu tiên tách theo hr tags
    const sections = html.split(/<hr\s*\/?>/i).filter(p => p.trim() !== '');
    const pages: string[] = [];
    const MAX_CHARS_PER_PAGE = 1200; // Giới hạn ký tự mỗi trang
    
    sections.forEach(section => {
      // Nếu section nhỏ hơn giới hạn, thêm trực tiếp
      if (section.length <= MAX_CHARS_PER_PAGE) {
        pages.push(section.trim());
        return;
      }
      
      // Nếu section quá dài, tách nó thành các trang
      let currentPage = '';
      // Tách thành các đoạn bởi <p>, <div>, hoặc các tag khác
      const blocks = section.split(/(<[^>]+>)/);
      
      blocks.forEach(block => {
        // Bỏ qua các tag trống
        if (!block.trim()) return;
        
        // Nếu là tag HTML
        if (block.startsWith('<') && block.endsWith('>')) {
          currentPage += block;
          return;
        }
        
        // Nếu là text content
        const textLength = currentPage.replace(/<[^>]+>/g, '').length;
        
        // Nếu thêm text này sẽ vượt quá giới hạn
        if (textLength + block.length > MAX_CHARS_PER_PAGE && currentPage.trim()) {
          pages.push(currentPage.trim());
          currentPage = block;
        } else {
          currentPage += block;
        }
      });
      
      // Thêm phần còn lại
      if (currentPage.trim()) {
        pages.push(currentPage.trim());
      }
    });
    
    return pages;
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
      setIsFlipping(true);
      setTimeout(() => {
          setCurrentSpread(prev => direction === 'next' ? prev + 1 : prev - 1);
          setIsFlipping(false);
      }, 300);
  };

  const textPages = selectedMilestone ? getPages(selectedMilestone.story) : [];
  const storySpreadsCount = Math.ceil(textPages.length / 2);
  const hasQuiz = selectedMilestone?.quiz && selectedMilestone.quiz.length > 0;
  const totalSpreads = 1 + storySpreadsCount + (hasQuiz ? 1 : 0);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
      if (quizSubmitted) return;
      setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
      console.log('handleSubmitQuiz called');
      console.log('selectedMilestone:', selectedMilestone);
      console.log('user:', user);
      console.log('quiz data:', selectedMilestone?.quiz);
      
      if (!selectedMilestone) {
          console.error('ERROR: selectedMilestone is null/undefined');
          return;
      }
      
      if (!selectedMilestone.quiz || selectedMilestone.quiz.length === 0) {
          console.error('ERROR: selectedMilestone.quiz is missing or empty');
          return;
      }
      
      if (!user) {
          console.error('ERROR: user is null/undefined');
          setShowLoginModal(true);
          return;
      }
      
      console.log('✅ All checks passed! Quiz submitted! Calculating score...');
      let score = 0;
      selectedMilestone.quiz.forEach(q => {
          if (quizAnswers[q.id] === q.correctAnswerIndex) {
              score++;
          }
      });
      
      console.log(`Score: ${score} / ${selectedMilestone.quiz.length}`);
      setQuizScore(score);
      setQuizSubmitted(true);
      
      // Save quiz result to database
      await saveQuizResult(score, selectedMilestone.quiz.length);
  };

  const saveQuizResult = async (score: number, totalQuestions: number) => {
      if (!user || !selectedMilestone || resultSaved || isSavingResult) return;
      
      try {
          setIsSavingResult(true);
          const result: QuizResult = {
              id: `quiz_${user.id}_${selectedMilestone.id}_${Date.now()}`,
              userId: user.id,
              userName: user.name,
              userRank: user.rank,
              unit: user.unit || 'Chưa cập nhật',
              topic: selectedMilestone.title,
              score: score,
              totalQuestions: totalQuestions,
              timestamp: new Date().toISOString()
          };
          
          await apiService.saveQuizResult(result);
          setResultSaved(true);
          console.log('Quiz result saved successfully');
      } catch (error) {
          console.error('Error saving quiz result:', error);
      } finally {
          setIsSavingResult(false);
      }
  };

  const handleRetryQuiz = () => {
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
      setResultSaved(false);
  };

  const jumpToQuiz = () => {
      if (!hasQuiz) return;
      setIsFlipping(true);
      setTimeout(() => {
          setCurrentSpread(totalSpreads - 1);
          setIsFlipping(false);
      }, 300);
  };

  const renderCover = () => (
      <>
        <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-b md:border-b-0 md:border-r border-stone-300 flex flex-col justify-center items-center bg-[#fdfbf7] relative overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.02)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
             <div className="absolute inset-4 border-4 border-double border-yellow-700/20 rounded-sm pointer-events-none"></div>
             
             <div className="relative z-10 text-center animate-fade-in-up">
                 <div className="w-48 h-64 mx-auto mb-8 shadow-2xl rotate-1 border-[6px] border-white overflow-hidden rounded-sm bg-stone-200 relative group cursor-pointer" onClick={() => handlePageChange('next')}>
                     <img src={selectedMilestone?.image} className="w-full h-full object-cover sepia-[.3] group-hover:sepia-0 transition-all duration-700" alt="Cover" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                 </div>
                 <div className="font-serif text-xs font-bold tracking-[0.3em] text-stone-500 uppercase mb-3">Tư liệu lịch sử</div>
                 <h2 className="text-3xl md:text-4xl font-display font-black text-green-900 uppercase leading-tight mb-4 drop-shadow-sm px-4">
                     {selectedMilestone?.title}
                 </h2>
                 <div className="w-24 h-1.5 bg-yellow-600 mx-auto mb-6 rounded-full"></div>
                 <p className="text-xl text-stone-600 font-serif italic mb-8 px-8">{selectedMilestone?.subtitle}</p>

                 {hasQuiz && (
                     <button 
                        onClick={jumpToQuiz}
                        className="inline-flex items-center px-8 py-3 bg-red-800 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all animate-bounce border-2 border-red-500 ring-4 ring-red-100"
                     >
                         <MousePointerClick className="w-5 h-5 mr-2" /> Vào thi ngay
                     </button>
                 )}
             </div>
        </div>

        <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-16 flex-col justify-center bg-[#faf8f4] relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
            <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose animate-fade-in">
                <h3 className="text-center font-bold text-stone-400 uppercase tracking-widest text-sm mb-8 border-b border-stone-200 pb-2 w-1/3 mx-auto">Giới thiệu</h3>
                <div className="relative">
                    <QuoteIcon className="absolute -top-6 -left-6 w-10 h-10 text-stone-200/80" />
                    <p className="first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:text-green-900 text-stone-700">
                        {selectedMilestone?.content}
                    </p>
                </div>
                <div className="mt-12 text-center text-green-900 font-bold flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 flex items-center justify-center mb-3 bg-white shadow-sm">
                        <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                    <span className="font-display text-xl tracking-wide">Mốc son năm {selectedMilestone?.year}</span>
                </div>
            </div>
            <div className="absolute bottom-6 right-8 text-[10px] text-stone-400 font-bold uppercase tracking-widest">Trang Bìa</div>
        </div>
      </>
  );

  const renderContentPages = (spreadIndex: number) => {
      const leftPageIndex = (spreadIndex - 1) * 2;
      const rightPageIndex = leftPageIndex + 1;
      const leftPageContent = textPages[leftPageIndex];
      const rightPageContent = textPages[rightPageIndex];
      
      return (
          <>
            <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-r border-stone-200 flex flex-col bg-[#fdfbf7] overflow-y-auto custom-scrollbar shadow-[inset_-15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                <div className="flex-grow">
                    {leftPageContent ? (
                         <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-relaxed text-stone-800 line-clamp-none"
                              dangerouslySetInnerHTML={{ __html: leftPageContent }} />
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-5">
                            <BookOpen className="w-32 h-32" />
                        </div>
                    )}
                </div>
                <div className="mt-8 pt-4 border-t border-stone-200 text-center text-stone-400 font-bold text-xs font-serif tracking-widest">
                    - {leftPageIndex + 1} -
                </div>
            </div>

            <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-12 flex-col bg-[#faf8f4] overflow-y-auto custom-scrollbar shadow-[inset_15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                <div className="flex-grow">
                    {rightPageContent ? (
                         <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-relaxed text-stone-800 line-clamp-none"
                              dangerouslySetInnerHTML={{ __html: rightPageContent }} />
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-5">
                            <BookOpen className="w-32 h-32" />
                        </div>
                    )}
                </div>
                 <div className="mt-8 pt-4 border-t border-stone-200 text-center text-stone-400 font-bold text-xs font-serif tracking-widest">
                    - {rightPageIndex + 1} -
                </div>
            </div>
          </>
      );
  };

  const renderQuizPage = () => (
      <>
        <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-r border-stone-300 flex flex-col bg-[#fdfbf7] overflow-y-auto custom-scrollbar relative shadow-[inset_-15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
             <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-sm z-10 pb-4 border-b-2 border-green-800 mb-6 flex justify-between items-center">
                 <div className="flex items-center text-green-900">
                     <div className="bg-green-800 text-white p-2 rounded mr-3 shadow">
                        <HelpCircle className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold font-display uppercase tracking-wider text-green-900">
                            Bài tập nhận thức
                        </h2>
                        <span className="text-xs text-stone-500 font-serif">Kiểm tra kiến thức giai đoạn {selectedMilestone?.year}</span>
                     </div>
                 </div>
                 <div className="text-right">
                     <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tiến độ</span>
                     <div className="text-lg font-black text-green-800 leading-none">
                         {Object.keys(quizAnswers).length}/{selectedMilestone?.quiz?.length}
                     </div>
                 </div>
             </div>
             
             <div className="space-y-6 flex-grow pb-10">
                 {selectedMilestone?.quiz?.map((q: Question, idx: number) => (
                     <div key={q.id} className="relative pl-6 border-l-4 border-stone-300 hover:border-yellow-500 transition-colors group">
                         <div className="absolute -left-[1.3rem] top-0 w-8 h-8 rounded-full bg-white border-4 border-stone-300 group-hover:border-yellow-500 flex items-center justify-center font-bold text-stone-500 text-sm transition-colors shadow-sm">
                             {idx + 1}
                         </div>
                         <p className="font-bold text-gray-800 mb-4 font-serif text-lg leading-snug">
                             {q.questionText}
                         </p>
                         <div className="space-y-3">
                             {q.options.map((opt, optIdx) => {
                                 const isSelected = quizAnswers[q.id] === optIdx;
                                 let itemClass = "w-full text-left p-3 rounded-lg border text-sm font-serif transition-all flex items-center group relative overflow-hidden ";
                                 
                                 if (quizSubmitted) {
                                     if (optIdx === q.correctAnswerIndex) itemClass += "bg-green-100 border-green-500 text-green-900 font-bold ring-2 ring-green-500 shadow-md";
                                     else if (isSelected && optIdx !== q.correctAnswerIndex) itemClass += "bg-red-50 border-red-300 text-red-800 opacity-60";
                                     else itemClass += "border-stone-100 text-stone-400 opacity-40 bg-stone-50";
                                 } else {
                                     if (isSelected) itemClass += "bg-yellow-50 border-yellow-500 text-gray-900 ring-2 ring-yellow-400 shadow-md";
                                     else itemClass += "border-stone-200 hover:bg-white hover:border-yellow-400 hover:shadow-sm text-stone-600 bg-white";
                                 }

                                 return (
                                     <button 
                                        key={optIdx} 
                                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                                        className={itemClass}
                                        disabled={quizSubmitted}
                                     >
                                         <span className={`w-7 h-7 rounded-full border-2 flex flex-shrink-0 items-center justify-center text-xs mr-3 font-sans font-bold transition-colors ${
                                             isSelected 
                                                ? (quizSubmitted && optIdx !== q.correctAnswerIndex ? 'bg-red-500 border-red-500 text-white' : 'bg-green-800 border-green-800 text-white') 
                                                : 'border-stone-300 text-stone-400 bg-stone-50 group-hover:border-yellow-500 group-hover:text-yellow-600'
                                         }`}>
                                             {String.fromCharCode(65 + optIdx)}
                                         </span>
                                         <span className="relative z-10">{opt}</span>
                                         
                                         {quizSubmitted && optIdx === q.correctAnswerIndex && <CheckCircle className="w-5 h-5 ml-auto text-green-600 flex-shrink-0"/>}
                                         {quizSubmitted && isSelected && optIdx !== q.correctAnswerIndex && <XCircle className="w-5 h-5 ml-auto text-red-500 flex-shrink-0"/>}
                                     </button>
                                 );
                             })}
                         </div>
                         {quizSubmitted && (
                             <div className="mt-4 p-4 bg-blue-50 text-blue-900 text-sm rounded-lg border border-blue-200 font-serif animate-fade-in shadow-inner">
                                 <strong className="block mb-2 flex items-center text-blue-700 text-xs uppercase tracking-wider border-b border-blue-200 pb-1"><AlertCircle className="w-3 h-3 mr-1.5"/> Lời giải chi tiết:</strong>
                                 {q.explanation || "Không có giải thích chi tiết."}
                             </div>
                         )}
                     </div>
                 ))}
             </div>
        </div>

        <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-12 flex-col items-center justify-center bg-[#faf8f4] text-center relative shadow-[inset_15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
             <div className="absolute inset-6 border-2 border-dashed border-stone-300 rounded-2xl pointer-events-none"></div>
             
             {!quizSubmitted ? (
                 <div className="relative z-10 animate-fade-in-up w-full max-w-sm">
                     <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-yellow-500">
                         <Flag className="w-12 h-12 text-green-800" fill="currentColor" fillOpacity={0.2} />
                     </div>
                     <h3 className="text-3xl font-bold font-display text-gray-800 mb-4">Hoàn thành bài đọc</h3>
                     <p className="text-gray-600 font-serif italic mb-8">
                         "Học lịch sử không chỉ để biết quá khứ, mà còn để hiểu hiện tại và kiến tạo tương lai."
                     </p>
                     
                     <div className="space-y-4">
                         {Object.keys(quizAnswers).length === (selectedMilestone?.quiz?.length || 0) ? (
                             <button 
                                onClick={handleSubmitQuiz}
                                disabled={Object.keys(quizAnswers).length < (selectedMilestone?.quiz?.length || 0)}
                                className="w-full py-4 bg-gradient-to-r from-green-800 to-green-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center uppercase tracking-wider text-sm border-b-4 border-green-900 animate-pulse"
                             >
                                 <Award className="w-5 h-5 mr-2" /> Nộp bài & Xem kết quả
                             </button>
                         ) : (
                             <button 
                                disabled={true}
                                className="w-full py-4 bg-gray-400 text-white font-bold rounded-xl shadow-md flex items-center justify-center uppercase tracking-wider text-sm border-b-4 border-gray-500 opacity-50 cursor-not-allowed"
                             >
                                 <Award className="w-5 h-5 mr-2" /> Nộp bài & Xem kết quả
                             </button>
                         )}
                         
                         <div className="bg-stone-100 p-3 rounded-lg text-center border-2 border-stone-300">
                             <p className="text-xs text-stone-600 font-bold uppercase tracking-widest mb-1">Tiến độ</p>
                             <p className="text-2xl font-black text-green-900">{Object.keys(quizAnswers).length} / {selectedMilestone?.quiz?.length}</p>
                             {Object.keys(quizAnswers).length < (selectedMilestone?.quiz?.length || 0) && (
                                <p className="text-xs text-red-600 font-bold mt-2 animate-pulse flex items-center justify-center">
                                    ⚠️ Còn {(selectedMilestone?.quiz?.length || 0) - Object.keys(quizAnswers).length} câu chưa trả lời
                                </p>
                             )}
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="relative z-10 animate-scale-up w-full max-w-sm">
                      {/* Score Display */}
                      <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center mx-auto mb-8 shadow-2xl border-8 relative overflow-hidden ${
                          quizScore === selectedMilestone?.quiz?.length 
                              ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200' 
                              : quizScore >= (selectedMilestone?.quiz?.length || 0) * 0.7
                                  ? 'bg-gradient-to-br from-blue-300 to-blue-500 border-blue-200'
                                  : 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-200'
                      }`}>
                          {quizScore === selectedMilestone?.quiz?.length 
                              ? <Star className="w-16 h-16 text-white fill-current animate-spin-slow mb-2" />
                              : quizScore >= (selectedMilestone?.quiz?.length || 0) * 0.7
                                  ? <TrendingUp className="w-16 h-16 text-white mb-2" />
                                  : <Target className="w-16 h-16 text-white mb-2" />
                          }
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Điểm</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-stone-500 uppercase tracking-widest mb-4 text-center">Kết quả kiểm tra</h3>
                      
                      {/* Score Big Number */}
                      <div className="text-center mb-8">
                          <div className="text-8xl font-display font-black text-green-900 drop-shadow-md leading-none">
                              {quizScore}
                          </div>
                          <div className="text-2xl text-stone-400 font-bold mt-2">/ {selectedMilestone?.quiz?.length}</div>
                      </div>

                      {/* Score Percentage Bar */}
                      <div className="mb-8 bg-white p-4 rounded-xl shadow-md border border-stone-200">
                          <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-bold text-stone-600 uppercase">Đạt được</span>
                              <span className="text-lg font-black text-green-900">{Math.round((quizScore / (selectedMilestone?.quiz?.length || 1)) * 100)}%</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                              <div 
                                  className={`h-full transition-all duration-1000 ease-out ${
                                      quizScore === selectedMilestone?.quiz?.length 
                                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                          : quizScore >= (selectedMilestone?.quiz?.length || 0) * 0.7
                                              ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                              : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                  }`}
                                  style={{ width: `${(quizScore / (selectedMilestone?.quiz?.length || 1)) * 100}%` }}
                              ></div>
                          </div>
                      </div>

                      {/* Result Message */}
                      {quizScore === selectedMilestone?.quiz?.length ? (
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-900 p-6 rounded-xl font-bold mb-8 border-2 border-yellow-300 shadow-lg relative overflow-hidden animate-pulse">
                              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-yellow-200 rounded-full opacity-50"></div>
                              <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-yellow-200 rounded-full opacity-20"></div>
                              <p className="text-xl mb-2 relative z-10 flex items-center"><Zap className="w-5 h-5 mr-2" /> Xuất sắc! Đồng chí rất giỏi! 🎉</p>
                              <p className="font-serif font-normal text-sm opacity-90 relative z-10">Đã nắm vững toàn bộ nội dung lịch sử giai đoạn <strong>{selectedMilestone?.title}</strong>.</p>
                          </div>
                      ) : quizScore >= (selectedMilestone?.quiz?.length || 0) * 0.7 ? (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 p-6 rounded-xl font-bold mb-8 border-2 border-blue-300 shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-blue-200 rounded-full opacity-50"></div>
                              <p className="text-lg mb-2 relative z-10">Rất tốt! 👏</p>
                              <p className="font-serif font-normal text-sm opacity-90 relative z-10">Đồng chí đã nắm vững phần lớn nội dung. Cố gắng thêm để hiểu sâu hơn!</p>
                          </div>
                      ) : (
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-900 p-6 rounded-xl mb-8 border-2 border-orange-300 shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-orange-200 rounded-full opacity-50"></div>
                              <p className="text-lg mb-2 relative z-10">Cần cố gắng thêm! 💪</p>
                              <p className="font-serif font-normal text-sm opacity-90 relative z-10">Hãy xem lại lời giải chi tiết bên trang trái để nắm vững hơn.</p>
                          </div>
                      )}

                      {/* Test Content Info */}
                      <div className="bg-stone-100 p-4 rounded-lg mb-8 border border-stone-300 text-center">
                          <div className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-2">Nội dung kiểm tra</div>
                          <div className="text-sm font-bold text-stone-700 mb-1">{selectedMilestone?.title}</div>
                          <div className="text-xs text-stone-500">Năm {selectedMilestone?.year} • {selectedMilestone?.quiz?.length} câu hỏi</div>
                      </div>

                      {/* Save Status */}
                      {resultSaved && (
                          <div className="bg-green-50 text-green-800 p-3 rounded-lg mb-6 border border-green-200 text-xs font-bold flex items-center justify-center animate-fade-in">
                              <CheckCircle className="w-4 h-4 mr-2" /> Kết quả đã được ghi nhận vào bảng xếp hạng
                          </div>
                      )}

                      {isSavingResult && (
                          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-6 border border-blue-200 text-xs font-bold flex items-center justify-center animate-pulse">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang ghi nhận kết quả...
                          </div>
                      )}

                      <div className="flex gap-3">
                          <button 
                              onClick={handleRetryQuiz}
                              className="flex-1 inline-flex items-center justify-center px-8 py-3 border-2 border-stone-300 text-stone-600 font-bold rounded-full hover:bg-white hover:border-green-700 hover:text-green-700 transition-all hover:shadow-lg"
                          >
                              <RotateCcw className="w-4 h-4 mr-2" /> Làm lại
                          </button>
                          <button 
                              onClick={() => setSelectedMilestone(null)}
                              className="flex-1 inline-flex items-center justify-center px-8 py-3 bg-green-800 text-white font-bold rounded-full hover:bg-green-700 transition-all hover:shadow-lg"
                          >
                              <Bookmark className="w-4 h-4 mr-2" /> Quay lại
                          </button>
                      </div>
                 </div>
             )}
             
             <div className="absolute bottom-6 right-8 text-[10px] text-stone-400 font-bold uppercase tracking-widest">Trang Bài Tập</div>
        </div>
      </>
  );

  const QuoteIcon = ({className}: {className?: string}) => (
      <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
      </svg>
  );

  if (loading) {
      return (
          <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin text-green-800 mb-4" />
                  <p className="text-stone-500 font-serif italic">Đang tải dữ liệu lịch sử...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20 font-sans">
       {/* Mobile Orientation Warning Overlay */}
       {selectedMilestone && isPortraitMobile && (
         <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in">
             <RotateCw className="w-16 h-16 mb-6 animate-spin-slow text-yellow-500" />
             <h2 className="text-2xl font-bold mb-4 font-display uppercase">Vui lòng xoay ngang điện thoại</h2>
             <p className="text-gray-400 font-serif leading-relaxed">
                 Để có trải nghiệm đọc sách lịch sử tốt nhất, đồng chí vui lòng xoay ngang thiết bị.
             </p>
         </div>
       )}

       <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
           <img src={settings.heroImage} className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-slow" />
           <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#fdfbf7]"></div>
           <div className="relative z-10 text-center px-4 animate-fade-in-up w-full max-w-5xl">
               <div className="inline-flex items-center px-6 py-2 rounded-full border border-yellow-500/50 bg-black/40 backdrop-blur-md mb-8">
                   <Star className="w-4 h-4 text-yellow-500 mr-2 fill-current animate-pulse"/>
                   <span className="text-yellow-500 text-xs font-bold uppercase tracking-[0.3em]">
                       Biên niên sử hào hùng
                   </span>
               </div>
               
               <h1 className="text-6xl md:text-9xl font-display font-black uppercase tracking-tighter mb-8 transform hover:scale-105 transition-transform duration-700 cursor-default select-none relative z-10"
                   style={{
                       background: 'radial-gradient(ellipse at center, #ffffac 0%, #d2b45a 30%, #a8882d 60%, #876619 100%)',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                       textShadow: '0px 4px 3px rgba(0,0,0,0.4), 0px 8px 13px rgba(0,0,0,0.1), 0px 18px 23px rgba(0,0,0,0.1)',
                       filter: 'drop-shadow(0 5px 0 #5c420b)'
                   }}
               >
                   Sư Đoàn 324
               </h1>

               <p className="text-stone-300 font-serif italic text-lg md:text-xl max-w-3xl mx-auto border-t border-stone-500/50 pt-8 leading-relaxed">
                   <span className="text-yellow-500 text-3xl mr-2">"</span>
                   Trung dũng, kiên cường, liên tục tấn công, đoàn kết hiệp đồng, lập công tập thể
                   <span className="text-yellow-500 text-3xl ml-2">"</span>
               </p>
           </div>
       </div>

       <div className="max-w-6xl mx-auto px-4 py-12 relative z-20 -mt-24">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-stone-300 md:-translate-x-1/2 rounded-full opacity-50"></div>
          
          <div className="space-y-24">
              {milestones.length > 0 ? milestones.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                      <div key={item.id} className={`flex flex-col md:flex-row items-center relative ${isEven ? '' : 'md:flex-row-reverse'}`}>
                          
                          <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-yellow-500 border-4 border-[#fdfbf7] shadow-lg z-10 flex items-center justify-center transform -translate-x-1/2 md:translate-x-0 mt-8 md:mt-0">
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          
                          <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-20 md:text-right' : 'md:pl-20 md:text-left'} group perspective-1000`}>
                              <div 
                                className="bg-white p-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform group-hover:rotate-x-2 border-b-4 border-stone-200 hover:border-yellow-500 relative overflow-hidden"
                                onClick={() => { setSelectedMilestone(item); setCurrentSpread(0); }}
                              >
                                  <div className="relative h-64 rounded-xl overflow-hidden mb-5 z-10">
                                      <img src={item.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                      <div className="absolute top-4 right-4 bg-yellow-500 text-green-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-20 border border-yellow-300">
                                          Năm {item.year}
                                      </div>
                                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                          <div className="px-6 py-2.5 bg-white/95 backdrop-blur text-green-900 text-xs font-bold uppercase tracking-widest rounded-full opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center shadow-lg hover:scale-105">
                                              <BookOpen className="w-4 h-4 mr-2" /> Đọc lịch sử
                                          </div>
                                      </div>
                                  </div>

                                  <div className="px-6 pb-6 relative z-10">
                                      <h3 className="text-3xl font-display font-bold text-green-900 mb-3 group-hover:text-yellow-600 transition-colors leading-tight">
                                          {item.title}
                                      </h3>
                                      <p className="text-stone-500 font-serif text-sm line-clamp-2 leading-relaxed italic">
                                          {item.subtitle}
                                      </p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="w-full md:w-1/2"></div>
                      </div>
                  );
              }) : (
                  <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-stone-100">
                      <p className="text-stone-400 font-serif italic">Đang cập nhật dữ liệu lịch sử...</p>
                  </div>
              )}
          </div>
       </div>

       {selectedMilestone && (
         <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in">
            <button 
                onClick={() => setSelectedMilestone(null)} 
                className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white z-[120] transition-colors p-3 bg-white/10 rounded-full hover:bg-white/20 border border-white/10 group"
            >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
            
            <div className="relative w-full max-w-6xl aspect-[1.4/1] md:aspect-[1.6/1] max-h-[90vh] bg-[#fdfbf7] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden md:rounded-r-lg rounded-sm border-r-8 border-b-8 border-stone-800">
                
                {hasQuiz && currentSpread !== totalSpreads - 1 && (
                    <button 
                        onClick={jumpToQuiz}
                        className="absolute -right-2 md:-right-4 top-24 z-20 w-8 md:w-10 h-32 bg-red-700 rounded-r-md shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer hover:bg-red-600 transition-all border-l border-red-800 group"
                        title="Đi tới bài thi"
                    >
                        <div className="rotate-90 text-white font-bold uppercase tracking-widest text-[10px] whitespace-nowrap flex items-center gap-2">
                             <HelpCircle className="w-3 h-3 -rotate-90" /> Thi nhận thức
                        </div>
                    </button>
                )}

                <div className={`flex w-full h-full transition-opacity duration-300 ${isFlipping ? 'opacity-40' : 'opacity-100'}`}>
                    {currentSpread === 0 
                        ? renderCover()
                        : (currentSpread === totalSpreads - 1 && hasQuiz) 
                            ? renderQuizPage()
                            : renderContentPages(currentSpread)
                    }
                </div>

                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-24 -ml-12 bg-gradient-to-r from-stone-900/5 via-stone-900/20 to-stone-900/5 z-20 pointer-events-none mix-blend-multiply filter blur-sm"></div>
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-400/30 z-30"></div>

                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-900/10 to-transparent flex justify-center items-end pb-6 space-x-12 z-30 pointer-events-none">
                    <button 
                        disabled={currentSpread === 0 || isFlipping}
                        onClick={() => handlePageChange('prev')}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-stone-800 text-yellow-500 flex items-center justify-center shadow-xl disabled:opacity-0 hover:scale-110 hover:bg-stone-700 transition-all border border-stone-600 group"
                        title="Trang trước"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    
                    <span className="bg-stone-800/90 text-white px-6 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] backdrop-blur-md shadow-lg border border-stone-600/50 uppercase">
                        {currentSpread === 0 
                            ? 'Bìa sách' 
                            : (currentSpread === totalSpreads - 1 && hasQuiz) 
                                ? 'Bài tập' 
                                : `Trang ${currentSpread} / ${totalSpreads - 1}`
                        }
                    </span>

                    <button 
                        disabled={currentSpread >= totalSpreads - 1 || isFlipping}
                        onClick={() => handlePageChange('next')}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-stone-800 text-yellow-500 flex items-center justify-center shadow-xl disabled:opacity-0 hover:scale-110 hover:bg-stone-700 transition-all border border-stone-600 group"
                        title="Trang sau"
                    >
                         {currentSpread === totalSpreads - 2 && hasQuiz 
                            ? <HelpCircle className="w-6 h-6 animate-pulse text-yellow-400" /> 
                            : <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                         }
                    </button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default History;