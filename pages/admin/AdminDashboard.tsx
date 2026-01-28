import React, { useState, useEffect, useRef } from 'react';
import { Article, User, Question, Score, DocumentFile, MediaItem, Leader, SiteSettings, Milestone } from '../../types';
import { apiService } from '../../services/api';
// Removed AI service import
import { 
  Users, FileText, HelpCircle, Award, Folder, Plus, Trash2, Edit, Save, X, Loader2, Film, Music, LogOut, Search, ChevronLeft, ChevronRight, Filter,
  Image as ImageIcon, Calendar, User as UserIcon, Eye, ArrowLeft, CheckCircle, Check,
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, Quote, Link as LinkIcon, Undo, Redo, Code, Monitor, Palette, Upload, Maximize, Move, Shield,
  Download, FileSpreadsheet, BarChart3, CalendarDays, FolderPlus, File, Home, DownloadCloud, Briefcase, Layout as LayoutIcon, Clock, Scissors
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteContext';
import * as XLSX from 'xlsx';

type Tab = 'articles' | 'personnel' | 'questions' | 'scores' | 'documents' | 'media' | 'leaders' | 'appearance' | 'history';
type ViewMode = 'list' | 'editor';
type TimeFilter = 'day' | 'week' | 'month';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('articles');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); 
  
  // Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]); 
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Site Settings (Via Context)
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);

  // Document Manager States
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<DocumentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Score Chart Filter States
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Media Upload State
  const [mediaSourceType, setMediaSourceType] = useState<'link' | 'upload'>('link');
  const [mediaThumbSourceType, setMediaThumbSourceType] = useState<'link' | 'upload'>('link');

  // Article/History Editor States
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState(''); // Stores HTML
  const [editorSummary, setEditorSummary] = useState('');
  const [editorImage, setEditorImage] = useState('');
  const [editorAuthor, setEditorAuthor] = useState(''); // For Articles
  const [editorDate, setEditorDate] = useState(''); // For Articles
  const [editorYear, setEditorYear] = useState(''); // For History
  const [editorSubtitle, setEditorSubtitle] = useState(''); // For History
  const [editorIcon, setEditorIcon] = useState('Flag'); // For History
  const [editorNarrationAudio, setEditorNarrationAudio] = useState(''); // For History Narration Audio
  const [narrationAudioSourceType, setNarrationAudioSourceType] = useState<'link' | 'upload'>('link');
  
  const [featuredImgSourceType, setFeaturedImgSourceType] = useState<'link' | 'upload'>('link');
  
  // Awareness Questions for History
  const [awarenessQuestions, setAwarenessQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  // Question Management Enhancement
  const [selectedMilestoneForQuestions, setSelectedMilestoneForQuestions] = useState<string>('all');
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [questionBeingEdited, setQuestionBeingEdited] = useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] = useState<Partial<Question & { milestoneId?: string }>>({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    milestoneId: ''
  });
  
  // Advanced Editor States
  const [isVisualMode, setIsVisualMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null); // For Body content images
  const featuredImageInputRef = useRef<HTMLInputElement>(null); // For Featured image
  const narrationAudioInputRef = useRef<HTMLInputElement>(null); // For Narration Audio
  const editorContentRef = useRef<HTMLDivElement>(null); // Ref for ContentEditable div
  const excelInputRef = useRef<HTMLInputElement>(null); // For Excel Upload
  const docInputRef = useRef<HTMLInputElement>(null); // For Document Upload
  const settingLogoInputRef = useRef<HTMLInputElement>(null); // For Settings Logo
  const settingHeroInputRef = useRef<HTMLInputElement>(null); // For Settings Hero

  // Image Resizing State
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [overlayPos, setOverlayPos] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const navigate = useNavigate();
  const { logout, user: currentUser } = useAuth(); 

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser]);

  useEffect(() => {
    // Load all critical data in parallel on mount
    Promise.all([
      apiService.getArticles().then(data => setArticles(data)),
      apiService.getUsers().then(data => setUsersList(data)),
      apiService.getHistory().then(data => setMilestones(data))
    ]).catch(error => console.error("Failed to load initial data:", error));
  }, []);

  // Lazy load data when switching tabs
  useEffect(() => {
    const tabDataMap: Record<Tab, string> = {
      articles: 'articles',
      personnel: 'users',
      questions: 'questions',
      scores: 'scores',
      documents: 'documents',
      media: 'media',
      leaders: 'leaders',
      history: 'history',
      appearance: 'appearance'
    };

    if (activeTab === 'questions' && questions.length === 0) {
      apiService.getQuestions().then(data => setQuestions(data));
    } else if (activeTab === 'scores' && scores.length === 0) {
      apiService.getScores().then(data => setScores(data));
    } else if (activeTab === 'documents' && documents.length === 0) {
      apiService.getDocuments().then(data => setDocuments(data));
    } else if (activeTab === 'media' && mediaItems.length === 0) {
      apiService.getMedia().then(data => setMediaItems(data));
    } else if (activeTab === 'leaders' && leaders.length === 0) {
      apiService.getLeaders().then(data => setLeaders(data));
    }
  }, [activeTab, questions.length, scores.length, documents.length, mediaItems.length, leaders.length]);

  useEffect(() => {
      setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    setSearchTerm('');
    if (activeTab !== 'articles' && activeTab !== 'history') {
        setViewMode('list');
    }
  }, [activeTab]);

  useEffect(() => {
      if (activeTab === 'documents') {
          if (!currentFolderId) {
              setFolderPath([]);
          } else {
              const path: DocumentFile[] = [];
              let curr = documents.find(d => d.id === currentFolderId);
              while (curr) {
                  path.unshift(curr);
                  if (curr.parentId) {
                      curr = documents.find(d => d.id === curr!.parentId);
                  } else {
                      curr = undefined;
                  }
              }
              setFolderPath(path);
          }
      }
  }, [currentFolderId, documents, activeTab]);

  useEffect(() => {
      if (isModalOpen && (activeTab === 'media' || activeTab === 'leaders')) {
          if (editingItem && (editingItem.url || editingItem.image)) {
              const src = editingItem.url || editingItem.image;
              if (src.startsWith('data:')) {
                  setMediaSourceType('upload');
              } else {
                  setMediaSourceType('link');
              }
          } else {
              setMediaSourceType('link');
          }
          if (editingItem && editingItem.thumbnail && editingItem.thumbnail.startsWith('data:')) {
              setMediaThumbSourceType('upload');
          } else {
              setMediaThumbSourceType('link');
          }
      } else {
          setMediaSourceType('link');
          setMediaThumbSourceType('link');
      }
  }, [isModalOpen, editingItem, activeTab]);

  useEffect(() => {
    if (isVisualMode && editorContentRef.current) {
        if (editorContentRef.current.innerHTML !== editorContent) {
             editorContentRef.current.innerHTML = editorContent;
        }
    }
  }, [isVisualMode, editingItem]); 

  useEffect(() => {
    if (selectedImg && editorContentRef.current) {
        const updateOverlay = () => {
            if (!selectedImg || !selectedImg.isConnected) {
                setSelectedImg(null);
                return;
            }
            const editorRect = editorContentRef.current!.getBoundingClientRect();
            const imgRect = selectedImg.getBoundingClientRect();

            setOverlayPos({
                top: imgRect.top - editorRect.top + editorContentRef.current!.scrollTop,
                left: imgRect.left - editorRect.left + editorContentRef.current!.scrollLeft,
                width: imgRect.width,
                height: imgRect.height
            });
        };
        updateOverlay();
        const resizeObserver = new ResizeObserver(updateOverlay);
        resizeObserver.observe(selectedImg);
        editorContentRef.current.addEventListener('scroll', updateOverlay);
        window.addEventListener('resize', updateOverlay);
        return () => {
            resizeObserver.disconnect();
            editorContentRef.current?.removeEventListener('scroll', updateOverlay);
            window.removeEventListener('resize', updateOverlay);
        };
    }
  }, [selectedImg]);

  // Load data in parallel for better performance
  const refreshData = async (tabToLoad?: Tab) => {
    try {
      const targetTab = tabToLoad || activeTab;
      const loadPromises: Promise<any>[] = [];

      // Only load data for specific tabs when requested (lazy loading)
      if (!tabToLoad || targetTab === 'articles') {
        loadPromises.push(
          apiService.getArticles().then(data => setArticles(data))
        );
      }
      if (!tabToLoad || targetTab === 'personnel') {
        loadPromises.push(
          apiService.getUsers().then(data => setUsersList(data))
        );
      }
      if (!tabToLoad || targetTab === 'questions') {
        loadPromises.push(
          apiService.getQuestions().then(data => setQuestions(data))
        );
      }
      if (!tabToLoad || targetTab === 'scores') {
        loadPromises.push(
          apiService.getScores().then(data => setScores(data))
        );
      }
      if (!tabToLoad || targetTab === 'documents') {
        loadPromises.push(
          apiService.getDocuments().then(data => setDocuments(data))
        );
      }
      if (!tabToLoad || targetTab === 'media') {
        loadPromises.push(
          apiService.getMedia().then(data => setMediaItems(data))
        );
      }
      if (!tabToLoad || targetTab === 'leaders') {
        loadPromises.push(
          apiService.getLeaders().then(data => setLeaders(data))
        );
      }
      if (!tabToLoad || targetTab === 'history') {
        loadPromises.push(
          apiService.getHistory().then(data => setMilestones(data))
        );
      }

      // Load all selected data in parallel
      await Promise.all(loadPromises);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = async (id: string, type: Tab) => {
    if (type === 'personnel' && id === currentUser?.id) {
        alert("Không thể xóa tài khoản đang đăng nhập!");
        return;
    }

    if (type === 'documents') {
        const item = documents.find(d => d.id === id);
        if (item?.isFolder) {
            const hasChildren = documents.some(d => d.parentId === id);
            if (hasChildren) {
                alert("Không thể xóa thư mục này vì đang chứa dữ liệu bên trong. Vui lòng xóa hết các mục con trước.");
                return;
            }
        }
    }

    if (!window.confirm("Đồng chí có chắc chắn muốn xóa dữ liệu này? Hành động không thể hoàn tác.")) return;
    
    try {
        switch (type) {
            case 'articles': await apiService.deleteArticle(id); break;
            case 'history': await apiService.deleteMilestone(id); break;
            case 'personnel': await apiService.deleteUser(id); break;
            case 'questions': await apiService.deleteQuestion(id); break;
            case 'scores': await apiService.deleteScore(id); break;
            case 'documents': await apiService.deleteDocument(id); break;
            case 'media': await apiService.deleteMedia(id); break;
            case 'leaders': await apiService.deleteLeader(id); break;
        }
        await refreshData();
    } catch (e) {
        alert("Lỗi khi xóa dữ liệu. Vui lòng thử lại.");
    }
  };

  // --- SITE SETTINGS LOGIC ---
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTempSettings({
          ...tempSettings,
          [e.target.name]: e.target.value
      });
  };

  const handleSettingsImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImage') => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
          alert("Ảnh quá lớn (Giới hạn 2MB)");
          return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
          setTempSettings({
              ...tempSettings,
              [field]: evt.target?.result as string
          });
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
  };

  const saveSiteSettings = async () => {
      await apiService.saveSettings(tempSettings);
      updateSettings(tempSettings); // Update Context
      alert("Đã lưu cấu hình giao diện thành công!");
  };

  // --- DOCUMENT MANAGER LOGIC ---
  const handleFolderClick = (folderId: string) => {
      setCurrentFolderId(folderId);
      setSearchTerm('');
  };

  // Add Download Logic
  const handleDownload = (item: DocumentFile) => {
      if (item.isFolder) return;
      try {
          const element = document.createElement("a");
          const fileContent = `Nội dung giả lập của tệp tin: ${item.name}\n\nKích thước: ${item.size}\nNgày tạo: ${item.date}\n\nĐây là tính năng tải xuống demo của hệ thống.`;
          const file = new Blob([fileContent], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          const downloadName = item.name.includes('.') ? item.name : `${item.name}.txt`;
          element.download = downloadName;
          document.body.appendChild(element); 
          element.click();
          document.body.removeChild(element);
      } catch (err) {
          alert("Lỗi khi tải xuống tệp tin.");
      }
  };

  const handleCreateFolder = async () => {
      const name = prompt("Nhập tên thư mục mới:");
      if (name && name.trim()) {
          const newFolder: DocumentFile = {
              id: `folder_${Date.now()}`,
              name: name.trim(),
              isFolder: true,
              parentId: currentFolderId,
              date: new Date().toISOString().split('T')[0],
              size: '--',
              type: 'FOLDER'
          };
          await apiService.createDocument(newFolder);
          refreshData();
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      if (isDragging) setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
          processFiles(files);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          processFiles(Array.from(e.target.files));
      }
      e.target.value = ''; // Reset
  };

  const processFiles = async (files: File[]) => {
      for (const file of files) {
          const newDoc: DocumentFile = {
              id: `doc_${Date.now()}_${Math.random()}`,
              name: file.name,
              isFolder: false,
              parentId: currentFolderId,
              type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              date: new Date().toISOString().split('T')[0]
          };
          await apiService.createDocument(newDoc);
      }
      refreshData();
  };

  // --- CHART DATA PROCESSING ---
  const getChartData = () => {
      if (scores.length === 0) return [];

      const targetDate = new Date(filterDate);
      let filteredScores: Score[] = [];

      if (timeFilter === 'day') {
          filteredScores = scores.filter(s => s.date === filterDate);
      } else if (timeFilter === 'week') {
          const day = targetDate.getDay();
          const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1); 
          const startOfWeek = new Date(targetDate);
          startOfWeek.setDate(diff);
          startOfWeek.setHours(0,0,0,0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23,59,59,999);

          filteredScores = scores.filter(s => {
              const d = new Date(s.date);
              return d >= startOfWeek && d <= endOfWeek;
          });
      } else if (timeFilter === 'month') {
          filteredScores = scores.filter(s => {
              const d = new Date(s.date);
              return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
          });
      }

      const groupedData: Record<string, { totalScore: number; count: number }> = {};
      
      filteredScores.forEach(s => {
          if (!groupedData[s.unitName]) {
              groupedData[s.unitName] = { totalScore: 0, count: 0 };
          }
          groupedData[s.unitName].totalScore += s.totalScore;
          groupedData[s.unitName].count += 1;
      });

      const chartData = Object.keys(groupedData).map(unit => ({
          unitName: unit,
          score: parseFloat((groupedData[unit].totalScore / groupedData[unit].count).toFixed(2)) // Average total score
      }));
      
      return chartData.sort((a, b) => b.score - a.score);
  };

  // --- EDITOR LOGIC (Shared for Article & History) ---
  const openEditor = (item?: any, type: 'articles' | 'history' = 'articles') => {
    setActiveTab(type);
    setEditingItem(item);
    setIsVisualMode(true);
    setViewMode('editor');
    setSelectedImg(null);

    if (item) {
        setEditorTitle(item.title);
        setEditorImage(item.imageUrl || item.image || ''); 
        
        if (type === 'articles') {
            setEditorContent(item.content);
            setEditorSummary(item.summary);
            setEditorAuthor(item.author);
            setEditorDate(item.date);
        } else {
            setEditorContent(item.story);
            setEditorSummary(item.content); 
            setEditorYear(item.year);
            setEditorSubtitle(item.subtitle);
            setEditorIcon(item.icon);
            setEditorNarrationAudio(item.narrationAudio || '');
            // Load awareness questions if exist
            setAwarenessQuestions(item.quiz || []);
        }

        const img = item.imageUrl || item.image;
        if (img && img.startsWith('data:')) {
            setFeaturedImgSourceType('upload');
        } else {
            setFeaturedImgSourceType('link');
        }
    } else {
        setEditorTitle('');
        setEditorContent('');
        setEditorSummary('');
        setEditorImage('');
        setFeaturedImgSourceType('link');

        if (type === 'articles') {
            setEditorAuthor('Ban biên tập'); 
            setEditorDate(new Date().toISOString().split('T')[0]);
        } else {
            setEditorYear(new Date().getFullYear().toString());
            setEditorSubtitle('');
            setEditorIcon('Flag');
            setEditorNarrationAudio('');
            // Reset awareness questions
            setAwarenessQuestions([]);
        }
    }
    // Reset new question form and editing state
    setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' });
    setEditingQuestionId(null);
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
      if (!isVisualMode) return;
      document.execCommand(command, false, value);
      if (editorContentRef.current) {
          setEditorContent(editorContentRef.current.innerHTML);
          editorContentRef.current.focus();
      }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
      setEditorContent(e.currentTarget.innerHTML);
  };
  
  const handleEditorClick = (e: React.MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
          setSelectedImg(e.target);
      } else {
          if (!e.defaultPrevented) {
             setSelectedImg(null);
          }
      }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedImg) return;

      const startX = e.clientX;
      const startWidth = selectedImg.clientWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
          const deltaX = moveEvent.clientX - startX;
          let newWidth = startWidth;

          if (direction.includes('e')) newWidth += deltaX;
          if (direction.includes('w')) newWidth -= deltaX;

          if (newWidth > 50) {
              selectedImg.style.width = `${newWidth}px`;
              selectedImg.style.height = 'auto'; 
              const event = new Event('resize');
              window.dispatchEvent(event);
          }
      };

      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          if (editorContentRef.current) {
              setEditorContent(editorContentRef.current.innerHTML);
          }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  const handleAlignImage = (align: 'left' | 'center' | 'right' | 'inline') => {
      if (!selectedImg) return;
      
      selectedImg.style.display = '';
      selectedImg.style.margin = '';
      selectedImg.style.float = '';

      if (align === 'center') {
          selectedImg.style.display = 'block';
          selectedImg.style.margin = '0 auto';
      } else if (align === 'left') {
          selectedImg.style.float = 'left';
          selectedImg.style.marginRight = '1rem';
          selectedImg.style.marginBottom = '0.5rem';
      } else if (align === 'right') {
          selectedImg.style.float = 'right';
          selectedImg.style.marginLeft = '1rem';
          selectedImg.style.marginBottom = '0.5rem';
      }

      if (editorContentRef.current) {
          setEditorContent(editorContentRef.current.innerHTML);
      }
      setSelectedImg(null); 
      setTimeout(() => setSelectedImg(selectedImg), 0);
  };
  
  const handleDeleteImage = () => {
      if(selectedImg) {
          selectedImg.remove();
          setSelectedImg(null);
          if (editorContentRef.current) {
              setEditorContent(editorContentRef.current.innerHTML);
          }
      }
  };

  const handleAddMediaClick = () => {
      fileInputRef.current?.click();
  };

  const handleFeaturedImageClick = () => {
      featuredImageInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const base64 = e.target?.result as string;
          if (isVisualMode) {
              editorContentRef.current?.focus();
              document.execCommand('insertImage', false, base64);
              if(editorContentRef.current) setEditorContent(editorContentRef.current.innerHTML);
          } else {
              setEditorContent(prev => prev + `<img src="${base64}" alt="Image" />`);
          }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
  };

  const handleFeaturedImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setEditorImage(base64);
          setFeaturedImgSourceType('upload');
      };
      reader.readAsDataURL(file);
      event.target.value = '';
  };

  const handleNarrationAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setEditorNarrationAudio(base64);
          setNarrationAudioSourceType('upload');
      };
      reader.readAsDataURL(file);
      event.target.value = '';
  };

  const saveContent = async () => {
      if (!editorTitle || !editorContent) {
          alert("Vui lòng nhập tiêu đề và nội dung.");
          return;
      }

      const id = editingItem ? editingItem.id : Date.now().toString();

      if (activeTab === 'articles') {
          const newArticle: Article = {
              id,
              title: editorTitle,
              content: editorContent,
              summary: editorSummary || editorContent.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...', 
              imageUrl: editorImage || 'https://picsum.photos/800/400',
              author: editorAuthor,
              date: editorDate
          };
          
          if (editingItem) {
              await apiService.updateArticle(id, newArticle);
          } else {
              await apiService.createArticle(newArticle);
          }
      } else if (activeTab === 'history') {
          const newMilestone: Milestone = {
              id,
              year: editorYear,
              title: editorTitle,
              subtitle: editorSubtitle,
              content: editorSummary, 
              story: editorContent, 
              image: editorImage || 'https://picsum.photos/600/400',
              icon: editorIcon,
              quiz: awarenessQuestions,
              narrationAudio: editorNarrationAudio || undefined
          };
          
          if (editingItem) {
              await apiService.updateMilestone(id, newMilestone);
          } else {
              await apiService.createMilestone(newMilestone);
          }
      }
      
      await refreshData();
      setViewMode('list');
      setEditingItem(null);
  };

  // --- GENERIC MODAL SAVE ---
  const handleGenericSave = async (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const id = editingItem ? editingItem.id : Date.now().toString();

      try {
          switch (activeTab) {
              case 'personnel': {
                   const email = formData.get('email') as string;
                   // Validation needed for create
                   
                   const newItem: User = {
                      id,
                      name: formData.get('name') as string,
                      email: email,
                      rank: formData.get('rank') as string,
                      position: formData.get('position') as string,
                      unit: formData.get('unit') as string,
                      password: formData.get('password') as string,
                      role: formData.get('role') as 'admin' | 'user'
                  };
                  
                  if (editingItem && !newItem.password) {
                      newItem.password = editingItem.password;
                  }

                  if (editingItem) await apiService.updateUser(id, newItem);
                  else await apiService.createUser(newItem);
                  break;
              }
              case 'scores': {
                  const militaryScore = Number(formData.get('militaryScore'));
                  const politicalScore = Number(formData.get('politicalScore'));
                  const logisticsScore = Number(formData.get('logisticsScore'));
                  const disciplineScore = Number(formData.get('disciplineScore'));
                  
                  const totalScore = parseFloat(((militaryScore + politicalScore + logisticsScore + disciplineScore) / 4).toFixed(2));

                  const newItem: Score = {
                      id,
                      unitName: formData.get('unitName') as string,
                      militaryScore,
                      politicalScore,
                      logisticsScore,
                      disciplineScore,
                      totalScore,
                      date: formData.get('date') as string,
                  };
                  if (editingItem) await apiService.updateScore(id, newItem);
                  else await apiService.createScore(newItem);
                  break;
              }
               case 'documents': {
                  let newItem: DocumentFile;
                  if (editingItem) {
                      newItem = {
                          ...editingItem,
                          name: formData.get('name') as string,
                          date: new Date().toISOString().split('T')[0] 
                      };
                      await apiService.updateDocument(id, newItem);
                  } else {
                      // Note: Creation usually handled via file upload or create folder button, but generic modal can edit name
                      newItem = {
                          id,
                          name: formData.get('name') as string,
                          isFolder: false,
                          parentId: currentFolderId,
                          type: 'FILE',
                          date: new Date().toISOString().split('T')[0],
                          size: '0 KB' 
                      };
                      await apiService.createDocument(newItem);
                  }
                  break;
              }
              case 'media': {
                 let url = formData.get('url') as string;
                 const file = formData.get('fileUpload') as File;
                 
                 if (mediaSourceType === 'upload' && file && file.size > 0) {
                     url = await new Promise((resolve) => {
                         const reader = new FileReader();
                         reader.onload = (e) => resolve(e.target?.result as string);
                         reader.readAsDataURL(file);
                     });
                 } else if (mediaSourceType === 'upload' && (!file || file.size === 0) && editingItem) {
                     url = editingItem.url;
                 }

                 let thumbnail = formData.get('thumbnail') as string;
                 const thumbFile = formData.get('thumbnailUpload') as File;

                 if (mediaThumbSourceType === 'upload' && thumbFile && thumbFile.size > 0) {
                     thumbnail = await new Promise((resolve) => {
                         const reader = new FileReader();
                         reader.onload = (e) => resolve(e.target?.result as string);
                         reader.readAsDataURL(thumbFile);
                     });
                 } else if (mediaThumbSourceType === 'upload' && (!thumbFile || thumbFile.size === 0) && editingItem) {
                     thumbnail = editingItem.thumbnail;
                 }

                 const newItem: MediaItem = {
                      id,
                      title: formData.get('title') as string,
                      type: formData.get('type') as 'video' | 'audio',
                      url: url,
                      description: formData.get('description') as string,
                      date: formData.get('date') as string,
                      thumbnail: thumbnail || undefined
                  };
                  if (editingItem) await apiService.updateMedia(id, newItem);
                  else await apiService.createMedia(newItem);
                  break;
              }
              case 'leaders': {
                 let image = formData.get('image') as string;
                 const file = formData.get('imageUpload') as File;
                 
                 if (mediaSourceType === 'upload' && file && file.size > 0) {
                     image = await new Promise((resolve) => {
                         const reader = new FileReader();
                         reader.onload = (e) => resolve(e.target?.result as string);
                         reader.readAsDataURL(file);
                     });
                 } else if (mediaSourceType === 'upload' && (!file || file.size === 0) && editingItem) {
                     image = editingItem.image;
                 }

                 const newItem: Leader = {
                      id,
                      name: formData.get('name') as string,
                      role: formData.get('role') as string,
                      image: image || 'https://picsum.photos/200/200?grayscale',
                  };
                  if (editingItem) await apiService.updateLeader(id, newItem);
                  else await apiService.createLeader(newItem);
                  break;
              }
               case 'questions': {
                  const optionsRaw = formData.get('options') as string;
                  const newItem: Question = {
                      id,
                      questionText: formData.get('questionText') as string,
                      options: optionsRaw.split('\n').filter(s => s.trim() !== ''),
                      correctAnswerIndex: Number(formData.get('correctAnswerIndex')),
                      explanation: formData.get('explanation') as string
                  };
                  if (editingItem) await apiService.updateQuestion(id, newItem);
                  else await apiService.createQuestion(newItem);
                  break;
              }
          }
          await refreshData();
          setIsModalOpen(false);
          setEditingItem(null);
      } catch (e) {
          alert("Có lỗi xảy ra khi lưu dữ liệu.");
          console.error(e);
      }
  };

  const handleDownloadTemplate = () => {
      const header = ["Nội dung câu hỏi", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng (A/B/C/D)", "Giải thích"];
      const sampleData = [
          ["Sư đoàn 324 thành lập ngày nào?", "01/07/1955", "22/12/1944", "03/02/1930", "19/05/1890", "A", "Ngày 01/07/1955 tại Tĩnh Gia, Thanh Hóa."],
          ["Truyền thống Sư đoàn là gì?", "Thần tốc", "Trung dũng, kiên cường", "Quyết thắng", "Đoàn kết", "B", "8 chữ vàng: Trung dũng, kiên cường, liên tục tấn công..."]
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([header, ...sampleData]);
      XLSX.utils.book_append_sheet(wb, ws, "Mau_Cau_Hoi");
      XLSX.writeFile(wb, "Mau_Import_Cau_Hoi.xlsx");
  };

  const handleImportExcelClick = () => {
      excelInputRef.current?.click();
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          try {
              const bstr = evt.target?.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              const wsname = wb.SheetNames[0];
              const ws = wb.Sheets[wsname];
              const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
              const rows = data.slice(1).filter(r => r.length > 0);
              
              let successCount = 0;
              for (const row of rows) {
                  const questionText = row[0];
                  const options = [row[1], row[2], row[3], row[4]].filter(o => o !== undefined && o !== null);
                  const correctChar = row[5]?.toString().toUpperCase().trim();
                  let correctIndex = 0;
                  if (correctChar === 'B') correctIndex = 1;
                  else if (correctChar === 'C') correctIndex = 2;
                  else if (correctChar === 'D') correctIndex = 3;
                  const explanation = row[6];
                  
                  const newItem: Question = {
                      id: `excel_${Date.now()}_${Math.random()}`,
                      questionText: questionText || "Câu hỏi chưa có nội dung",
                      options: options.length > 0 ? options : ["Lựa chọn A", "Lựa chọn B"],
                      correctAnswerIndex: correctIndex,
                      explanation: explanation || ""
                  };
                  await apiService.createQuestion(newItem);
                  successCount++;
              }
              
              if (successCount > 0) {
                  await refreshData();
                  alert(`Đã nhập thành công ${successCount} câu hỏi từ Excel.`);
              } else {
                  alert("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
              }
          } catch (err) {
              console.error(err);
              alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.");
          }
          if (excelInputRef.current) excelInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
  };

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
        case 'articles': return articles.filter(x => x.title.toLowerCase().includes(term) || x.author.toLowerCase().includes(term));
        case 'history': return milestones.filter(x => x.year.toLowerCase().includes(term) || x.title.toLowerCase().includes(term));
        case 'personnel': return usersList.filter(x => x.name.toLowerCase().includes(term) || x.email.toLowerCase().includes(term));
        case 'questions': return questions.filter(x => x.questionText.toLowerCase().includes(term));
        case 'scores': return scores.filter(x => x.unitName.toLowerCase().includes(term));
        case 'documents': 
            return documents.filter(x => {
                const matchParent = x.parentId === currentFolderId;
                const matchSearch = term === '' || x.name.toLowerCase().includes(term);
                return matchParent && matchSearch;
            }).sort((a, b) => {
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                return a.name.localeCompare(b.name);
            });
        case 'media': return mediaItems.filter(x => x.title.toLowerCase().includes(term));
        case 'leaders': return leaders.filter(x => x.name.toLowerCase().includes(term) || x.role.toLowerCase().includes(term));
        default: return [];
    }
  };

  // --- AWARENESS QUESTIONS MANAGEMENT ---
  const handleAddAwarenessQuestion = () => {
      if (!newQuestion.questionText || newQuestion.options?.some(opt => !opt)) {
          alert("Vui lòng nhập câu hỏi và tất cả các đáp án");
          return;
      }
      
      const question: Question = {
          id: editingQuestionId || `q_${Date.now()}`,
          questionText: newQuestion.questionText || '',
          options: newQuestion.options || ['', '', '', ''],
          correctAnswerIndex: newQuestion.correctAnswerIndex || 0,
          explanation: newQuestion.explanation || ''
      };
      
      if (editingQuestionId) {
          setAwarenessQuestions(prev => prev.map(q => q.id === editingQuestionId ? question : q));
          setEditingQuestionId(null);
      } else {
          setAwarenessQuestions(prev => [...prev, question]);
      }
      
      setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' });
  };

  const handleEditAwarenessQuestion = (question: Question) => {
      setNewQuestion(question);
      setEditingQuestionId(question.id);
  };

  const handleDeleteAwarenessQuestion = (id: string) => {
      if (window.confirm("Xóa câu hỏi này?")) {
          setAwarenessQuestions(prev => prev.filter(q => q.id !== id));
          if (editingQuestionId === id) {
              setEditingQuestionId(null);
              setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' });
          }
      }
  };

  const handleUpdateQuestionOption = (index: number, value: string) => {
      setNewQuestion(prev => ({
          ...prev,
          options: prev.options ? prev.options.map((opt, i) => i === index ? value : opt) : ['', '', '', '']
      }));
  };

  // --- ENHANCED QUESTION MANAGEMENT ---
  const openQuestionEditor = (question: Question | null) => {
      if (question) {
          setQuestionBeingEdited(question);
          setQuestionFormData({
              questionText: question.questionText,
              options: [...question.options],
              correctAnswerIndex: question.correctAnswerIndex,
              explanation: question.explanation,
              milestoneId: (question as any).milestoneId || ''
          });
      } else {
          setQuestionBeingEdited(null);
          const defaultMilestoneId = selectedMilestoneForQuestions !== 'all' ? selectedMilestoneForQuestions : '';
          setQuestionFormData({
              questionText: '',
              options: ['', '', '', ''],
              correctAnswerIndex: 0,
              explanation: '',
              milestoneId: defaultMilestoneId
          });
      }
      setIsQuestionEditorOpen(true);
  };

  const handleSaveQuestion = async () => {
      if (!questionFormData.questionText?.trim()) {
          alert('Vui lòng nhập nội dung câu hỏi');
          return;
      }
      if (!questionFormData.milestoneId) {
          alert('Vui lòng chọn giai đoạn lịch sử cho câu hỏi');
          return;
      }
      if (questionFormData.options?.some(opt => !opt?.trim())) {
          alert('Vui lòng nhập tất cả các đáp án');
          return;
      }

      try {
          const questionData: any = {
              id: questionBeingEdited?.id || `q_${Date.now()}`,
              questionText: questionFormData.questionText || '',
              options: questionFormData.options || ['', '', '', ''],
              correctAnswerIndex: questionFormData.correctAnswerIndex || 0,
              explanation: questionFormData.explanation || '',
              milestoneId: questionFormData.milestoneId || ''
          };

          if (questionBeingEdited) {
              await apiService.updateQuestion(questionBeingEdited.id, questionData);
          } else {
              await apiService.createQuestion(questionData);
          }

          setIsQuestionEditorOpen(false);
          setQuestionBeingEdited(null);
          await refreshData();
      } catch (error) {
          alert('Lỗi khi lưu câu hỏi: ' + error);
      }
  };

  const handleQuestionOptionChange = (index: number, value: string) => {
      setQuestionFormData(prev => ({
          ...prev,
          options: prev.options?.map((opt, i) => i === index ? value : opt) || ['', '', '', '']
      }));
  };

  // Get questions filtered by milestone
  const getQuestionsForMilestone = () => {
      if (selectedMilestoneForQuestions === 'all') {
          return questions;
      }
      const milestone = milestones.find(m => m.id === selectedMilestoneForQuestions);
      return milestone?.quiz || [];
  };

  const filteredData = getFilteredData();

  const chartData = getChartData();

  // Toolbar Button
  const ToolbarButton = ({ icon: Icon, onClick, title, active = false }: any) => (
      <button 
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-gray-300 text-blue-700' : 'text-gray-600'}`}
        title={title}
      >
          <Icon className="h-4 w-4" />
      </button>
  );

  // --- RENDER QUESTION EDITOR ---
  const renderQuestionEditor = () => {
      if (!isQuestionEditorOpen) return null;

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-up my-8">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50">
                      <div>
                          <h3 className="font-bold text-xl text-gray-800 flex items-center">
                              <HelpCircle className="w-6 h-6 mr-2 text-green-600" />
                              {questionBeingEdited ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">Quản lý ngân hàng câu hỏi trắc nghiệm</p>
                      </div>
                      <button onClick={() => setIsQuestionEditorOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                      {/* Milestone Selection */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Giai đoạn lịch sử <span className="text-red-500">*</span></label>
                          <select
                              value={questionFormData.milestoneId || ''}
                              onChange={(e) => setQuestionFormData(prev => ({ ...prev, milestoneId: e.target.value }))}
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all font-medium"
                          >
                              <option value="">-- Chọn giai đoạn --</option>
                              {milestones.map(m => (
                                  <option key={m.id} value={m.id}>
                                      Năm {m.year} - {m.title}
                                  </option>
                              ))}
                          </select>
                          {!questionFormData.milestoneId && (
                              <p className="text-xs text-orange-600 mt-1">⚠️ Vui lòng chọn giai đoạn để lưu câu hỏi</p>
                          )}
                      </div>

                      {/* Question Text */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung câu hỏi <span className="text-red-500">*</span></label>
                          <textarea
                              value={questionFormData.questionText || ''}
                              onChange={(e) => setQuestionFormData(prev => ({ ...prev, questionText: e.target.value }))}
                              rows={3}
                              placeholder="Nhập nội dung câu hỏi..."
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          />
                      </div>

                      {/* Answer Options */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">Các lựa chọn <span className="text-red-500">*</span></label>
                          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                              {questionFormData.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-3">
                                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                          questionFormData.correctAnswerIndex === index 
                                              ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                              : 'bg-gray-400'
                                      }`}>
                                          {String.fromCharCode(65 + index)}
                                      </div>
                                      <input
                                          type="text"
                                          value={option || ''}
                                          onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                                          placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                                          className="flex-1 p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                      />
                                      <input
                                          type="radio"
                                          name="correctAnswer"
                                          checked={questionFormData.correctAnswerIndex === index}
                                          onChange={() => setQuestionFormData(prev => ({ ...prev, correctAnswerIndex: index }))}
                                          className="w-5 h-5 cursor-pointer accent-green-600"
                                          title="Chọn đáp án đúng"
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                          <p className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" /> Đáp án đúng
                          </p>
                          <div className="bg-white p-3 rounded-lg font-semibold text-green-700">
                              {String.fromCharCode(65 + (questionFormData.correctAnswerIndex || 0))} - {questionFormData.options?.[questionFormData.correctAnswerIndex || 0] || 'Chọn lựa chọn bên trên'}
                          </div>
                      </div>

                      {/* Explanation */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Giải thích / Hướng dẫn (Tùy chọn)</label>
                          <textarea
                              value={questionFormData.explanation || ''}
                              onChange={(e) => setQuestionFormData(prev => ({ ...prev, explanation: e.target.value }))}
                              rows={2}
                              placeholder="Giải thích chi tiết về câu hỏi này..."
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          />
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                      <button
                          onClick={() => setIsQuestionEditorOpen(false)}
                          className="px-6 py-2 text-gray-600 font-bold border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                      >
                          Hủy
                      </button>
                      <button
                          onClick={handleSaveQuestion}
                          className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center"
                      >
                          <Save className="w-4 h-4 mr-2" />
                          {questionBeingEdited ? 'Cập nhật' : 'Thêm câu hỏi'}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  // --- RENDER APPEARANCE SETTINGS ---

  const renderAppearanceSettings = () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in max-w-4xl mx-auto">
          {/* ... (Appearance code same as previous) ... */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Cấu hình Giao diện (CMS)</h2>
              <div className="flex space-x-3">
                  <button onClick={resetSettings} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold border border-red-200 transition-colors">
                      Khôi phục mặc định
                  </button>
                  <button onClick={saveSiteSettings} className="px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 shadow-lg transition-transform hover:scale-105 flex items-center">
                      <Save className="w-5 h-5 mr-2" /> Lưu thay đổi
                  </button>
              </div>
          </div>
          {/* ... (Inputs) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* General Info */}
              <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-700 border-l-4 border-green-600 pl-3 uppercase">Thông tin chung</h3>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên Website / Đơn vị</label>
                      <input name="siteTitle" type="text" value={tempSettings.siteTitle} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả phụ (Subtitle)</label>
                      <input name="siteSubtitle" type="text" value={tempSettings.siteSubtitle} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Icon)</label>
                      <div className="flex space-x-2">
                          <input name="logoUrl" type="text" value={tempSettings.logoUrl} onChange={handleSettingsChange} placeholder="https://..." className="flex-1 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                          <button onClick={() => settingLogoInputRef.current?.click()} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">Upload</button>
                          <input type="file" ref={settingLogoInputRef} className="hidden" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'logoUrl')} />
                      </div>
                      {tempSettings.logoUrl && <img src={tempSettings.logoUrl} alt="Logo Preview" className="h-10 mt-2 object-contain bg-gray-100 p-1 rounded" />}
                  </div>
              </div>

              {/* Colors */}
              <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-700 border-l-4 border-green-600 pl-3 uppercase">Màu sắc chủ đạo</h3>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Màu chính (Header/Footer)</label>
                      <div className="flex items-center space-x-2">
                          <input name="primaryColor" type="color" value={tempSettings.primaryColor} onChange={handleSettingsChange} className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer" />
                          <input name="primaryColor" type="text" value={tempSettings.primaryColor} onChange={handleSettingsChange} className="flex-1 p-2 border border-gray-300 rounded uppercase font-mono" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Màu phụ (Buttons/Highlights)</label>
                      <div className="flex items-center space-x-2">
                          <input name="secondaryColor" type="color" value={tempSettings.secondaryColor} onChange={handleSettingsChange} className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer" />
                          <input name="secondaryColor" type="text" value={tempSettings.secondaryColor} onChange={handleSettingsChange} className="flex-1 p-2 border border-gray-300 rounded uppercase font-mono" />
                      </div>
                  </div>
              </div>

              {/* Hero Section */}
              <div className="space-y-6 md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-700 border-l-4 border-green-600 pl-3 uppercase">Trang chủ (Hero Section)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề lớn</label>
                          <input name="heroTitle" type="text" value={tempSettings.heroTitle} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh nền (Banner)</label>
                          <div className="flex space-x-2">
                              <input name="heroImage" type="text" value={tempSettings.heroImage} onChange={handleSettingsChange} className="flex-1 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                              <button onClick={() => settingHeroInputRef.current?.click()} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700">Upload</button>
                              <input type="file" ref={settingHeroInputRef} className="hidden" accept="image/*" onChange={(e) => handleSettingsImageUpload(e, 'heroImage')} />
                          </div>
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                          <textarea name="heroSubtitle" rows={2} value={tempSettings.heroSubtitle} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"></textarea>
                      </div>
                  </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-700 border-l-4 border-green-600 pl-3 uppercase">Thông tin liên hệ</h3>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <input name="contactAddress" type="text" value={tempSettings.contactAddress} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input name="contactEmail" type="text" value={tempSettings.contactEmail} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
                      <input name="contactPhone" type="text" value={tempSettings.contactPhone} onChange={handleSettingsChange} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                  </div>
              </div>

              {/* Advanced CSS */}
              <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-700 border-l-4 border-green-600 pl-3 uppercase">Nâng cao</h3>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS (WordPress Style)</label>
                      <textarea 
                          name="customCss" 
                          rows={6} 
                          value={tempSettings.customCss} 
                          onChange={handleSettingsChange} 
                          placeholder=".header { background: red !important; }"
                          className="w-full p-2 border border-gray-300 rounded bg-gray-900 text-green-400 font-mono text-xs focus:ring-green-500 focus:border-green-500"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">Chèn mã CSS để tùy biến sâu giao diện. Cẩn thận khi sử dụng.</p>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderArticleEditor = () => (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in flex flex-col h-[calc(100vh-100px)]">
          {/* Editor Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-700 flex items-center">
                  <Edit className="w-5 h-5 mr-2" />
                  {editingItem ? `Chỉnh sửa ${activeTab === 'history' ? 'Mốc lịch sử' : 'Bài viết'}` : `Thêm mới ${activeTab === 'history' ? 'Mốc lịch sử' : 'Bài viết'}`}
              </h2>
              <div className="flex space-x-3">
                  <button 
                      onClick={() => {
                        if(window.confirm("Hủy bỏ thay đổi?")) {
                            setEditingItem(null); 
                            setViewMode('list'); 
                        }
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-bold"
                  >
                      Hủy bỏ
                  </button>
                  <button 
                      onClick={saveContent}
                      className="px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 shadow-md flex items-center"
                  >
                      <Save className="w-4 h-4 mr-2" /> Lưu {activeTab === 'history' ? 'lịch sử' : 'bài viết'}
                  </button>
              </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <input
                      type="text"
                      placeholder="Tiêu đề..."
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      className="w-full text-4xl font-display font-black text-gray-800 placeholder-gray-300 border-none focus:ring-0 bg-transparent mb-6 p-0"
                  />
                  
                  {/* Toolbar */}
                  <div className="sticky top-0 z-40 bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-2 flex flex-wrap gap-1 items-center">
                       <ToolbarButton icon={Bold} onClick={() => execCmd('bold')} title="In đậm" />
                       <ToolbarButton icon={Italic} onClick={() => execCmd('italic')} title="In nghiêng" />
                       <ToolbarButton icon={Underline} onClick={() => execCmd('underline')} title="Gạch chân" />
                       <div className="w-px h-6 bg-gray-300 mx-1"></div>
                       <ToolbarButton icon={List} onClick={() => execCmd('insertUnorderedList')} title="Danh sách" />
                       <ToolbarButton icon={ListOrdered} onClick={() => execCmd('insertOrderedList')} title="Danh sách số" />
                       <div className="w-px h-6 bg-gray-300 mx-1"></div>
                       <ToolbarButton icon={AlignLeft} onClick={() => execCmd('justifyLeft')} title="Căn trái" />
                       <ToolbarButton icon={AlignCenter} onClick={() => execCmd('justifyCenter')} title="Căn giữa" />
                       <ToolbarButton icon={AlignRight} onClick={() => execCmd('justifyRight')} title="Căn phải" />
                       <ToolbarButton icon={AlignJustify} onClick={() => execCmd('justifyFull')} title="Căn đều" />
                       <div className="w-px h-6 bg-gray-300 mx-1"></div>
                       <ToolbarButton icon={Quote} onClick={() => { execCmd('formatBlock', 'BLOCKQUOTE') }} title="Trích dẫn" />
                       <ToolbarButton icon={Code} onClick={() => execCmd('formatBlock', 'PRE')} title="Mã nguồn" />
                       <div className="w-px h-6 bg-gray-300 mx-1"></div>
                       {/* History Page Break Button */}
                       {activeTab === 'history' && (
                           <>
                                <button 
                                    onClick={() => execCmd('insertHorizontalRule')}
                                    className="p-2 rounded hover:bg-gray-200 transition-colors text-red-600 font-bold flex items-center border border-red-200 bg-red-50 text-xs"
                                    title="Ngắt trang sách (Chèn dấu gạch ngang)"
                                >
                                    <Scissors className="h-3 w-3 mr-1"/> Ngắt trang
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                           </>
                       )}
                       <ToolbarButton icon={LinkIcon} onClick={() => { const url = prompt('Nhập liên kết:'); if(url) execCmd('createLink', url); }} title="Chèn liên kết" />
                       <ToolbarButton icon={ImageIcon} onClick={handleAddMediaClick} title="Chèn ảnh" />
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                       
                       <div className="ml-auto flex items-center space-x-2">
                           <button 
                                onClick={() => setIsVisualMode(!isVisualMode)} 
                                className={`px-3 py-1.5 text-xs font-bold rounded border ${isVisualMode ? 'bg-white text-gray-700 border-gray-300' : 'bg-gray-800 text-white border-gray-800'}`}
                           >
                               {isVisualMode ? <><Monitor className="w-3 h-3 inline mr-1"/> Trực quan</> : <><Code className="w-3 h-3 inline mr-1"/> HTML</>}
                           </button>
                       </div>
                  </div>

                  {/* Content Editor */}
                  <div className="relative min-h-[500px]">
                      {isVisualMode ? (
                          <div
                              ref={editorContentRef}
                              contentEditable
                              suppressContentEditableWarning={true}
                              onInput={handleEditorInput}
                              onClick={handleEditorClick}
                              className="prose prose-lg max-w-none min-h-[500px] outline-none"
                          ></div>
                      ) : (
                          <textarea
                              value={editorContent}
                              onChange={(e) => setEditorContent(e.target.value)}
                              className="w-full h-full min-h-[500px] font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg"
                          />
                      )}

                      {/* Image Resize Overlay */}
                      {selectedImg && isVisualMode && (
                          <div 
                              className="absolute border-2 border-blue-500 z-50 pointer-events-none"
                              style={{
                                  top: overlayPos.top,
                                  left: overlayPos.left,
                                  width: overlayPos.width,
                                  height: overlayPos.height
                              }}
                          >
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-1 flex space-x-1 pointer-events-auto">
                                  <button onClick={() => handleAlignImage('left')} className="p-1 hover:bg-gray-100 rounded" title="Trái"><AlignLeft className="w-4 h-4"/></button>
                                  <button onClick={() => handleAlignImage('center')} className="p-1 hover:bg-gray-100 rounded" title="Giữa"><AlignCenter className="w-4 h-4"/></button>
                                  <button onClick={() => handleAlignImage('right')} className="p-1 hover:bg-gray-100 rounded" title="Phải"><AlignRight className="w-4 h-4"/></button>
                                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                  <button onClick={handleDeleteImage} className="p-1 hover:bg-red-100 text-red-600 rounded" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                              </div>
                              {['nw', 'ne', 'sw', 'se'].map(dir => (
                                  <div 
                                      key={dir}
                                      className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-auto cursor-ew-resize"
                                      style={{
                                          top: dir.includes('n') ? -4 : 'auto',
                                          bottom: dir.includes('s') ? -4 : 'auto',
                                          left: dir.includes('w') ? -4 : 'auto',
                                          right: dir.includes('e') ? -4 : 'auto',
                                      }}
                                      onMouseDown={(e) => handleResizeStart(e, dir)}
                                  ></div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              {/* Sidebar Settings */}
              <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Thông tin cơ bản</label>
                          <div className="space-y-3">
                              {activeTab === 'articles' ? (
                                  <>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Tác giả</label>
                                        <input type="text" value={editorAuthor} onChange={(e) => setEditorAuthor(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Ngày đăng</label>
                                        <input type="date" value={editorDate} onChange={(e) => setEditorDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm"/>
                                    </div>
                                  </>
                              ) : (
                                  <>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Năm / Giai đoạn</label>
                                        <input type="text" value={editorYear} onChange={(e) => setEditorYear(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="VD: 1975"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Phụ đề (Subtitle)</label>
                                        <input type="text" value={editorSubtitle} onChange={(e) => setEditorSubtitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="VD: Đại thắng mùa xuân"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Biểu tượng (Icon)</label>
                                        <select value={editorIcon} onChange={(e) => setEditorIcon(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm">
                                            <option value="Flag">Cờ (Flag)</option>
                                            <option value="Map">Bản đồ (Map)</option>
                                            <option value="Star">Sao (Star)</option>
                                            <option value="Award">Huân chương (Award)</option>
                                        </select>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
                                        <strong>Mẹo viết sách:</strong> Sử dụng nút <span className="inline-flex items-center font-bold"><Scissors className="w-3 h-3 mx-1"/> Ngắt trang</span> trên thanh công cụ để chia nội dung sang trang tiếp theo.
                                    </div>
                                  </>
                              )}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ảnh đại diện</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFeaturedImageClick}>
                              {editorImage ? (
                                  <div className="relative group">
                                      <img src={editorImage} alt="Featured" className="w-full h-32 object-cover rounded" />
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                          <span className="text-white text-xs font-bold">Thay đổi</span>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="py-4">
                                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                      <span className="text-xs text-gray-500">Tải ảnh lên</span>
                                  </div>
                              )}
                              <input type="file" ref={featuredImageInputRef} className="hidden" accept="image/*" onChange={handleFeaturedImageChange} />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              {activeTab === 'articles' ? 'Tóm tắt (Sapo)' : 'Mô tả ngắn (Timeline)'}
                          </label>
                          <textarea 
                              rows={5} 
                              value={editorSummary} 
                              onChange={(e) => setEditorSummary(e.target.value)} 
                              className="w-full p-2 border border-gray-300 rounded text-sm text-gray-600 leading-relaxed"
                              placeholder={activeTab === 'articles' ? "Mô tả ngắn về bài viết..." : "Nội dung hiển thị trên timeline (ngắn gọn)..."}
                          ></textarea>
                      </div>

                      {activeTab === 'history' && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center">
                                  <Music className="w-4 h-4 mr-2" />
                                  Âm thanh thuyết minh
                              </label>
                              <div className="flex gap-3 mb-3">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                          type="radio" 
                                          checked={narrationAudioSourceType === 'link'} 
                                          onChange={() => setNarrationAudioSourceType('link')}
                                          className="w-4 h-4"
                                      />
                                      <span className="text-xs">Link URL</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                          type="radio" 
                                          checked={narrationAudioSourceType === 'upload'} 
                                          onChange={() => setNarrationAudioSourceType('upload')}
                                          className="w-4 h-4"
                                      />
                                      <span className="text-xs">Tải lên</span>
                                  </label>
                              </div>
                              
                              {narrationAudioSourceType === 'link' ? (
                                  <input 
                                      type="url" 
                                      value={editorNarrationAudio} 
                                      onChange={(e) => setEditorNarrationAudio(e.target.value)} 
                                      className="w-full p-2 border border-gray-300 rounded text-sm" 
                                      placeholder="Nhập URL âm thanh (VD: https://example.com/audio.mp3)"
                                  />
                              ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => narrationAudioInputRef.current?.click()}>
                                      {editorNarrationAudio ? (
                                          <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                  <Music className="w-6 h-6 text-blue-500" />
                                                  <span className="text-xs text-gray-700">Âm thanh đã được chọn</span>
                                              </div>
                                              <audio src={editorNarrationAudio} controls className="max-w-xs" />
                                          </div>
                                      ) : (
                                          <div className="py-4">
                                              <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                              <span className="text-xs text-gray-500">Tải file âm thanh lên (MP3, WAV, OGG...)</span>
                                          </div>
                                      )}
                                      <input type="file" ref={narrationAudioInputRef} className="hidden" accept="audio/*" onChange={handleNarrationAudioChange} />
                                  </div>
                              )}
                              {editorNarrationAudio && (
                                  <button
                                      onClick={() => {
                                          setEditorNarrationAudio('');
                                          setNarrationAudioSourceType('link');
                                      }}
                                      className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                                  >
                                      Xóa âm thanh
                                  </button>
                              )}
                          </div>
                      )}

                      {activeTab === 'history' && (
                          <div className="border-t border-gray-300 pt-6">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                                  <HelpCircle className="w-4 h-4 mr-2" />
                                  Câu hỏi nhận thức về giai đoạn
                              </label>
                              
                              {/* Add/Edit Question Form */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
                                  <div>
                                      <label className="text-xs text-gray-600 font-medium block mb-1">Câu hỏi</label>
                                      <input 
                                          type="text" 
                                          value={newQuestion.questionText || ''} 
                                          onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                                          placeholder="Nhập câu hỏi..."
                                          className="w-full p-2 border border-blue-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                      />
                                  </div>

                                  {/* Options */}
                                  <div className="space-y-2">
                                      <label className="text-xs text-gray-600 font-medium block">Các đáp án (Chọn radio để đánh dấu đáp án đúng)</label>
                                      {newQuestion.options?.map((option, idx) => (
                                          <div 
                                              key={idx} 
                                              className={`p-2 rounded border-2 transition-all cursor-pointer flex items-center gap-2 ${
                                                  newQuestion.correctAnswerIndex === idx 
                                                      ? 'bg-green-100 border-green-500' 
                                                      : 'bg-white border-blue-300 hover:border-blue-400'
                                              }`}
                                              onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswerIndex: idx }))}
                                          >
                                              <input 
                                                  type="radio" 
                                                  name="correctAnswer" 
                                                  checked={newQuestion.correctAnswerIndex === idx}
                                                  onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswerIndex: idx }))}
                                                  className="w-4 h-4 cursor-pointer"
                                              />
                                              <span className="text-xs font-bold text-gray-700 min-w-fit">
                                                  {String.fromCharCode(65 + idx)})
                                              </span>
                                              <input 
                                                  type="text" 
                                                  value={option} 
                                                  onChange={(e) => handleUpdateQuestionOption(idx, e.target.value)}
                                                  placeholder={`Nhập đáp án ${String.fromCharCode(65 + idx)}...`}
                                                  className="flex-1 p-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500 bg-white"
                                              />
                                              {newQuestion.correctAnswerIndex === idx && (
                                                  <Check className="w-4 h-4 text-green-600 font-bold flex-shrink-0" />
                                              )}
                                          </div>
                                      ))}
                                  </div>

                                  {/* Explanation */}
                                  <div>
                                      <label className="text-xs text-gray-600 font-medium block mb-1">Giải thích (Tùy chọn)</label>
                                      <textarea 
                                          value={newQuestion.explanation || ''} 
                                          onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                                          placeholder="Giải thích đáp án đúng..."
                                          rows={2}
                                          className="w-full p-1.5 border border-blue-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                      />
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                      <button 
                                          onClick={handleAddAwarenessQuestion}
                                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                                      >
                                          <Plus className="w-3 h-3 mr-1" />
                                          {editingQuestionId ? 'Cập nhật' : 'Thêm câu hỏi'}
                                      </button>
                                      {editingQuestionId && (
                                          <button 
                                              onClick={() => {
                                                  setEditingQuestionId(null);
                                                  setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' });
                                              }}
                                              className="flex-1 px-3 py-2 bg-gray-400 text-white text-xs font-bold rounded hover:bg-gray-500 transition-colors"
                                          >
                                              Hủy
                                          </button>
                                      )}
                                  </div>
                              </div>

                              {/* Questions List */}
                              {awarenessQuestions.length > 0 && (
                                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                      {awarenessQuestions.map((question, idx) => (
                                          <div key={question.id} className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all">
                                              <div className="text-sm font-bold text-gray-900 mb-3 flex items-start justify-between">
                                                  <span className="flex-1">Câu {idx + 1}: {question.questionText}</span>
                                              </div>
                                              <div className="text-xs text-gray-700 mb-3 ml-2 space-y-2 bg-gray-50 p-3 rounded">
                                                  {question.options.map((opt, optIdx) => (
                                                      <div key={optIdx} className={`p-2 rounded flex items-start gap-2 ${
                                                          optIdx === question.correctAnswerIndex 
                                                              ? 'bg-green-100 border border-green-500 text-green-900 font-bold' 
                                                              : 'bg-gray-100 border border-gray-200 text-gray-700'
                                                      }`}>
                                                          <span className="font-bold min-w-fit">{String.fromCharCode(65 + optIdx)})</span>
                                                          <span className="flex-1">{opt}</span>
                                                          {optIdx === question.correctAnswerIndex && (
                                                              <Check className="w-4 h-4 flex-shrink-0 text-green-700 font-bold" />
                                                          )}
                                                      </div>
                                                  ))}
                                              </div>
                                              {question.explanation && (
                                                  <div className="text-xs text-gray-600 mb-3 italic border-l-2 border-blue-300 pl-2">
                                                      <strong>Giải thích:</strong> {question.explanation}
                                                  </div>
                                              )}
                                              <div className="flex gap-2 mt-3">
                                                  <button 
                                                      onClick={() => handleEditAwarenessQuestion(question)}
                                                      className="flex-1 px-2 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded hover:bg-yellow-600 transition-colors flex items-center justify-center"
                                                  >
                                                      <Edit className="w-3 h-3 mr-1" /> Sửa
                                                  </button>
                                                  <button 
                                                      onClick={() => handleDeleteAwarenessQuestion(question.id)}
                                                      className="flex-1 px-2 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                                                  >
                                                      <Trash2 className="w-3 h-3 mr-1" /> Xóa
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                              
                              {awarenessQuestions.length === 0 && (
                                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                                      <HelpCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <p className="text-xs text-gray-500">Chưa có câu hỏi nào. Thêm câu hỏi để kiểm tra nhận thức.</p>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderModal = () => {
      // Reuse existing generic modal for non-editor items
      if (!isModalOpen) return null;
      // ... (Same modal code logic as previous turn, ensuring `activeTab === 'history'` is NOT handled here because it uses the Editor)
      const titles: Record<string, string> = {
          personnel: editingItem ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới',
          scores: editingItem ? 'Cập nhật điểm thi đua' : 'Chấm điểm mới',
          documents: editingItem ? 'Đổi tên' : 'Tải lên / Tạo mới',
          media: editingItem ? 'Chỉnh sửa Media' : 'Thêm Media mới',
          leaders: editingItem ? 'Chỉnh sửa thông tin' : 'Thêm cán bộ mới',
          questions: editingItem ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800">{titles[activeTab] || 'Thao tác'}</h3>
                      <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <form onSubmit={handleGenericSave} className="p-6">
                      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar px-1">
                          
                          {/* DYNAMIC FORM FIELDS BASED ON TAB */}
                          
                          {activeTab === 'personnel' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
                                      <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                      <input name="email" type="email" defaultValue={editingItem?.email} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-1">Cấp bậc</label>
                                          <input name="rank" type="text" defaultValue={editingItem?.rank} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      </div>
                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-1">Chức vụ</label>
                                          <input name="position" type="text" defaultValue={editingItem?.position} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Đơn vị</label>
                                      <input name="unit" type="text" defaultValue={editingItem?.unit} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu {editingItem && <span className="text-gray-400 font-normal">(Để trống nếu không đổi)</span>}</label>
                                      <input name="password" type="password" required={!editingItem} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Quyền hạn</label>
                                      <select name="role" defaultValue={editingItem?.role || 'user'} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500">
                                          <option value="user">Người dùng (User)</option>
                                          <option value="admin">Quản trị viên (Admin)</option>
                                      </select>
                                  </div>
                              </>
                          )}

                          {/* ... Other cases (scores, documents, media, leaders, questions) remain exactly as before ... */}
                          {activeTab === 'scores' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Tên đơn vị</label>
                                      <input name="unitName" type="text" defaultValue={editingItem?.unitName} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-1">Quân sự</label>
                                          <input name="militaryScore" type="number" step="0.1" max="10" defaultValue={editingItem?.militaryScore} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      </div>
                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-1">Chính trị</label>
                                          <input name="politicalScore" type="number" step="0.1" max="10" defaultValue={editingItem?.politicalScore} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      </div>
                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-1">Hậu cần</label>
                                          <input name="logisticsScore" type="number" step="0.1" max="10" defaultValue={editingItem?.logisticsScore} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      </div>
                                      <div>
                                          <label className="block text-sm font-bold text-gray-700 mb-1">Kỹ thuật / Chính quy</label>
                                          <input name="disciplineScore" type="number" step="0.1" max="10" defaultValue={editingItem?.disciplineScore} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Ngày chấm</label>
                                      <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                              </>
                          )}

                          {activeTab === 'documents' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Tên tệp / Thư mục</label>
                                      <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                              </>
                          )}

                          {activeTab === 'media' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề</label>
                                      <input name="title" type="text" defaultValue={editingItem?.title} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Loại</label>
                                      <select name="type" defaultValue={editingItem?.type || 'video'} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500">
                                          <option value="video">Video</option>
                                          <option value="audio">Audio</option>
                                      </select>
                                  </div>
                                  {/* Source inputs logic repeated from before */}
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Nguồn Media</label>
                                      <div className="flex space-x-4 mb-2">
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                              <input type="radio" name="mediaSource" checked={mediaSourceType === 'link'} onChange={() => setMediaSourceType('link')} />
                                              <span className="text-sm">Đường dẫn (URL/Youtube)</span>
                                          </label>
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                              <input type="radio" name="mediaSource" checked={mediaSourceType === 'upload'} onChange={() => setMediaSourceType('upload')} />
                                              <span className="text-sm">Tải lên file</span>
                                          </label>
                                      </div>
                                      {mediaSourceType === 'link' ? (
                                          <input name="url" type="text" defaultValue={editingItem?.url} placeholder="https://youtube.com/..." className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      ) : (
                                          <input name="fileUpload" type="file" accept="video/*,audio/*" className="w-full p-2 border border-gray-300 rounded" />
                                      )}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                                      <textarea name="description" rows={2} defaultValue={editingItem?.description} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Ảnh thu nhỏ (Thumbnail)</label>
                                      <div className="flex space-x-4 mb-2">
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                              <input type="radio" name="thumbSource" checked={mediaThumbSourceType === 'link'} onChange={() => setMediaThumbSourceType('link')} />
                                              <span className="text-sm">URL ảnh</span>
                                          </label>
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                              <input type="radio" name="thumbSource" checked={mediaThumbSourceType === 'upload'} onChange={() => setMediaThumbSourceType('upload')} />
                                              <span className="text-sm">Tải lên ảnh</span>
                                          </label>
                                      </div>
                                      {mediaThumbSourceType === 'link' ? (
                                          <input name="thumbnail" type="text" defaultValue={editingItem?.thumbnail} placeholder="https://..." className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      ) : (
                                          <input name="thumbnailUpload" type="file" accept="image/*" className="w-full p-2 border border-gray-300 rounded" />
                                      )}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Ngày đăng</label>
                                      <input name="date" type="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                              </>
                          )}
                          
                          {activeTab === 'leaders' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
                                      <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Chức vụ</label>
                                      <input name="role" type="text" defaultValue={editingItem?.role} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Hình ảnh</label>
                                      <div className="flex space-x-4 mb-2">
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                              <input type="radio" name="imageSource" checked={mediaSourceType === 'link'} onChange={() => setMediaSourceType('link')} />
                                              <span className="text-sm">URL ảnh</span>
                                          </label>
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                              <input type="radio" name="imageSource" checked={mediaSourceType === 'upload'} onChange={() => setMediaSourceType('upload')} />
                                              <span className="text-sm">Tải lên ảnh</span>
                                          </label>
                                      </div>
                                      {mediaSourceType === 'link' ? (
                                          <input name="image" type="text" defaultValue={editingItem?.image} placeholder="https://..." className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                      ) : (
                                          <input name="imageUpload" type="file" accept="image/*" className="w-full p-2 border border-gray-300 rounded" />
                                      )}
                                  </div>
                              </>
                          )}

                          {activeTab === 'questions' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung câu hỏi</label>
                                      <textarea name="questionText" rows={3} defaultValue={editingItem?.questionText} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Các lựa chọn (Mỗi dòng một lựa chọn)</label>
                                      <textarea name="options" rows={4} defaultValue={editingItem?.options?.join('\n')} required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" placeholder="Lựa chọn A&#10;Lựa chọn B&#10;Lựa chọn C&#10;Lựa chọn D" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Đáp án đúng (Index 0-3)</label>
                                      <select name="correctAnswerIndex" defaultValue={editingItem?.correctAnswerIndex || 0} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500">
                                          <option value={0}>Lựa chọn A (Dòng 1)</option>
                                          <option value={1}>Lựa chọn B (Dòng 2)</option>
                                          <option value={2}>Lựa chọn C (Dòng 3)</option>
                                          <option value={3}>Lựa chọn D (Dòng 4)</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">Giải thích đáp án</label>
                                      <textarea name="explanation" rows={2} defaultValue={editingItem?.explanation} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" />
                                  </div>
                              </>
                          )}

                      </div>
                      
                      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 space-x-3">
                          <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">
                              Hủy bỏ
                          </button>
                          <button type="submit" className="px-6 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 shadow-lg">
                              {editingItem ? 'Cập nhật' : 'Thêm mới'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };

  const renderSidebar = () => (
    <div className="w-64 bg-green-900 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 shadow-2xl border-r border-green-800 z-10">
        <div className="p-6 bg-green-950 font-bold text-center text-xl border-b border-green-800 flex items-center justify-center space-x-2">
            <Award className="h-6 w-6 text-yellow-500"/>
            <span className="font-display tracking-wider">QUẢN TRỊ</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {[
                { id: 'articles', label: 'Bài viết', icon: FileText },
                { id: 'history', label: 'Lịch sử truyền thống', icon: Clock },
                { id: 'personnel', label: 'Người dùng & Phân quyền', icon: Users },
                { id: 'leaders', label: 'Ban Chỉ huy', icon: Briefcase },
                { id: 'media', label: 'Thư viện Media', icon: Film },
                { id: 'questions', label: 'Kho câu hỏi', icon: HelpCircle },
                { id: 'scores', label: 'Thi đua', icon: Award },
                { id: 'documents', label: 'Văn bản & Tệp tin', icon: Folder },
                { id: 'appearance', label: 'Giao diện & Cấu hình', icon: LayoutIcon },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        setActiveTab(item.id as Tab);
                        setViewMode('list');
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.id 
                        ? 'bg-yellow-500 text-green-900 shadow-md font-bold transform translate-x-1' 
                        : 'text-green-100 hover:bg-green-800 hover:text-white'
                    }`}
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-green-800 bg-green-950">
             <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-300 hover:bg-red-900/30 hover:text-red-200 font-medium"
            >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
            </button>
        </div>
    </div>
  );

  const renderContent = () => {
      if (activeTab === 'appearance') {
          return renderAppearanceSettings();
      }
      
      if ((activeTab === 'articles' || activeTab === 'history') && viewMode === 'editor') {
          return renderArticleEditor();
      }

      const data = filteredData;
      const titles: Record<Tab, string> = {
          articles: 'Quản lý Bài viết',
          history: 'Lịch sử & Truyền thống',
          personnel: 'Quản lý Người dùng & Phân quyền',
          questions: 'Ngân hàng Câu hỏi',
          scores: 'Chấm điểm Thi đua',
          documents: 'Kho Lưu Trữ Số',
          media: 'Thư viện Đa phương tiện',
          leaders: 'Ban Chỉ huy Tiểu đoàn',
          appearance: 'Cấu hình Hệ thống'
      };
      
      return (
          <div className="animate-fade-in">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                      <h2 className="text-3xl font-display font-bold text-green-900">{titles[activeTab]}</h2>
                      <p className="text-green-600 text-sm mt-1">Quản lý cơ sở dữ liệu hệ thống</p>
                  </div>
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                     {activeTab === 'questions' && (
                         <>
                            <input type="file" ref={excelInputRef} onChange={handleExcelFileChange} accept=".xlsx, .xls" className="hidden" />
                            <button onClick={handleDownloadTemplate} className="flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-all font-bold text-sm" title="Tải file mẫu Excel">
                                <Download className="h-4 w-4 mr-2"/> Tải Mẫu
                            </button>
                            <button onClick={handleImportExcelClick} className="flex items-center bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 shadow-md transition-all font-bold text-sm">
                                <FileSpreadsheet className="h-4 w-4 mr-2"/> Nhập Excel
                            </button>
                            <button onClick={() => openQuestionEditor(null)} className="flex items-center bg-yellow-500 text-white px-4 py-2.5 rounded-lg hover:bg-yellow-600 shadow-md transition-all font-bold text-sm">
                                <Plus className="h-4 w-4 mr-2"/> Thêm câu hỏi
                            </button>
                         </>
                     )}
                     
                     {activeTab === 'documents' && (
                         <>
                            <input type="file" ref={docInputRef} onChange={handleFileSelect} multiple className="hidden" />
                            <button onClick={() => docInputRef.current?.click()} className="flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-bold text-sm">
                                <Upload className="h-4 w-4 mr-2"/> Tải lên
                            </button>
                            <button onClick={handleCreateFolder} className="flex items-center bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-bold text-sm">
                                <FolderPlus className="h-4 w-4 mr-2"/> Tạo Thư mục
                            </button>
                         </>
                     )}

                     {activeTab !== 'documents' && activeTab !== 'questions' && (
                        <button 
                            onClick={() => { 
                                if (activeTab === 'articles' || activeTab === 'history') {
                                    openEditor(null, activeTab);
                                } else {
                                    setEditingItem(null); 
                                    setIsModalOpen(true); 
                                }
                            }} 
                            className="flex items-center bg-green-700 text-white px-5 py-2.5 rounded-lg hover:bg-green-800 shadow-lg hover:shadow-green-700/30 transition-all font-bold"
                        >
                            <Plus className="h-5 w-5 mr-2" /> Thêm mới
                        </button>
                     )}
                  </div>
              </div>

              {/* Chart for Scores Tab */}
              {activeTab === 'scores' && (
                  <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-green-100">
                      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-green-700"/>
                                Biểu đồ thi đua
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Thống kê điểm số theo đơn vị</p>
                          </div>
                          
                          {/* Time Filters */}
                          <div className="flex items-center space-x-4 bg-gray-50 p-1.5 rounded-lg border border-gray-200 mt-4 md:mt-0">
                               <div className="flex bg-white rounded-md shadow-sm border border-gray-200">
                                   <button onClick={() => setTimeFilter('day')} className={`px-3 py-1.5 text-xs font-bold rounded-l-md transition-colors ${timeFilter === 'day' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Ngày</button>
                                   <button onClick={() => setTimeFilter('week')} className={`px-3 py-1.5 text-xs font-bold border-l border-r border-gray-200 transition-colors ${timeFilter === 'week' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Tuần</button>
                                   <button onClick={() => setTimeFilter('month')} className={`px-3 py-1.5 text-xs font-bold rounded-r-md transition-colors ${timeFilter === 'month' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Tháng</button>
                               </div>
                               <div className="relative flex items-center">
                                   <CalendarDays className="w-4 h-4 absolute left-2 text-gray-400 pointer-events-none"/>
                                   <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none"/>
                               </div>
                          </div>
                      </div>
                      <div className="h-80 w-full">
                          {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                                    <XAxis dataKey="unitName" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12}} dy={10} />
                                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                                    <Tooltip cursor={{fill: '#f0fdf4'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} formatter={(value: number) => [`${value} điểm`, timeFilter === 'day' ? 'Tổng kết' : 'Trung bình']} />
                                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index % 2 === 0 ? settings.primaryColor || '#15803d' : settings.secondaryColor || '#ca8a04'} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                  <BarChart3 className="w-10 h-10 mb-2 opacity-50"/>
                                  <span className="text-sm font-medium">Không có dữ liệu cho thời gian này</span>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* Breadcrumbs for Documents */}
              {activeTab === 'documents' && (
                  <div className="flex items-center space-x-2 mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm overflow-x-auto">
                      <button 
                        onClick={() => setCurrentFolderId(null)}
                        className={`flex items-center px-2 py-1 rounded hover:bg-gray-100 ${!currentFolderId ? 'font-bold text-green-700' : 'text-gray-500'}`}
                      >
                          <Home className="w-4 h-4 mr-1"/> Gốc
                      </button>
                      {folderPath.map((folder, idx) => (
                          <div key={folder.id} className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-gray-400 mx-1"/>
                              <button 
                                onClick={() => setCurrentFolderId(folder.id)}
                                className={`px-2 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${idx === folderPath.length - 1 ? 'font-bold text-green-700' : 'text-gray-500'}`}
                              >
                                  {folder.name}
                              </button>
                          </div>
                      ))}
                  </div>
              )}

              {/* Search & Filter Bar */}
              <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 flex items-center shadow-sm">
                  <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm thông tin..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                  </div>
                  {activeTab === 'questions' && (
                      <div className="ml-4 flex items-center space-x-2">
                          <Filter className="h-4 w-4 text-gray-500" />
                          <select
                              value={selectedMilestoneForQuestions}
                              onChange={(e) => setSelectedMilestoneForQuestions(e.target.value)}
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
                          >
                              <option value="all">Tất cả giai đoạn</option>
                              {milestones.map(m => (
                                  <option key={m.id} value={m.id}>Năm {m.year} - {m.title}</option>
                              ))}
                          </select>
                      </div>
                  )}
                  <div className="ml-auto flex items-center text-sm text-gray-500">
                      <Filter className="h-4 w-4 mr-2" />
                      Hiển thị {data.length} kết quả
                  </div>
              </div>

              {/* Data Table / Drag Zone */}
              <div 
                className={`bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-100 min-h-[400px] relative transition-colors ${isDragging && activeTab === 'documents' ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''}`}
                onDragOver={activeTab === 'documents' ? handleDragOver : undefined}
                onDragLeave={activeTab === 'documents' ? handleDragLeave : undefined}
                onDrop={activeTab === 'documents' ? handleDrop : undefined}
              >
                  {isDragging && activeTab === 'documents' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/90 z-50 pointer-events-none">
                          <Upload className="w-16 h-16 text-blue-500 mb-4 animate-bounce" />
                          <h3 className="text-xl font-bold text-blue-700">Thả tệp vào đây để tải lên</h3>
                      </div>
                  )}

                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                          <tr>
                              {/* Dynamic Headers */}
                              {activeTab === 'articles' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Tác giả</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Ngày</th>
                                </>
                              )}
                              {activeTab === 'history' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Năm</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Tiêu đề / Sự kiện</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Mô tả ngắn</th>
                                </>
                              )}
                              {activeTab === 'personnel' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Thành viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Tài khoản / Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Thông tin đơn vị</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase tracking-wider">Phân quyền</th>
                                </>
                              )}
                              {activeTab === 'questions' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider w-1/2">Câu hỏi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Đáp án đúng</th>
                                </>
                              )}
                              {activeTab === 'scores' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Đơn vị</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase tracking-wider">Quân sự</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase tracking-wider">Chính trị</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase tracking-wider">Hậu cần</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase tracking-wider">Chính quy</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase tracking-wider">Tổng kết</th>
                                </>
                              )}
                              {activeTab === 'documents' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider w-1/2">Tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Ngày sửa đổi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Kích thước</th>
                                </>
                              )}
                              {activeTab === 'media' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Ngày đăng</th>
                                </>
                              )}
                              {activeTab === 'leaders' && (
                                <>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Hình ảnh</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Họ tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Chức vụ</th>
                                </>
                              )}
                              <th className="px-6 py-4 text-right text-xs font-bold text-green-800 uppercase tracking-wider">Thao tác</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {data.length > 0 ? data.map((item: any) => (
                              <tr 
                                key={item.id} 
                                className={`hover:bg-green-50/50 transition-colors ${activeTab === 'documents' ? 'cursor-pointer' : ''}`}
                                onClick={() => {
                                    if (activeTab === 'documents') {
                                        if (item.isFolder) {
                                            handleFolderClick(item.id);
                                        } else {
                                            handleDownload(item); // Click file to download/view
                                        }
                                    }
                                }}
                              >
                                  {/* Dynamic Rows */}
                                  {activeTab === 'articles' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                            {item.imageUrl && <img src={item.imageUrl} className="w-10 h-10 rounded object-cover mr-3 border border-gray-200" alt=""/>}
                                            {item.title.substring(0, 30)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                    </>
                                  )}
                                  {activeTab === 'history' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-900">{item.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 flex items-center">
                                            {item.image && <img src={item.image} className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-200" alt=""/>}
                                            {item.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 line-clamp-1 max-w-xs">{item.subtitle}</td>
                                    </>
                                  )}
                                  {activeTab === 'personnel' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.rank} {item.position && `- ${item.position}`}</div>
                                            <div className="text-xs text-gray-500">{item.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {item.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                            </span>
                                        </td>
                                    </>
                                  )}
                                  {activeTab === 'questions' && (
                                    <>
                                        <td className="px-6 py-4 text-sm text-gray-900 line-clamp-1 block max-w-md">{item.questionText}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">Đáp án {String.fromCharCode(65 + item.correctAnswerIndex)}</td>
                                    </>
                                  )}
                                  {activeTab === 'scores' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.unitName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{item.militaryScore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{item.politicalScore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{item.logisticsScore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{item.disciplineScore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-green-700 bg-green-50 rounded-lg">{item.totalScore}</td>
                                    </>
                                  )}
                                  {activeTab === 'documents' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                            {item.isFolder ? (
                                                <Folder className="w-5 h-5 text-yellow-500 mr-3 fill-yellow-500" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                            )}
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.isFolder ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                                    </>
                                  )}
                                  {activeTab === 'media' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.type === 'video' ? <Film className="text-blue-500 w-5 h-5"/> : <Music className="text-green-500 w-5 h-5"/>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                    </>
                                  )}
                                  {activeTab === 'leaders' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover border border-gray-200"/>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.role}</td>
                                    </>
                                  )}

                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      {/* Document Download/View Buttons */}
                                      {activeTab === 'documents' && !item.isFolder && (
                                          <>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation();
                                                    handleDownload(item);
                                                }} 
                                                className="text-gray-500 hover:text-gray-800 mr-2 transition-colors p-1 hover:bg-gray-100 rounded"
                                                title="Xem"
                                            >
                                                <Eye className="h-4 w-4"/>
                                            </button>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation();
                                                    handleDownload(item);
                                                }} 
                                                className="text-green-600 hover:text-green-800 mr-2 transition-colors p-1 hover:bg-green-50 rounded"
                                                title="Tải xuống"
                                            >
                                                <DownloadCloud className="h-4 w-4"/>
                                            </button>
                                          </>
                                      )}

                                      {/* Edit Button */}
                                      <button 
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            if (activeTab === 'articles' || activeTab === 'history') {
                                                openEditor(item, activeTab);
                                            } else if (activeTab === 'questions') {
                                                openQuestionEditor(item);
                                            } else {
                                                setEditingItem(item); 
                                                setIsModalOpen(true); 
                                            }
                                        }} 
                                        className="text-blue-600 hover:text-blue-800 mr-4 transition-colors p-1 hover:bg-blue-50 rounded"
                                        title={activeTab === 'documents' ? "Đổi tên" : "Chỉnh sửa"}
                                      >
                                          <Edit className="h-4 w-4"/>
                                      </button>
                                      
                                      {/* Delete Button */}
                                      <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id, activeTab);
                                        }} 
                                        className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                                        title="Xóa"
                                      >
                                          <Trash2 className="h-4 w-4"/>
                                      </button>
                                  </td>
                              </tr>
                          )) : (
                              <tr>
                                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                                      {activeTab === 'documents' ? 'Thư mục trống. Kéo thả tệp vào đây.' : 'Không tìm thấy dữ liệu phù hợp.'}
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex pl-64">
        {renderSidebar()}
        <div className="flex-1 p-8 overflow-y-auto h-screen relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 pointer-events-none"></div>
            <div className="relative z-10 max-w-6xl mx-auto">
                {renderContent()}
            </div>
        </div>
        {renderModal()}
        {renderQuestionEditor()}
    </div>
  );
};

export default AdminDashboard;