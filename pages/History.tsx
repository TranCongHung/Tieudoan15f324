
import React, { useState, useEffect } from 'react';
import { Star, Map, Flag, Award, BookOpen, ChevronDown, X, Book, ChevronLeft, ChevronRight, HelpCircle, CheckCircle, XCircle, Lock, Save, ArrowLeft, Smartphone } from 'lucide-react';
import { Link, useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { QuizResult, Milestone } from '../types';
import { useSiteSettings } from '../context/SiteContext';

const History: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await apiService.getHistory();
            setMilestones(data);
        } catch (error) {
            console.error("Lỗi đồng bộ lịch sử:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMilestone) {
      setCurrentSpread(0);
      setQuizMode(false);
      setIsSubmitted(false);
      setScore(0);
      setUserAnswers([]);
    }
  }, [selectedMilestone]);

  const getPages = (html: string) => {
    if (!html) return [];
    const pages = html.split(/<hr\s*\/?>/i);
    return pages.filter(p => p.trim() !== '');
  };

  const textPages = selectedMilestone ? getPages(selectedMilestone.story) : [];
  const totalSpreads = 1 + Math.ceil(textPages.length / 2);

  const startQuiz = () => {
      if (!user) { alert("Vui lòng đăng nhập!"); return; }
      if (selectedMilestone?.quiz?.length) {
        setQuizMode(true);
        setUserAnswers(new Array(selectedMilestone.quiz.length).fill(null));
        setIsSubmitted(false);
      } else {
        alert("Nội dung này chưa có câu hỏi.");
      }
  };

  const handleSubmitQuiz = async () => {
      if (!selectedMilestone || !user) return;
      let calculatedScore = 0;
      selectedMilestone.quiz.forEach((q, idx) => {
          if (userAnswers[idx] === q.correctAnswerIndex) calculatedScore++;
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
      await apiService.saveQuizResult(result);
  };

  const renderLeftPageContent = () => {
      if (!selectedMilestone) return null;
      if (currentSpread === 0) {
          return (
            <div className="h-full flex flex-col justify-center items-center text-center border-4 border-double border-yellow-500/20 p-4 md:p-6 relative animate-fade-in">
                <img src={selectedMilestone.image} className="w-full h-48 md:h-64 mb-6 md:mb-8 object-cover rounded shadow-md border-4 border-white/50" />
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-green-900 mb-2 uppercase drop-shadow-sm">{selectedMilestone.title}</h2>
                <div className="w-16 h-1.5 bg-yellow-500 mb-4"></div>
                <p className="text-stone-600 font-serif italic text-lg">{selectedMilestone.subtitle}</p>
            </div>
          );
      } 
      const text = textPages[(currentSpread - 1) * 2 + 1];
      return text ? <div className="prose prose-stone prose-lg max-w-none font-serif text-justify-pretty leading-loose text-stone-800 pt-4 h-full flex flex-col justify-center" dangerouslySetInnerHTML={{ __html: text }} /> : <div className="flex items-center justify-center h-full opacity-30 text-stone-500 font-serif italic">Hết nội dung</div>;
  };

  const renderRightPageContent = () => {
      if (!selectedMilestone) return null;
      if (currentSpread === 0) {
           const text = textPages[0];
           return text ? <div className="prose prose-stone prose-lg max-w-none font-serif text-justify-pretty leading-loose text-stone-800 pt-4 h-full flex flex-col justify-center" dangerouslySetInnerHTML={{ __html: text }} /> : null;
      }
      const text = textPages[(currentSpread - 1) * 2 + 2];
      if (!text) {
          return (
            <div className="flex flex-col justify-center items-center h-full animate-fade-in">
                <div className="mt-8 p-8 border-2 border-double border-green-800/30 text-center bg-yellow-50/50 rounded-lg w-full shadow-inner max-w-sm">
                    <BookOpen className="w-12 h-12 text-green-700 mx-auto mb-4 opacity-80" />
                    <p className="font-serif italic text-stone-600 mb-4 font-bold text-lg">Đồng chí đã hoàn thành nội dung.</p>
                    {user ? <button onClick={startQuiz} className="px-8 py-3 font-serif font-bold text-white bg-green-900 rounded shadow-lg uppercase tracking-wider text-sm hover:scale-105" style={{ backgroundColor: settings.primaryColor }}>Làm bài thi</button> : <Link to="/login" className="px-6 py-2 bg-yellow-500 text-green-900 font-bold rounded shadow-md text-sm">Đăng nhập để thi</Link>}
                </div>
            </div>
          );
      }
      return <div className="prose prose-stone prose-lg max-w-none font-serif text-justify-pretty leading-loose text-stone-800 pt-4 h-full flex flex-col justify-center" dangerouslySetInnerHTML={{ __html: text }} />;
  };

  if (loading) return <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center"><div className="w-12 h-12 border-4 border-green-200 rounded-full animate-spin" style={{ borderTopColor: settings.primaryColor }}></div></div>;

  return (
    <div className="bg-[#fdfbf7] min-h-screen">
       <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0">
               <img src={settings.heroImage || "https://picsum.photos/1920/1080?grayscale&blur=2"} className="w-full h-full object-cover" />
               <div className="absolute inset-0 opacity-90" style={{ background: `linear-gradient(to bottom, ${settings.primaryColor}E6, ${settings.primaryColor}CC, #fdfbf7)` }}></div>
           </div>
           <div className="relative z-10 text-center px-4 animate-fade-in-up">
               <h1 className="text-4xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 uppercase mb-4 drop-shadow-sm tracking-tighter">Hào Khí <br/> Sông Lam</h1>
           </div>
       </div>

       <div className="max-w-6xl mx-auto px-4 py-24 overflow-hidden">
          <div className="relative space-y-32">
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-transparent via-yellow-500 shadow-lg" style={{ '--tw-gradient-from': settings.primaryColor, '--tw-gradient-to': settings.primaryColor } as any}></div>
                {milestones.map((item, index) => (
                   <div key={index} className={`flex flex-col md:flex-row items-center group relative ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                      <div className="w-full md:w-5/12 cursor-pointer" onClick={() => setSelectedMilestone(item)}>
                          <div className={`relative bg-white rounded-lg shadow-2xl border-4 border-white overflow-hidden transform transition-all duration-700 hover:-translate-y-4 hover:scale-105 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                              <div className="h-56 md:h-64 overflow-hidden relative">
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center z-30 transition-opacity"><div className="bg-yellow-500 text-green-900 px-6 py-3 rounded-full font-bold flex items-center"><Book className="w-5 h-5 mr-2" /> Đọc sách</div></div>
                                  <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                  <div className="absolute bottom-6 z-20 px-8 w-full text-white font-display font-bold text-2xl uppercase tracking-wider">{item.title}</div>
                              </div>
                              <div className="p-8 bg-[#fdfbf7] text-stone-700 leading-relaxed font-serif text-lg">{item.content}</div>
                          </div>
                      </div>
                      <div className="flex md:absolute left-1/2 transform md:-translate-x-1/2 flex-col items-center justify-center z-10 my-6 md:my-0">
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 shadow-xl flex items-center justify-center relative z-20" style={{ backgroundColor: settings.primaryColor, borderColor: settings.secondaryColor }}>
                             <span className="text-white font-display font-black text-lg md:text-2xl">{item.year}</span>
                          </div>
                      </div>
                      <div className="w-full md:w-5/12"></div>
                   </div>
                ))}
          </div>
       </div>

       {selectedMilestone && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-0 md:p-4 overflow-hidden">
            <button onClick={() => setSelectedMilestone(null)} className="fixed top-4 right-4 text-white/50 hover:text-white z-[110]"><X className="w-10 h-10" /></button>
            <div className={`relative w-full h-full md:h-auto md:max-w-7xl md:aspect-[2.1/1] bg-[#1a2e22] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] flex flex-row animate-scale-up border-y-[4px] border-r-[4px] border-[#0f1a12]`}>
                <div className="relative z-10 w-full h-full bg-[#fdfbf7] flex flex-row overflow-hidden shadow-inner md:rounded-r-xl">
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-24 -ml-12 z-30 bg-gradient-to-r from-transparent via-[#d6cfc2]/50 to-transparent pointer-events-none mix-blend-multiply"></div>
                    {quizMode ? (
                        <div className="w-full h-full p-4 md:p-12 relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] flex flex-col overflow-y-auto custom-scrollbar">
                             <div className="border-b-2 border-green-900 pb-4 mb-6 flex justify-between items-center sticky top-0 bg-[#fdfbf7] z-20 pt-2">
                                <button onClick={() => setQuizMode(false)} className="flex items-center text-stone-500 font-bold uppercase tracking-wider text-xs"><ArrowLeft className="w-4 h-4 mr-2"/> Quay lại</button>
                                <h3 className="text-base md:text-xl font-bold text-green-900 uppercase flex items-center font-display"><Award className="w-6 h-6 mr-2"/> {selectedMilestone.year}</h3>
                                {isSubmitted && <span className="text-2xl font-black text-green-700 font-mono">{score}/{selectedMilestone.quiz.length}</span>}
                            </div>
                            <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
                                {selectedMilestone.quiz.map((q, qIdx) => (
                                    <div key={qIdx} className={`p-8 rounded-xl border-2 shadow-sm ${isSubmitted ? (userAnswers[qIdx] === q.correctAnswerIndex ? 'border-green-300 bg-green-50/50' : 'border-red-300 bg-red-50/50') : 'border-stone-200 bg-white'}`}>
                                        <p className="font-bold text-stone-900 text-xl mb-6 font-serif"><span className="mr-3 text-green-900 bg-green-100 px-3 py-1 rounded text-sm font-sans">Câu {qIdx + 1}</span> {q.questionText}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIdx) => (
                                                <button key={oIdx} onClick={() => !isSubmitted && setUserAnswers(prev => {const n = [...prev]; n[qIdx] = oIdx; return n;})} className={`w-full text-left p-4 rounded-lg border-2 flex items-center transition-all ${isSubmitted ? (oIdx === q.correctAnswerIndex ? 'bg-green-100 border-green-500 font-bold' : oIdx === userAnswers[qIdx] ? 'bg-red-50 border-red-400' : 'opacity-40 grayscale') : (userAnswers[qIdx] === oIdx ? 'bg-yellow-50 border-yellow-500 font-bold' : 'bg-stone-50 border-stone-200')}`}>
                                                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 text-sm font-bold bg-white/50">{String.fromCharCode(65 + oIdx)}</span>
                                                    <span>{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 md:bg-transparent flex justify-center">{!isSubmitted ? <button onClick={handleSubmitQuiz} disabled={userAnswers.includes(null)} className={`w-full md:w-auto px-10 py-4 font-bold text-white rounded-full shadow-2xl transition-all uppercase ${userAnswers.includes(null) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-800 hover:bg-green-700'}`}>Nộp bài thi</button> : <button onClick={() => setQuizMode(false)} className="w-full md:w-auto px-10 py-4 bg-stone-700 text-white font-bold rounded-full uppercase">Đóng bài thi</button>}</div>
                        </div>
                    ) : (
                        <>
                            <div className="w-1/2 p-4 md:p-16 relative flex flex-col border-r border-[#e5e0d3] h-full">
                                <div className="flex-grow overflow-y-auto custom-scrollbar">{renderLeftPageContent()}</div>
                                <div className="mt-6 text-stone-400 text-sm font-display font-bold text-center tracking-widest">- {currentSpread === 0 ? 'I' : (currentSpread - 1) * 2 + 1} -</div>
                            </div>
                            <div className="w-1/2 p-4 md:p-16 relative flex flex-col h-full">
                                <div className="flex-grow overflow-y-auto custom-scrollbar">{renderRightPageContent()}</div>
                                <div className="mt-6 text-stone-400 text-sm font-display font-bold text-center tracking-widest">- {(currentSpread - 1) * 2 + 2} -</div>
                            </div>
                        </>
                    )}
                </div>
                {!quizMode && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 pointer-events-none">
                        {currentSpread > 0 && <button onClick={() => setCurrentSpread(p => p - 1)} className="pointer-events-auto bg-stone-800 text-yellow-500 p-4 rounded-full shadow-2xl border-2 border-stone-600 group"><ChevronLeft className="w-8 h-8 group-hover:-translate-x-1" /></button>}
                        {currentSpread < totalSpreads - 1 && <button onClick={() => setCurrentSpread(p => p + 1)} className="pointer-events-auto ml-auto bg-stone-800 text-yellow-500 p-4 rounded-full shadow-2xl border-2 border-stone-600 group"><ChevronRight className="w-8 h-8 group-hover:translate-x-1" /></button>}
                    </div>
                )}
            </div>
         </div>
       )}
    </div>
  );
};

export default History;
