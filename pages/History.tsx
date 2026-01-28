import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight, Award, Loader2, Calendar, CheckCircle, AlertCircle, HelpCircle, XCircle, RotateCcw, Flag, Star, BookMarked, MousePointerClick, Bookmark, RotateCw, Zap, Target, TrendingUp, Trophy, Eye, Users, Copy, Check, Highlighter, Music, Volume2, VolumeX, Filter, SortAsc, SortDesc, Search, Clock, Heart, Share2, Download, Settings, ChevronDown, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useAuth, useNavigate } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Milestone, Question, QuizResult, ReadHistory } from '../types';
import { useSiteSettings } from '../context/SiteContext';
import { useCachedAsync } from '../hooks/useCache';
import MilestoneCard from '../components/MilestoneCard';
import EnhancedBook from '../components/EnhancedBook';

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [filteredMilestones, setFilteredMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  // Enhanced UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'year' | 'title' | 'recent'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  
  // URL Parameters
  const [urlMilestoneId, setUrlMilestoneId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [hasReadMilestone, setHasReadMilestone] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [readHistory, setReadHistory] = useState<ReadHistory[]>([]);
  const [showReadersPage, setShowReadersPage] = useState(false);
  const [currentReaderPage, setCurrentReaderPage] = useState(0);
  const [isFlippingReaders, setIsFlippingReaders] = useState(false);
  
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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getPages = useCallback((html: string) => {
    if (!html) return [];

    const toSafeHtmlParagraphs = (text: string) => {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return escaped
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
    };

    const normalizedHtml = /<\s*[a-z][\s\S]*>/i.test(html) ? html : toSafeHtmlParagraphs(html);
    
    // Đầu tiên tách theo hr tags
    const sections = normalizedHtml.split(/<hr\s*\/?>/i).filter(p => p.trim() !== '');
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
  }, []);

  // Computed values
  const textPages = useMemo(() => {
    const source = selectedMilestone?.story || selectedMilestone?.content;
    if (!source) return [];
    return getPages(source);
  }, [selectedMilestone, getPages]);

  const hasQuiz = useMemo(() => {
    return selectedMilestone?.quiz && selectedMilestone.quiz.length > 0;
  }, [selectedMilestone]);

  const totalSpreads = useMemo(() => {
    const pages = textPages.length;
    // Cover + content pages + optional quiz page
    return hasQuiz ? Math.ceil(pages / 2) + 2 : Math.ceil(pages / 2) + 1;
  }, [textPages, hasQuiz]);

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

  // Check URL parameter to auto-open milestone
  useEffect(() => {
    const pathname = window.location.pathname;
    console.log('📍 Current pathname:', pathname);
    
    // Check if it's a sub-route like /history/123456
    if (pathname.startsWith('/history/')) {
        const milestoneId = pathname.replace('/history/', '');
        console.log('🔍 Extracted milestone ID from URL:', milestoneId);
        setUrlMilestoneId(milestoneId);
    } else {
        // Fallback to query parameter
        const params = new URLSearchParams(window.location.search);
        const queryMilestoneId = params.get('milestone');
        console.log('🔍 URL Params check:', { queryMilestoneId, urlParam: params.toString() });
        if (queryMilestoneId) {
            setUrlMilestoneId(queryMilestoneId);
            console.log('📌 Set URL Milestone ID from query:', queryMilestoneId);
        }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await apiService.getHistory();
            console.log('📚 Milestones loaded:', data.length, 'items');
            console.log('📋 Milestone IDs:', data.map(m => ({ id: m.id, title: m.title })));
            data.forEach((m, idx) => {
                console.log(`Milestone ${idx}:`, m.title, '- ID:', m.id, '- Quiz count:', m.quiz?.length || 0);
            });
            setMilestones(data);
            
            // Auto-open milestone if URL parameter exists
            if (urlMilestoneId) {
                console.log('🔍 Looking for milestone ID:', urlMilestoneId);
                const milestone = data.find(m => m.id === urlMilestoneId);
                if (milestone) {
                    console.log('✅ Found milestone:', milestone.title);
                    setSelectedMilestone(milestone);
                    setCurrentSpread(1); // Jump directly to first page
                    console.log('✅ Auto-opened milestone from URL:', milestone.title);
                } else {
                    console.log('❌ Milestone not found for ID:', urlMilestoneId);
                    console.log('Available IDs:', data.map(m => m.id));
                }
            }
        } catch (error) {
            console.error("Lỗi lấy lịch sử từ Supabase:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [urlMilestoneId]);

  // Reset quiz state when opening a new book
  useEffect(() => {
    if (selectedMilestone) {
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
        // Nếu có URL parameter, không reset currentSpread
        if (!urlMilestoneId) {
            setCurrentSpread(0);
        }
        setResultSaved(false);
        setIsSavingResult(false);
        setHasReadMilestone(false);
        setReadHistory([]);
        
        // Check if user has already read this milestone
        if (user) {
            checkReadStatus();
            loadReadHistory();
        }
    }
  }, [selectedMilestone, urlMilestoneId]);

  // Auto-mark as read when user goes to first page
  useEffect(() => {
    if (currentSpread > 0 && !hasReadMilestone && user && selectedMilestone) {
        handleMarkAsReadAuto();
    }
  }, [currentSpread]);

  const checkReadStatus = async () => {
    if (!user || !selectedMilestone) return;
    try {
        const hasRead = await apiService.checkUserHasReadMilestone(user.id, selectedMilestone.id);
        setHasReadMilestone(hasRead);
    } catch (error) {
        console.error("Lỗi kiểm tra trạng thái đã đọc:", error);
    }
  };

  const loadReadHistory = async () => {
    if (!selectedMilestone) return;
    try {
        const history = await apiService.getReadHistoryByMilestone(selectedMilestone.id);
        setReadHistory(history);
    } catch (error) {
        console.error("Lỗi tải lịch sử đọc:", error);
    }
  };

  const handleMarkAsReadAuto = async () => {
    if (!user || !selectedMilestone || hasReadMilestone) return;
    
    try {
        setIsMarkingAsRead(true);
        await apiService.markMilestoneAsRead(
            user.id,
            user.name,
            user.rank,
            user.unit || 'Chưa cập nhật',
            selectedMilestone.id,
            selectedMilestone.title
        );
        setHasReadMilestone(true);
        await loadReadHistory();
        console.log('✅ Tự động ghi nhận: người dùng', user.name, 'đã đọc', selectedMilestone.title);
    } catch (error) {
        console.error('❌ Lỗi ghi nhận tự động:', error);
    } finally {
        setIsMarkingAsRead(false);
    }
  };

  const handlePageChange = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSpread > 0) {
      setCurrentSpread(prev => prev - 1);
    } else if (direction === 'next') {
      setCurrentSpread(prev => prev + 1);
    }
  }, [currentSpread]);

  const handleMilestoneSelect = useCallback((milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setCurrentSpread(0);
  }, []);

  const handleQuizStart = useCallback(() => {
    if (selectedMilestone && hasQuiz && totalSpreads) {
      setCurrentSpread(totalSpreads - 1);
    }
  }, [selectedMilestone, hasQuiz, totalSpreads]);

  const processedMilestones = useMemo(() => {
    let filtered = [...milestones];
    
    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.subtitle.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query) ||
        m.year.includes(query)
      );
    }
    
    // Apply year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(m => m.year === filterYear);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(m => parseInt(m.year) >= parseInt(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(m => parseInt(m.year) <= parseInt(dateRange.end));
    }
    
    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(m => 
        selectedTags.some(tag => 
          m.title.toLowerCase().includes(tag.toLowerCase()) ||
          m.subtitle.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'year':
          comparison = parseInt(a.year) - parseInt(b.year);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'vi');
          break;
        case 'recent':
          // Sort by recency (newer first)
          comparison = parseInt(b.year) - parseInt(a.year);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [milestones, searchQuery, filterYear, filterCategory, sortBy, sortOrder]);

  // Update filtered milestones when processed data changes
  useEffect(() => {
    setFilteredMilestones(processedMilestones);
  }, [processedMilestones]);
  
  // Get unique years for filter dropdown
  const availableYears = useMemo(() => {
    const years = [...new Set(milestones.map(m => m.year))].sort();
    return years;
  }, [milestones]);
  
  // Performance: Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchQuery(query);
      }, 300);
    };
  }, []);
  
  // Toggle favorite
  const toggleFavorite = useCallback((milestoneId: string) => {
    setFavorites(prev => {
      if (prev.includes(milestoneId)) {
        return prev.filter(id => id !== milestoneId);
      } else {
        return [...prev, milestoneId];
      }
    });
    // Save to localStorage
    const updated = favorites.includes(milestoneId) 
      ? favorites.filter(id => id !== milestoneId)
      : [...favorites, milestoneId];
    localStorage.setItem('favoriteMilestones', JSON.stringify(updated));
  }, [favorites]);
  
  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteMilestones');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Enhanced UI Components
  const FilterControls = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-stone-200 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, nội dung, năm..."
            className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Chế độ lưới"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Chế độ danh sách"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
        
        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all duration-200 text-stone-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            showFilters ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Năm</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tất cả các năm</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Sắp xếp theo</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="year">Năm</option>
              <option value="title">Tên</option>
              <option value="recent">Gần đây</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Thứ tự</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  sortOrder === 'asc'
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <SortAsc className="w-4 h-4" />
                Tăng dần
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  sortOrder === 'desc'
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <SortDesc className="w-4 h-4" />
                Giảm dần
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between">
        <p className="text-sm text-stone-600">
          Hiển thị <span className="font-semibold text-green-700">{filteredMilestones.length}</span> trên{' '}
          <span className="font-semibold">{milestones.length}</span> mốc lịch sử
        </p>
        
        {/* Reset Filters */}
        {(searchQuery || filterYear !== 'all' || filterCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterYear('all');
              setFilterCategory('all');
              setSortBy('year');
              setSortOrder('asc');
            }}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors duration-200"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>
    </div>
  );

  const handleSelectAnswer = useCallback((questionId: string, optionIndex: number) => {
      if (quizSubmitted) return;
      setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

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

  const QuoteIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
    </svg>
  );

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

                 <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                   <button
                     onClick={() => handlePageChange('next')}
                     className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-green-400"
                   >
                     <BookOpen className="w-5 h-5 mr-2" /> Đọc nội dung
                   </button>

                   {hasQuiz && (
                     <button
                       onClick={jumpToQuiz}
                       className="inline-flex items-center justify-center px-8 py-3 bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all border-2 border-red-500"
                     >
                       <HelpCircle className="w-5 h-5 mr-2" /> Vào thi
                     </button>
                   )}
                 </div>
             </div>
        </div>

        <div className="hidden md:flex w-full md:w-1/2 h-full p-8 md:p-16 flex-col justify-center bg-[#faf8f4] relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
            <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose animate-fade-in">
                <h3 className="text-center font-bold text-stone-400 uppercase tracking-widest text-sm mb-8 border-b border-stone-200 pb-2 w-1/3 mx-auto">Giới thiệu</h3>
                <div className="relative">
                    <QuoteIcon className="absolute -top-6 -left-6 w-10 h-10 text-stone-200/80" />
                    <p className="first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:text-green-900 text-stone-700 whitespace-pre-line">
                        {selectedMilestone?.story || selectedMilestone?.content}
                    </p>
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

  const renderQuizPage = () => {
      return (
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
                     <div className="text-lg font-black text-green-900 leading-none">
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
                          <div className="bg-green-50 text-green-800 p-6 rounded-xl font-bold mb-8 border-2 border-green-200 shadow-lg relative overflow-hidden animate-pulse">
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
};

  const renderReadersPage = () => {
      const itemsPerPage = 10;
      const startIndex = currentReaderPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageReaders = readHistory.slice(startIndex, endIndex);
      const totalPages = Math.ceil(readHistory.length / itemsPerPage);
      
      return (
          <>
            <div className="w-full md:w-1/2 h-full p-8 md:p-12 border-r border-stone-200 flex flex-col bg-[#fdfbf7] overflow-y-auto custom-scrollbar shadow-[inset_-15px_0_25px_rgba(0,0,0,0.03)] bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setShowReadersPage(false)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReaderPageChange('prev')}
                      disabled={currentReaderPage === 0}
                      className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReaderPageChange('next')}
                      disabled={currentReaderPage >= totalPages - 1}
                      className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Trang sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-grow">
                    <div className="mb-8 pb-4 border-b-2 border-blue-800">
                        <h2 className="text-2xl font-bold font-display text-blue-900 mb-2 flex items-center gap-2">
                            <Eye className="w-6 h-6" /> Danh sách người đã đọc
                        </h2>
                        <p className="text-sm text-stone-600 font-serif">{selectedMilestone?.title}</p>
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
                        Những cán bộ, chiến sĩ đã nắm vũ lực lịch sử giai đoạn <strong>{selectedMilestone?.year}</strong>
                    </p>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200 mb-6">
                        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mb-2">Thông tin tài liệu</p>
                        <p className="text-sm font-bold text-stone-700 mb-1">{selectedMilestone?.title}</p>
                        <p className="text-xs text-stone-500">Năm {selectedMilestone?.year}</p>
                    </div>

                    <p className="text-stone-400 text-sm">Lướt qua các trang để xem danh sách đầy đủ</p>
                </div>
                
                <div className="absolute bottom-6 right-8 text-[10px] text-stone-400 font-bold uppercase tracking-widest">Trang Danh Sách</div>
            </div>
          </>
      );
  };

  useEffect(() => {
    const src = selectedMilestone?.narrationAudio;

    if (!src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (isAudioPlaying) setIsAudioPlaying(false);
      return;
    }

    if (!audioRef.current || audioRef.current.src !== src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(src);
    }

    if (isAudioPlaying) {
      audioRef.current.play().catch(() => {
        setIsAudioPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isAudioPlaying, selectedMilestone]);

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

       {/* Main Content */}
       {selectedMilestone ? (
        // Book View Modal
        <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in">
          <button 
            onClick={() => {
              setSelectedMilestone(null);
              setCurrentSpread(0);
              setShowReadersPage(false);
              setIsAudioPlaying(false);
            }} 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white z-[120] transition-colors p-3 bg-white/10 rounded-full hover:bg-white/20 border border-white/10 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="relative w-full max-w-6xl aspect-[1.4/1] md:aspect-[1.6/1] max-h-[90vh] bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-lg">
            
            {/* Book Spine */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-amber-900 to-amber-800 z-10 shadow-lg">
              <div className="h-full flex items-center justify-center">
                <div className="text-white text-xs font-bold writing-mode-vertical transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                  {selectedMilestone?.title}
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className={`flex w-full h-full transition-opacity duration-500 ${isFlipping ? 'opacity-50' : 'opacity-100'}`}>
                {showReadersPage
                  ? renderReadersPage()
                  : (currentSpread === 0 
                      ? renderCover()
                      : (currentSpread === totalSpreads - 1 && hasQuiz) 
                        ? renderQuizPage()
                        : renderContentPages(currentSpread)
                    )
                }
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-20">
              <button 
                disabled={currentSpread === 0 || isFlipping}
                onClick={() => handlePageChange('prev')}
                className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                title="Trang trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="bg-gray-800/90 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm">
                {currentSpread === 0 
                  ? 'Bìa' 
                  : (currentSpread === totalSpreads - 1 && hasQuiz) 
                    ? 'Bài tập' 
                    : `Trang ${currentSpread}/${totalSpreads - 1}`
                }
              </div>

              <button 
                disabled={currentSpread >= totalSpreads - 1 || isFlipping}
                onClick={() => handlePageChange('next')}
                className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                title="Trang sau"
              >
                 {currentSpread === totalSpreads - 2 && hasQuiz 
                    ? <HelpCircle className="w-5 h-5 animate-pulse" /> 
                    : <ChevronRight className="w-5 h-5" />
                 }
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <button
                onClick={() => setShowReadersPage(true)}
                className="w-10 h-10 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-lg hover:bg-white transition-all"
                title="Danh sách người đã đọc"
              >
                <Users className="w-5 h-5" />
              </button>

              {selectedMilestone?.narrationAudio && (
                <button
                  onClick={() => setIsAudioPlaying(v => !v)}
                  className="w-10 h-10 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  title={isAudioPlaying ? 'Tắt thuyết minh' : 'Nghe thuyết minh'}
                >
                  {isAudioPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}

              {hasQuiz && (
                <button
                  onClick={jumpToQuiz}
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all"
                  title="Đi tới bài thi"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
       ) : (
        // Milestones List View
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Controls */}
          <FilterControls />
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-700 mb-4" />
                <p className="text-stone-600 font-medium">Đang tải mốc lịch sử...</p>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && filteredMilestones.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-600 mb-2">Không tìm thấy mốc lịch sử</h3>
              <p className="text-stone-500">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            </div>
          )}
          
          {/* Milestones Grid/List */}
          {!loading && filteredMilestones.length > 0 && (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }>
              {filteredMilestones.map((milestone, index) => (
                viewMode === 'grid' ? (
                  <MilestoneCard key={milestone.id} milestone={milestone} index={index} onSelect={() => handleMilestoneSelect(milestone)} />
                ) : (
                  <div
                    key={milestone.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-4 border border-stone-200 hover:border-green-400 cursor-pointer"
                    onClick={() => handleMilestoneSelect(milestone)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full uppercase tracking-wider">
                            Năm {milestone.year}
                          </span>
                          {milestone.quiz && milestone.quiz.length > 0 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              {milestone.quiz.length} câu hỏi
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1 truncate hover:text-green-700 transition-colors duration-200">
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-stone-600 truncate">{milestone.subtitle}</p>
                      </div>
                      <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200">
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
       )}
    </div>
  );
};

export default History;