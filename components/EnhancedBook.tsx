import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Bookmark,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Milestone, Question } from '../types';

interface EnhancedBookProps {
  milestone: Milestone;
  onClose: () => void;
  onQuizStart?: () => void;
  hasQuiz?: boolean;
  user?: any;
}

const EnhancedBook: React.FC<EnhancedBookProps> = memo(({
  milestone,
  onClose,
  onQuizStart,
  hasQuiz = false,
  user
}) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [showSettings, setShowSettings] = useState(false);
  const [pageTransition, setPageTransition] = useState<'slide' | 'flip' | 'fade'>('flip');
  
  const bookRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Calculate total spreads (pages)
  const totalSpreads = React.useMemo(() => {
    const pages = milestone.story?.split(/<hr\s*\/?>/i).filter(p => p.trim() !== '') || [];
    return pages.length + (hasQuiz ? 1 : 0) + 1; // +1 for cover, +1 for quiz
  }, [milestone.story, hasQuiz]);

  // Handle page navigation with animations
  const handlePageChange = useCallback((direction: 'prev' | 'next') => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    
    setTimeout(() => {
      if (direction === 'prev' && currentSpread > 0) {
        setCurrentSpread(prev => prev - 1);
      } else if (direction === 'next' && currentSpread < totalSpreads - 1) {
        setCurrentSpread(prev => prev + 1);
      }
      
      setTimeout(() => setIsFlipping(false), 50);
    }, 300);
  }, [currentSpread, totalSpreads, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePageChange('prev');
          break;
        case 'ArrowRight':
          handlePageChange('next');
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setIsFullscreen(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePageChange, isFullscreen, onClose]);

  // Audio controls
  const toggleAudio = useCallback(() => {
    if (!audioRef.current || !milestone.narrationAudio) return;
    
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsAudioPlaying(!isAudioPlaying);
  }, [isAudioPlaying, milestone.narrationAudio]);

  // Theme classes
  const themeClasses = {
    light: 'bg-[#fdfbf7] text-stone-900',
    sepia: 'bg-[#f4f1ea] text-stone-800',
    dark: 'bg-[#1a1a1a] text-stone-100'
  };

  // Page transition classes
  const transitionClasses = {
    slide: isFlipping ? 'animate-slide-in-right' : '',
    flip: isFlipping ? 'animate-page-flip-right' : '',
    fade: isFlipping ? 'animate-fade-in' : ''
  };

  // Render cover page
  const renderCover = () => (
    <div className="w-full h-full flex">
      <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-b md:border-b-0 md:border-r border-stone-300 flex flex-col justify-center items-center bg-gradient-to-br from-stone-50 to-stone-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-4 border-4 border-double border-stone-300 rounded-sm" />
        </div>
        
        <div className="relative z-10 text-center animate-fade-in-up">
          {/* Book icon with animation */}
          <div className="w-32 h-32 mx-auto mb-8 animate-rotate-scale">
            <div className="w-full h-full bg-gradient-to-br from-stone-600 to-stone-800 rounded-lg shadow-2xl flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{milestone.year}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 font-display leading-tight">
            {milestone.title}
          </h1>
          
          <p className="text-lg text-stone-600 mb-8 font-serif italic">
            {milestone.subtitle}
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span>Lịch sử Tiểu đoàn 15</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-12 flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-4 border-4 border-dashed border-stone-300 rounded-2xl" />
        </div>
        
        <div className="relative z-10 text-center max-w-md animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="w-24 h-24 mx-auto mb-6 animate-float">
            <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">📖</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Mốc Son Lịch Sử</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            Khám phá những sự kiện quan trọng đã làm nên lịch sử hào hùng của đơn vị.
          </p>
          
          <div className="space-y-3">
            {hasQuiz && (
              <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
                <HelpCircle className="w-4 h-4" />
                <span>Có bài kiểm tra nhận thức</span>
              </div>
            )}
            {milestone.narrationAudio && (
              <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
                <Volume2 className="w-4 h-4" />
                <span>Có thuyết minh audio</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render content pages
  const renderContentPages = () => {
    const pages = milestone.story?.split(/<hr\s*\/?>/i).filter(p => p.trim() !== '') || [];
    const pageIndex = currentSpread - 1;
    
    if (pageIndex < 0 || pageIndex >= pages.length) return null;
    
    const content = pages[pageIndex];
    
    return (
      <div className="w-full h-full flex">
        <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-r border-stone-200 overflow-y-auto custom-scrollbar">
          <div 
            className="prose prose-lg max-w-none"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-12 items-center justify-center bg-gradient-to-br from-stone-50 to-white">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 animate-pulse-slow">
              <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">📄</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">Trang {currentSpread}</h3>
            <p className="text-stone-600 text-sm">
              {pageIndex + 1} / {pages.length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render quiz page
  const renderQuizPage = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center animate-bounce-in">
        <div className="w-32 h-32 mx-auto mb-6 animate-elastic-bounce">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <HelpCircle className="w-16 h-16 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-stone-800 mb-4">Bài Kiểm Tra</h2>
        <p className="text-stone-600 mb-8">Kiểm tra kiến thức về {milestone.title}</p>
        <button
          onClick={onQuizStart}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 button-press"
        >
          Bắt đầu bài thi
        </button>
      </div>
    </div>
  );

  return (
    <div 
      ref={bookRef}
      className={`
        fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-black/95'} 
        backdrop-blur-md flex items-center justify-center p-0 md:p-8
        transition-all duration-300
      `}
    >
      {/* Audio element */}
      {milestone.narrationAudio && (
        <audio ref={audioRef} src={milestone.narrationAudio} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-4 left-4 z-60 bg-white rounded-xl shadow-2xl p-6 w-80 animate-fade-in-up">
          <h3 className="font-bold text-lg mb-4">Cài đặt đọc</h3>
          
          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Kích thước chữ</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="p-2 bg-stone-100 rounded hover:bg-stone-200"
              >
                A-
              </button>
              <span className="flex-1 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="p-2 bg-stone-100 rounded hover:bg-stone-200"
              >
                A+
              </button>
            </div>
          </div>
          
          {/* Theme */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chủ đề</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'sepia', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-2 rounded capitalize ${
                    theme === t ? 'bg-green-600 text-white' : 'bg-stone-100'
                  }`}
                >
                  {t === 'light' ? 'Sáng' : t === 'sepia' ? 'Kem' : 'Tối'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Page Transition */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hiệu ứng trang</label>
            <div className="grid grid-cols-3 gap-2">
              {(['slide', 'flip', 'fade'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPageTransition(t)}
                  className={`p-2 rounded capitalize ${
                    pageTransition === t ? 'bg-green-600 text-white' : 'bg-stone-100'
                  }`}
                >
                  {t === 'slide' ? 'Trượt' : t === 'flip' ? 'Lật' : 'Mờ'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Container */}
      <div className={`
        relative w-full max-w-6xl aspect-[1.4/1] md:aspect-[1.6/1] 
        max-h-[90vh] ${themeClasses[theme]} 
        shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] 
        flex flex-col md:flex-row overflow-hidden 
        md:rounded-r-lg rounded-sm 
        border-r-8 border-b-8 border-stone-800
        transition-all duration-300
      `}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 text-stone-600 hover:text-stone-900 z-60 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all button-press"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 left-4 md:top-8 md:left-8 text-stone-600 hover:text-stone-900 z-60 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all button-press"
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 left-20 md:top-8 md:left-20 text-stone-600 hover:text-stone-900 z-60 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all button-press"
        >
          {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>

        {/* Audio Button */}
        {milestone.narrationAudio && (
          <button
            onClick={toggleAudio}
            className="absolute top-4 left-36 md:top-8 md:left-36 text-stone-600 hover:text-stone-900 z-60 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all button-press"
          >
            {isAudioPlaying ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        )}

        {/* Quiz Jump Button */}
        {hasQuiz && currentSpread !== totalSpreads - 1 && (
          <button
            onClick={() => setCurrentSpread(totalSpreads - 1)}
            className="absolute -right-2 md:-right-4 top-24 z-20 w-8 md:w-10 h-32 bg-red-600 rounded-r-md shadow-lg flex items-center justify-center hover:bg-red-500 transition-all group"
          >
            <div className="rotate-90 text-white font-bold text-xs whitespace-nowrap">
              Đi thi
            </div>
          </button>
        )}

        {/* Page Content */}
        <div className={`flex w-full h-full transition-opacity duration-300 ${isFlipping ? 'opacity-40' : 'opacity-100'} ${transitionClasses[pageTransition]}`}>
          {currentSpread === 0 ? (
            renderCover()
          ) : currentSpread === totalSpreads - 1 && hasQuiz ? (
            renderQuizPage()
          ) : (
            renderContentPages()
          )}
        </div>

        {/* Page Navigation */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent flex justify-center items-end pb-6 space-x-12 z-30 pointer-events-none">
          <button
            disabled={currentSpread === 0 || isFlipping}
            onClick={() => handlePageChange('prev')}
            className="pointer-events-auto w-12 h-12 rounded-full bg-stone-800 text-yellow-500 flex items-center justify-center shadow-xl disabled:opacity-0 hover:scale-110 transition-all button-press"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="bg-stone-800/90 text-white px-6 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
            {currentSpread === 0
              ? 'Bìa'
              : currentSpread === totalSpreads - 1 && hasQuiz
              ? 'Bài thi'
              : `Trang ${currentSpread}`
            }
          </span>

          <button
            disabled={currentSpread >= totalSpreads - 1 || isFlipping}
            onClick={() => handlePageChange('next')}
            className="pointer-events-auto w-12 h-12 rounded-full bg-stone-800 text-yellow-500 flex items-center justify-center shadow-xl disabled:opacity-0 hover:scale-110 transition-all button-press"
          >
            {currentSpread === totalSpreads - 2 && hasQuiz ? (
              <HelpCircle className="w-6 h-6 animate-pulse" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

EnhancedBook.displayName = 'EnhancedBook';

export default EnhancedBook;
