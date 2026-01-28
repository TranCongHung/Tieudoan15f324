import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Highlighter,
  Copy,
  Check,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  Loader2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  XCircle,
  Flag,
  Star,
  BookMarked,
  MousePointerClick,
  Bookmark,
  RotateCcw,
  Zap,
  Target,
  TrendingUp,
  Trophy,
  Eye,
  Users,
  X,
  RotateCw,
  Music,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Download,
  Settings,
  Clock,
  Filter,
  Search,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth, useNavigate } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Milestone, Question } from '../types';

interface HighlightedSegment {
  id: string;
  text: string;
  color: string;
  timestamp: string;
}

const HistoryDetail: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // Milestone State
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced UI State
  const [viewMode, setViewMode] = useState<'book' | 'scroll'>('book');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [readingProgress, setReadingProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageTransition, setPageTransition] = useState<'slide' | 'fade' | 'flip'>('slide');
  const [selectedColor, setSelectedColor] = useState<string>('yellow');
  const [copied, setCopied] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  // Book State
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  // Readers State
  const [readHistory, setReadHistory] = useState<any[]>([]);
  const [showReadersPage, setShowReadersPage] = useState(false);
  const [currentReaderPage, setCurrentReaderPage] = useState(0);
  const [isFlippingReaders, setIsFlippingReaders] = useState(false);

  // Read Status
  const [hasReadMilestone, setHasReadMilestone] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  // Highlights
  const [highlights, setHighlights] = useState<HighlightedSegment[]>([]);
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  // Extract milestone ID from URL/hash
  const getMilestoneId = (): string | null => {
    let path = window.location.hash.slice(1) || window.location.pathname;
    console.log('📍 Current path/hash:', path);
    
    let match = path.match(/\/history\/detail\/([^/?#]+)/);
    if (match && match[1]) {
      console.log('✅ Found ID from detail path:', match[1]);
      return match[1];
    }

    match = path.match(/\/history\/([^/?#]+)/);
    if (match && match[1] && match[1] !== 'detail') {
      console.log('✅ Found ID from history path:', match[1]);
      return match[1];
    }

    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id');
    if (queryId) {
      console.log('✅ Found ID from query:', queryId);
      return queryId;
    }

    console.log('❌ No milestone ID found');
    return null;
  };

  // Fetch milestone data
  useEffect(() => {
    const fetchMilestone = async () => {
      const id = getMilestoneId();
      console.log('🔍 Extracted ID:', id);
      
      if (!id) {
        setError('ID đại đoạn không hợp lệ. Vui lòng quay lại và chọn một đại đoạn.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const milestones = await apiService.getHistory();
        console.log('📚 Loaded milestones:', milestones.map(m => ({ id: m.id, title: m.title })));
        
        const found = milestones.find((m) => m.id === id);
        console.log('🔎 Search result for ID', id, ':', found ? 'FOUND' : 'NOT FOUND');
        
        if (!found) {
          setError('Không tìm thấy đại đoạn lịch sử. Vui lòng quay lại và chọn lại.');
        } else {
          console.log('✅ Milestone loaded:', found.title);
          setMilestone(found);
          await loadReadHistory(found.id);
        }
      } catch (err) {
        setError('Lỗi tải dữ liệu. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestone();

    const handleHashChange = () => {
      fetchMilestone();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load highlights from localStorage
  useEffect(() => {
    if (milestone) {
      const saved = localStorage.getItem(`highlights-${milestone.id}`);
      if (saved) {
        try {
          setHighlights(JSON.parse(saved));
        } catch {
          setHighlights([]);
        }
      }
    }
  }, [milestone]);

  // Save highlights to localStorage
  useEffect(() => {
    if (milestone && highlights.length > 0) {
      localStorage.setItem(`highlights-${milestone.id}`, JSON.stringify(highlights));
    }
  }, [highlights, milestone]);

  // Auto-mark as read when going to first page
  useEffect(() => {
    if (currentSpread > 0 && !hasReadMilestone && user && milestone) {
      handleMarkAsReadAuto();
    }
  }, [currentSpread]);

  // Get pages for book view
  const getPages = useCallback((html: string) => {
    if (!html) return [];
    
    const sections = html.split(/<hr\s*\/?>/i).filter(p => p.trim() !== '');
    const pages: string[] = [];
    const MAX_CHARS_PER_PAGE = 1200;
    
    sections.forEach(section => {
      if (section.length <= MAX_CHARS_PER_PAGE) {
        pages.push(section.trim());
        return;
      }
      
      let currentPage = '';
      const blocks = section.split(/(<[^>]+>)/);
      
      blocks.forEach(block => {
        if (!block.trim()) return;
        
        if (block.startsWith('<') && block.endsWith('>')) {
          currentPage += block;
          return;
        }
        
        const textLength = currentPage.replace(/<[^>]+>/g, '').length;
        
        if (textLength + block.length > MAX_CHARS_PER_PAGE && currentPage.trim()) {
          pages.push(currentPage.trim());
          currentPage = block;
        } else {
          currentPage += block;
        }
      });
      
      if (currentPage.trim()) {
        pages.push(currentPage.trim());
      }
    });
    
    return pages;
  }, []);

  const textPages = useMemo(() => milestone ? getPages(milestone.story) : [], [milestone, getPages]);
  const storySpreadsCount = useMemo(() => Math.ceil(textPages.length / 2), [textPages]);
  const hasQuiz = useMemo(() => milestone?.quiz && milestone.quiz.length > 0, [milestone]);
  const totalSpreads = useMemo(() => 1 + storySpreadsCount + (hasQuiz ? 1 : 0), [storySpreadsCount, hasQuiz]);

  const loadReadHistory = async (milestoneId: string) => {
    try {
      const history = await apiService.getReadHistoryByMilestone(milestoneId);
      setReadHistory(history);
    } catch (error) {
      console.error("Lỗi tải lịch sử đọc:", error);
    }
  };

  const handleMarkAsReadAuto = async () => {
    if (!user || !milestone || hasReadMilestone) return;
    
    try {
      setIsMarkingAsRead(true);
      await apiService.markMilestoneAsRead(
        user.id,
        user.name,
        user.rank,
        user.unit || 'Chưa cập nhật',
        milestone.id,
        milestone.title
      );
      setHasReadMilestone(true);
      await loadReadHistory(milestone.id);
      console.log('✅ Tự động ghi nhận: người dùng', user.name, 'đã đọc', milestone.title);
    } catch (error) {
      console.error('❌ Lỗi ghi nhận tự động:', error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSpread(prev => direction === 'next' ? prev + 1 : prev - 1);
      setIsFlipping(false);
    }, 300);
  }, []);

  const handleSelectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  }, []);

  const handleSubmitQuiz = async () => {
    const totalQuestions = milestone?.quiz?.length || 0;
    let score = 0;

    milestone?.quiz?.forEach((q: Question) => {
      const answer = quizAnswers[q.id];
      if (answer === q.correctAnswerIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (user) {
      try {
        setIsSavingResult(true);
        const result = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userRank: user.rank,
          unit: user.unit || 'Chưa cập nhật',
          topic: milestone?.title || '',
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

  const handleReaderPageChange = useCallback((direction: 'next' | 'prev') => {
    setIsFlippingReaders(true);
    setTimeout(() => {
      const maxPage = Math.ceil(readHistory.length / 10) - 1;
      setCurrentReaderPage(prev => {
        if (direction === 'next') return prev < maxPage ? prev + 1 : prev;
        return prev > 0 ? prev - 1 : prev;
      });
      setIsFlippingReaders(false);
    }, 300);
  }, [readHistory.length]);

  // Highlight functions
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      setShowHighlightToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setToolbarPosition({
      top: rect.top + window.scrollY - 50,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setShowHighlightToolbar(true);
  };

  const addHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;

    const text = selection.toString();
    const newHighlight: HighlightedSegment = {
      id: Date.now().toString(),
      text,
      color,
      timestamp: new Date().toLocaleString('vi-VN'),
    };

    setHighlights([...highlights, newHighlight]);
    setShowHighlightToolbar(false);
    selection.removeAllRanges();
  };

  const removeHighlight = (id: string) => {
    setHighlights(highlights.filter((h) => h.id !== id));
  };

  const getColorStyle = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-200 text-yellow-900',
      green: 'bg-green-200 text-green-900',
      blue: 'bg-blue-200 text-blue-900',
      pink: 'bg-pink-200 text-pink-900',
      orange: 'bg-orange-200 text-orange-900',
    };
    return colors[color] || colors.yellow;
  };

  const getColorLabel = (color: string): string => {
    const labels: Record<string, string> = {
      yellow: '🟨 Vàng',
      green: '🟩 Xanh',
      blue: '🟦 Xanh dương',
      pink: '🟥 Hồng',
      orange: '🟧 Cam',
    };
    return labels[color] || color;
  };

  // Render functions
  const renderCover = () => (
    <>
      <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-b md:border-b-0 md:border-r border-stone-300 flex flex-col justify-center items-center bg-[#fdfbf7] relative overflow-hidden shadow-[inset_-10px_0_20px_rgba(0,0,0,0.02)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
        <div className="absolute inset-4 border-4 border-double border-yellow-700/20 rounded-sm pointer-events-none"></div>
        
        <div className="relative z-10 text-center animate-fade-in-up">
          <div className="w-48 h-64 mx-auto mb-8 shadow-2xl rotate-1 border-[6px] border-white overflow-hidden rounded-sm bg-stone-200 relative group cursor-pointer" onClick={() => handlePageChange('next')}>
            <img src={milestone?.image} className="w-full h-full object-cover sepia-[.3] group-hover:sepia-0 transition-all duration-700" alt="Cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>
          <div className="font-serif text-xs font-bold tracking-[0.3em] text-stone-500 uppercase mb-3">Tư liệu lịch sử</div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-green-900 uppercase leading-tight mb-4 drop-shadow-sm px-4">
            {milestone?.title}
          </h2>
          <div className="w-24 h-1.5 bg-yellow-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-stone-600 font-serif italic mb-8 px-8">{milestone?.subtitle}</p>

          {readHistory.length > 0 && (
            <button 
              onClick={() => setShowReadersPage(true)}
              className="inline-flex items-center justify-center px-6 py-2 mb-6 text-stone-700 text-xs font-bold uppercase tracking-widest rounded-full border-2 border-stone-300 hover:border-yellow-500 hover:text-yellow-600 transition-all"
            >
              <Users className="w-4 h-4 mr-1.5" /> 
              {readHistory.length} người đã đọc
            </button>
          )}

          {hasQuiz && (
            <button 
              onClick={jumpToQuiz}
              className="inline-flex items-center px-8 py-3 bg-red-800 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all animate-bounce border-2 border-red-500 ring-4 ring-red-100"
            >
              <MousePointerClick className="w-5 h-5 mr-2" /> Vào thi ngay
            </button>
          )}

          {milestone?.narrationAudio && (
            <button 
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all border-2 border-blue-500 ml-3"
            >
              {isAudioPlaying ? (
                <>
                  <VolumeX className="w-5 h-5 mr-2" /> Tắt âm thanh
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-2" /> Nghe thuyết minh
                </>
              )}
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
              {milestone?.content}
            </p>
          </div>
          <div className="mt-12 text-center text-green-900 font-bold flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-yellow-500/30 flex items-center justify-center mb-3 bg-white shadow-sm">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <span className="font-display text-xl tracking-wide">Mốc son năm {milestone?.year}</span>
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
              <span className="text-xs text-stone-500 font-serif">Kiểm tra kiến thức giai đoạn {milestone?.year}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tiến độ</span>
            <div className="text-lg font-black text-green-800 leading-none">
              {Object.keys(quizAnswers).length}/{milestone?.quiz?.length}
            </div>
          </div>
        </div>
        
        <div className="space-y-6 flex-grow pb-10">
          {milestone?.quiz?.map((q: Question, idx: number) => (
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
              {Object.keys(quizAnswers).length === (milestone?.quiz?.length || 0) ? (
                <button 
                  onClick={handleSubmitQuiz}
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
                <p className="text-2xl font-black text-green-900">{Object.keys(quizAnswers).length} / {milestone?.quiz?.length}</p>
                {Object.keys(quizAnswers).length < (milestone?.quiz?.length || 0) && (
                  <p className="text-xs text-red-600 font-bold mt-2 animate-pulse flex items-center justify-center">
                    ⚠️ Còn {(milestone?.quiz?.length || 0) - Object.keys(quizAnswers).length} câu chưa trả lời
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 animate-scale-up w-full max-w-sm">
            <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center mx-auto mb-8 shadow-2xl border-8 relative overflow-hidden ${
              quizScore === milestone?.quiz?.length 
                ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200' 
                : quizScore >= (milestone?.quiz?.length || 0) * 0.7
                  ? 'bg-gradient-to-br from-blue-300 to-blue-500 border-blue-200'
                  : 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-200'
            }`}>
              {quizScore === milestone?.quiz?.length 
                ? <Star className="w-16 h-16 text-white fill-current animate-spin-slow mb-2" />
                : quizScore >= (milestone?.quiz?.length || 0) * 0.7
                  ? <TrendingUp className="w-16 h-16 text-white mb-2" />
                  : <Target className="w-16 h-16 text-white mb-2" />
              }
              <span className="text-white text-xs font-bold uppercase tracking-wider">Điểm</span>
            </div>
            
            <h3 className="text-2xl font-bold text-stone-500 uppercase tracking-widest mb-4 text-center">Kết quả kiểm tra</h3>
            
            <div className="text-center mb-8">
              <div className="text-8xl font-display font-black text-green-900 drop-shadow-md leading-none">
                {quizScore}
              </div>
              <div className="text-2xl text-stone-400 font-bold mt-2">/ {milestone?.quiz?.length}</div>
            </div>

            <div className="mb-8 bg-white p-4 rounded-xl shadow-md border border-stone-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-stone-600 uppercase">Đạt được</span>
                <span className="text-lg font-black text-green-900">{Math.round((quizScore / (milestone?.quiz?.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    quizScore === milestone?.quiz?.length 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : quizScore >= (milestone?.quiz?.length || 0) * 0.7
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}
                  style={{ width: `${(quizScore / (milestone?.quiz?.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {quizScore === milestone?.quiz?.length ? (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-900 p-6 rounded-xl font-bold mb-8 border-2 border-yellow-300 shadow-lg relative overflow-hidden animate-pulse">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-yellow-200 rounded-full opacity-50"></div>
                <p className="text-xl mb-2 relative z-10 flex items-center"><Zap className="w-5 h-5 mr-2" /> Xuất sắc! Đồng chí rất giỏi! 🎉</p>
                <p className="font-serif font-normal text-sm opacity-90 relative z-10">Đã nắm vững toàn bộ nội dung lịch sử giai đoạn <strong>{milestone?.title}</strong>.</p>
              </div>
            ) : quizScore >= (milestone?.quiz?.length || 0) * 0.7 ? (
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

            <div className="bg-stone-100 p-4 rounded-lg mb-8 border border-stone-300 text-center">
              <div className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-2">Nội dung kiểm tra</div>
              <div className="text-sm font-bold text-stone-700 mb-1">{milestone?.title}</div>
              <div className="text-xs text-stone-500">Năm {milestone?.year} • {milestone?.quiz?.length} câu hỏi</div>
            </div>

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
                onClick={() => navigate('/history')}
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

  const renderReadersPage = () => {
    const itemsPerPage = 10;
    const startIndex = currentReaderPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageReaders = readHistory.slice(startIndex, endIndex);
    const totalPages = Math.ceil(readHistory.length / itemsPerPage);

    return (
      <>
        <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-r border-stone-200 flex flex-col bg-[#fdfbf7] overflow-y-auto custom-scrollbar shadow-[inset_-15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
          <div className="flex-grow">
            <div className="mb-8 pb-4 border-b-2 border-blue-800">
              <h2 className="text-2xl font-bold font-display text-blue-900 mb-2 flex items-center gap-2">
                <Eye className="w-6 h-6" /> Danh sách người đã đọc
              </h2>
              <p className="text-sm text-stone-600 font-serif">{milestone?.title}</p>
            </div>

            <div className="space-y-4 pb-10">
              {pageReaders.map((reader, idx) => (
                <div key={reader.id} className="flex items-center justify-between p-4 bg-white rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 flex-grow">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {startIndex + idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-stone-800">{reader.userName}</p>
                      <p className="text-xs text-stone-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">{reader.userRank}</span>
                        <span className="text-stone-500">{reader.unit}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-500 font-mono">
                      {new Date(reader.readAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(reader.readAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-stone-200 text-center">
              <p className="text-sm text-stone-500 font-bold">
                Trang {currentReaderPage + 1} / {totalPages} • Tổng: {readHistory.length} người
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-12 flex-col items-center justify-center bg-[#faf8f4] text-center relative shadow-[inset_15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
          <div className="absolute inset-6 border-2 border-dashed border-stone-300 rounded-2xl pointer-events-none"></div>
          
          <div className="relative z-10 animate-fade-in-up w-full max-w-sm">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-blue-500">
              <Users className="w-12 h-12 text-blue-700" />
            </div>
            <h3 className="text-3xl font-bold font-display text-gray-800 mb-4">
              {readHistory.length} Người Đã Đọc
            </h3>
            <p className="text-gray-600 font-serif italic mb-8">
              Những cán bộ, chiến sĩ đã nắm vũ lực lịch sử giai đoạn <strong>{milestone?.year}</strong>
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200 mb-6">
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-2">Thông tin tài liệu</p>
              <p className="text-sm font-bold text-stone-700 mb-1">{milestone?.title}</p>
              <p className="text-xs text-stone-500">Năm {milestone?.year}</p>
            </div>

            <p className="text-stone-400 text-sm">Lướt qua các trang để xem danh sách đầy đủ</p>
          </div>
          
          <div className="absolute bottom-6 right-8 text-[10px] text-stone-400 font-bold uppercase tracking-widest">Trang Danh Sách</div>
        </div>
      </>
    );
  };

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

  if (error || !milestone) {
    const id = getMilestoneId();
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-lg text-red-600 mb-2 font-bold">⚠️ {error || 'Không tìm thấy dữ liệu'}</p>
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-left text-sm text-red-700 text-xs">
            <p className="mb-1">Debug Info:</p>
            <p>URL Hash: {window.location.hash}</p>
            <p>Extracted ID: {id || 'không có'}</p>
            <p>Pathname: {window.location.pathname}</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20 font-sans">
      {/* Book Modal */}
      <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in">
        <button 
          onClick={() => navigate('/history')} 
          className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white z-[120] transition-colors p-3 bg-white/10 rounded-full hover:bg-white/20 border border-white/10 group"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        </button>

        {milestone?.narrationAudio && (
            <audio 
                autoPlay={isAudioPlaying}
                controls
                className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-[120] bg-white/10 rounded-lg p-2 backdrop-blur-md border border-white/20"
            >
                <source src={milestone.narrationAudio} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ thẻ audio.
            </audio>
        )}

        <div className="relative w-full max-w-7xl aspect-[1.4/1] md:aspect-[1.8/1] max-h-[85vh] bg-[#fdfbf7] shadow-[0_0_40px_rgba(0,0,0,0.6),0_20px_80px_-20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] flex flex-col md:flex-row overflow-hidden rounded-lg border-r-[12px] border-b-[12px] border-stone-800 hover:shadow-[0_0_50px_rgba(0,0,0,0.7),0_25px_100px_-20px_rgba(0,0,0,0.5)] transition-shadow duration-300">
          
          {hasQuiz && currentSpread !== totalSpreads - 1 && (
            <button 
              onClick={jumpToQuiz}
              className="absolute -right-2 md:-right-4 top-24 z-20 w-8 md:w-10 h-32 bg-red-700 rounded-r-md shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer hover:bg-red-600 transition-all border-l border-red-800 group"
              title="Đi tới bài thi"
            >
              <HelpCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          )}

          <div className={`flex w-full h-full transition-opacity duration-300 ${isFlipping ? 'opacity-40' : 'opacity-100'}`}>
            {currentSpread === 0 ? renderCover() : currentSpread === totalSpreads - 1 && hasQuiz ? renderQuizPage() : renderContentPages(currentSpread)}
          </div>

          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-32 -ml-16 bg-gradient-to-r from-black/0 via-black/15 to-black/0 z-20 pointer-events-none filter blur-sm"></div>
          <div className="hidden md:block absolute left-1/2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-stone-300/50 via-stone-400/30 to-stone-300/50 z-30 -ml-px"></div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 via-black/10 to-transparent flex justify-center items-end pb-6 space-x-4 md:space-x-6 z-30 pointer-events-none px-4 md:px-0">
            <button 
              disabled={currentSpread === 0 || isFlipping}
              onClick={() => handlePageChange('prev')}
              className="pointer-events-auto flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 text-yellow-400 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.4)] disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] hover:scale-110 hover:from-stone-600 hover:to-stone-800 active:scale-95 transition-all border border-stone-500/50 group backdrop-blur-sm"
              title="Trang trước"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            <div className="bg-gradient-to-r from-stone-800/95 to-stone-900/95 text-stone-100 px-6 py-2 rounded-lg text-[11px] font-bold tracking-[0.15em] backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.4)] border border-stone-500/40 uppercase flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {currentSpread === 0 && <BookMarked className="w-4 h-4 text-yellow-400" />}
                {currentSpread === totalSpreads - 1 && hasQuiz && <HelpCircle className="w-4 h-4 text-red-400 animate-pulse" />}
                <span>
                  {currentSpread === 0 
                    ? '📖 BÌA SÁCH' 
                    : (currentSpread === totalSpreads - 1 && hasQuiz) 
                      ? '❓ BÀI TẬP' 
                      : `📄 TRANG ${currentSpread} / ${totalSpreads - 1}`
                  }
                </span>
              </div>
            </div>

            <button 
              disabled={currentSpread >= totalSpreads - 1 || isFlipping}
              onClick={() => handlePageChange('next')}
              className="pointer-events-auto flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 text-yellow-400 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.4)] disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] hover:scale-110 hover:from-stone-600 hover:to-stone-800 active:scale-95 transition-all border border-stone-500/50 group backdrop-blur-sm"
              title="Trang sau"
            >
              {currentSpread === totalSpreads - 2 && hasQuiz 
                ? <HelpCircle className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" /> 
                : <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Readers Page Modal */}
      {showReadersPage && milestone && (
        <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in">
          <button 
            onClick={() => {
              setShowReadersPage(false);
              setCurrentReaderPage(0);
            }} 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white z-[120] transition-colors p-3 bg-white/10 rounded-full hover:bg-white/20 border border-white/10 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="relative w-full max-w-6xl aspect-[1.4/1] md:aspect-[1.6/1] max-h-[90vh] bg-[#fdfbf7] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden md:rounded-r-lg rounded-sm border-r-8 border-b-8 border-stone-800">
            
            <div className={`flex w-full h-full transition-opacity duration-300 ${isFlippingReaders ? 'opacity-40' : 'opacity-100'}`}>
              {renderReadersPage()}
            </div>

            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-24 -ml-12 bg-gradient-to-r from-stone-900/5 via-stone-900/20 to-stone-900/5 z-20 pointer-events-none mix-blend-multiply filter blur-sm"></div>
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-400/30 z-30"></div>

            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-900/10 to-transparent flex justify-center items-end pb-6 space-x-12 z-30 pointer-events-none">
              <button 
                disabled={currentReaderPage === 0 || isFlippingReaders}
                onClick={() => handleReaderPageChange('prev')}
                className="pointer-events-auto w-12 h-12 rounded-full bg-stone-800 text-yellow-500 flex items-center justify-center shadow-xl disabled:opacity-0 hover:scale-110 hover:bg-stone-700 transition-all border border-stone-600 group"
                title="Trang trước"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <span className="bg-stone-800/90 text-white px-6 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] backdrop-blur-md shadow-lg border border-stone-600/50 uppercase">
                Trang {currentReaderPage + 1} / {Math.ceil(readHistory.length / 10)}
              </span>

              <button 
                disabled={currentReaderPage >= Math.ceil(readHistory.length / 10) - 1 || isFlippingReaders}
                onClick={() => handleReaderPageChange('next')}
                className="pointer-events-auto w-12 h-12 rounded-full bg-stone-800 text-yellow-500 flex items-center justify-center shadow-xl disabled:opacity-0 hover:scale-110 hover:bg-stone-700 transition-all border border-stone-600 group"
                title="Trang sau"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Highlight Toolbar */}
      {showHighlightToolbar && (
        <div
          className="fixed bg-white rounded-lg shadow-xl p-2 flex gap-1 z-50"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${Math.max(20, toolbarPosition.left - 120)}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {['yellow', 'green', 'blue', 'pink', 'orange'].map((color) => (
            <button
              key={color}
              onClick={() => addHighlight(color)}
              className={`w-8 h-8 rounded transition hover:scale-110 ${getColorStyle(color)}`}
              title={getColorLabel(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryDetail;