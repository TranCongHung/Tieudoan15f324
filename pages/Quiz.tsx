
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { QuizResult, Question, Milestone } from '../types';
import { Trophy, Medal, Calendar, Search, User, Award, Shield, ListFilter, Play, CheckCircle, Clock, ArrowLeft, BookOpen, X, HelpCircle, AlertCircle } from 'lucide-react';
import { useAuth, useNavigate } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';

type QuizView = 'leaderboard' | 'topic-select' | 'start' | 'milestone-detail' | 'taking' | 'result';

const Quiz: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [currentView, setCurrentView] = useState<QuizView>('start');
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [filter, setFilter] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('Tất cả');
  const [topics, setTopics] = useState<string[]>(['Tất cả']);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    refreshLeaderboard();
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
        setIsLoadingMilestones(true);
        const data = await apiService.getHistory();
        setMilestones(data);
    } catch (e) {
        console.error("Lỗi tải mốc lịch sử:", e);
    } finally {
        setIsLoadingMilestones(false);
    }
  };

  useEffect(() => {
      if (currentView === 'taking') {
          const id = setInterval(() => setTimer(prev => prev + 1), 1000);
          setIntervalId(id);
      } else {
          clearInterval(intervalId);
      }
      return () => clearInterval(intervalId);
  }, [currentView]);

  const refreshLeaderboard = async () => {
    try {
        const results = await apiService.getQuizResults();
        const sorted = results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setLeaderboard(sorted);
        const uniqueTopics = Array.from(new Set(results.map(r => r.topic)));
        setTopics(['Tất cả', ...uniqueTopics]);
    } catch (e) { console.error("Lỗi đồng bộ bảng xếp hạng:", e); }
  };

  const handleStartQuiz = async () => {
      if (!user) { 
          setShowLoginModal(true);
          return; 
      }
      if (!selectedMilestone) { alert("Vui lòng chọn chủ đề thi!"); return; }
      try {
          // Lấy câu hỏi từ milestone được chọn
          const quizQuestions = selectedMilestone.quiz || [];
          if (quizQuestions.length === 0) { alert("Chủ đề này không có câu hỏi!"); return; }
          
          // Shuffle câu hỏi
          const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
          setQuestions(shuffled);
          setUserAnswers(new Array(shuffled.length).fill(null));
          setCurrentQuestionIdx(0);
          setTimer(0);
          setCurrentView('taking');
      } catch (e) { alert("Lỗi khi tải câu hỏi."); }
  };

  const handleSubmitQuiz = async () => {
      if (!user || !selectedMilestone) return;
      clearInterval(intervalId);
      let score = 0;
      questions.forEach((q, idx) => { if (userAnswers[idx] === q.correctAnswerIndex) score++; });
      setQuizScore(score);
      const result: QuizResult = {
          id: `quiz_${user.id}_${selectedMilestone.id}_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userRank: user.rank,
          unit: user.unit || 'Chưa cập nhật',
          topic: selectedMilestone.title,
          score: score,
          totalQuestions: questions.length,
          timestamp: new Date().toISOString()
      };
      await apiService.saveQuizResult(result);
      refreshLeaderboard();
      setCurrentView('result');
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredData = leaderboard.filter(item => {
      const matchesTopic = activeTopic === 'Tất cả' || item.topic === activeTopic;
      const matchesSearch = item.userName.toLowerCase().includes(filter.toLowerCase()) || item.unit.toLowerCase().includes(filter.toLowerCase());
      return matchesTopic && matchesSearch;
  });

  const renderStartScreen = () => (
      <div className="bg-white rounded-xl shadow-xl p-8 text-center animate-fade-in-up border-t-8" style={{ borderColor: settings.primaryColor }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-yellow-100"><Award className="w-12 h-12 text-yellow-600" /></div>
          <h2 className="text-3xl font-display font-bold mb-4" style={{ color: settings.primaryColor }}>Hội Thao Trực Tuyến</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Kiểm tra kiến thức về các giai đoạn lịch sử quan trọng của Sư đoàn 324.</p>
          <button onClick={() => setCurrentView('topic-select')} className="inline-flex items-center px-8 py-4 text-white font-bold text-lg rounded-full hover:scale-105 shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
              <Play className="w-6 h-6 mr-2" fill="currentColor" /> Bắt đầu làm bài
          </button>
      </div>
  );

  const renderTopicSelect = () => (
      <div className="max-w-5xl mx-auto animate-fade-in-up">
          <button 
              onClick={() => setCurrentView('start')}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-800 font-bold transition-colors"
          >
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
          </button>
          
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border-t-8" style={{ borderColor: settings.primaryColor }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" style={{ color: settings.primaryColor }} />
                  Chọn chủ đề thi
              </h2>
              <p className="text-gray-600">Hãy chọn một giai đoạn lịch sử để kiểm tra kiến thức</p>
          </div>

          {isLoadingMilestones ? (
              <div className="text-center py-12">
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
          ) : milestones.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                  <p className="text-gray-500">Chưa có bài thi nào</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {milestones.map((milestone) => (
                      <button
                          key={milestone.id}
                          onClick={() => {
                              setSelectedMilestone(milestone);
                              setCurrentView('milestone-detail');
                          }}
                          className={`p-6 rounded-xl text-left transition-all border-2 hover:shadow-lg ${
                              selectedMilestone?.id === milestone.id
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                          <div className="flex items-start justify-between mb-3">
                              <div>
                                  <h3 className="text-lg font-bold text-gray-800">{milestone.title}</h3>
                                  <p className="text-sm text-gray-500">Năm {milestone.year}</p>
                              </div>
                              {milestone.quiz && milestone.quiz.length > 0 && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                      {milestone.quiz.length} câu
                                  </span>
                              )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{milestone.subtitle}</p>
                      </button>
                  ))}
              </div>
          )}
      </div>
  );

  const renderMilestoneDetail = () => {
      if (!selectedMilestone) return null;
      const hasQuiz = selectedMilestone.quiz && selectedMilestone.quiz.length > 0;

      return (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
              <button 
                  onClick={() => {
                      setCurrentView('topic-select');
                      setSelectedMilestone(null);
                  }}
                  className="mb-6 flex items-center text-gray-600 hover:text-gray-800 font-bold transition-colors"
              >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại chọn bài thi
              </button>

              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="h-64 bg-gradient-to-r from-green-700 to-green-800 relative overflow-hidden">
                      <img src={selectedMilestone.image} alt={selectedMilestone.title} className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                      <div className="absolute inset-0 flex flex-col justify-end p-8">
                          <h2 className="text-4xl font-display font-black text-white mb-2">{selectedMilestone.title}</h2>
                          <p className="text-lg text-green-100">{selectedMilestone.subtitle}</p>
                          <div className="mt-4 flex items-center text-yellow-300 font-bold">
                              <Calendar className="w-5 h-5 mr-2" /> Năm {selectedMilestone.year}
                          </div>
                      </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                      <div className="prose prose-lg max-w-none mb-8">
                          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                              <BookOpen className="w-6 h-6 mr-3" style={{ color: settings.primaryColor }} />
                              Giới thiệu
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-justify">{selectedMilestone.content}</p>
                      </div>

                      {/* Quiz Info */}
                      {hasQuiz ? (
                          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
                              <div className="flex items-start">
                                  <HelpCircle className="w-6 h-6 text-yellow-600 mr-4 flex-shrink-0 mt-1" />
                                  <div className="flex-grow">
                                      <h4 className="text-lg font-bold text-gray-800 mb-2">Bài kiểm tra</h4>
                                      <p className="text-gray-700 mb-3">
                                          Bài kiểm tra trắc nghiệm về giai đoạn lịch sử này gồm <span className="font-bold text-yellow-700">{selectedMilestone.quiz.length} câu hỏi</span>. Bạn sẽ phải trả lời tất cả các câu hỏi trước khi nộp bài.
                                      </p>
                                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                          <li>✓ Thời gian làm bài: Không giới hạn</li>
                                          <li>✓ Loại câu hỏi: Trắc nghiệm 4 đáp án</li>
                                          <li>✓ Kết quả sẽ được lưu vào bảng xếp hạng</li>
                                      </ul>
                                      <button
                                          onClick={handleStartQuiz}
                                          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all uppercase tracking-wide"
                                      >
                                          <Play className="w-5 h-5 mr-2" fill="currentColor" /> Bắt đầu làm bài thi
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                              <div className="flex items-center">
                                  <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
                                  <span className="text-blue-700 font-semibold">Giai đoạn này chưa có bài kiểm tra</span>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderTakingQuiz = () => {
      const currentQuestion = questions[currentQuestionIdx];
      const progress = ((currentQuestionIdx + 1) / questions.length) * 100;
      const answeredCount = userAnswers.filter(a => a !== null).length;
      
      return (
          <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: settings.primaryColor }}>
                  <div>
                      <span className="font-bold text-gray-600 text-sm uppercase">Câu {currentQuestionIdx + 1}/{questions.length}</span>
                      <div className="text-xs text-gray-400 mt-1">Đã trả lời: {answeredCount}/{questions.length}</div>
                  </div>
                  <div className="flex items-center font-mono font-bold text-lg" style={{ color: settings.primaryColor }}><Clock className="w-5 h-5 mr-2" /> {formatTime(timer)}</div>
              </div>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-8 flex-grow">
                      <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">{currentQuestion.questionText}</h3>
                      <div className="space-y-4">
                          {currentQuestion.options.map((option, idx) => (
                              <button key={idx} onClick={() => { const n = [...userAnswers]; n[currentQuestionIdx] = idx; setUserAnswers(n); }} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${userAnswers[currentQuestionIdx] === idx ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold ${userAnswers[currentQuestionIdx] === idx ? 'bg-green-600 text-white' : 'text-gray-400'}`}>{String.fromCharCode(65 + idx)}</div>
                                  <span className={`text-lg ${userAnswers[currentQuestionIdx] === idx ? 'font-bold text-green-900' : 'text-gray-700'}`}>{option}</span>
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="bg-gray-50 p-6 flex justify-between">
                      <button onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))} className="px-6 py-2 text-gray-600 font-bold disabled:opacity-30" disabled={currentQuestionIdx === 0}>← Câu trước</button>
                      {currentQuestionIdx === questions.length - 1 ? (
                          <button 
                              onClick={handleSubmitQuiz}
                              disabled={answeredCount < questions.length}
                              className={`px-8 py-3 font-bold rounded-lg transition-all ${
                                  answeredCount < questions.length
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                          >
                              Nộp bài ({answeredCount}/{questions.length})
                          </button>
                      ) : (
                          <button onClick={() => setCurrentQuestionIdx(p => p + 1)} className="px-8 py-3 text-white font-bold rounded-lg hover:shadow-lg transition-all" style={{ backgroundColor: settings.primaryColor }}>
                              Câu tiếp theo →
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderResult = () => {
      const percentage = Math.round((quizScore / questions.length) * 100);
      const isPerfect = quizScore === questions.length;
      const isGood = percentage >= 70;
      
      return (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
                  <div className="text-white p-8 text-center" style={{ backgroundColor: settings.primaryColor }}>
                      <h2 className="text-3xl font-display font-bold mb-2">Kết Quả Bài Thi</h2>
                      {selectedMilestone && (
                          <p className="text-white/80 text-sm">{selectedMilestone.title} • {selectedMilestone.year}</p>
                      )}
                  </div>
                  <div className="p-8 text-center">
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 ${
                          isPerfect ? 'bg-yellow-100' : isGood ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                          {isPerfect && <Trophy className="w-16 h-16 text-yellow-600" />}
                          {!isPerfect && isGood && <Medal className="w-16 h-16 text-blue-600" />}
                          {!isPerfect && !isGood && <Award className="w-16 h-16 text-orange-600" />}
                      </div>
                      
                      <div className="text-6xl font-black text-gray-800 mb-2">
                          {quizScore}<span className="text-2xl text-gray-400 font-normal">/{questions.length}</span>
                      </div>
                      <div className="text-3xl font-bold mb-4" style={{ color: settings.primaryColor }}>{percentage}%</div>
                      
                      <div className={`p-6 rounded-lg mb-8 ${
                          isPerfect ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' : 
                          isGood ? 'bg-blue-50 text-blue-900 border border-blue-200' :
                          'bg-orange-50 text-orange-900 border border-orange-200'
                      }`}>
                          {isPerfect && <p className="font-bold text-lg">🎉 Xuất sắc! Bạn đã đạt điểm tuyệt đối!</p>}
                          {!isPerfect && isGood && <p className="font-bold text-lg">👏 Rất tốt! Bạn nắm vững phần lớn nội dung.</p>}
                          {!isPerfect && !isGood && <p className="font-bold text-lg">💪 Cần cố gắng thêm! Hãy ôn lại lịch sử.</p>}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <button 
                              onClick={() => {
                                  setCurrentView('topic-select');
                                  setSelectedMilestone(null);
                              }} 
                              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-all"
                          >
                              Chọn bài thi khác
                          </button>
                          <button 
                              onClick={() => setCurrentView('leaderboard')} 
                              className="px-8 py-3 text-white rounded-lg font-bold transition-all hover:shadow-lg"
                              style={{ backgroundColor: settings.primaryColor }}
                          >
                              Xem bảng xếp hạng
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderLeaderboard = () => (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 uppercase flex items-center"><Shield className="w-6 h-6 mr-2" style={{ color: settings.primaryColor }} /> Xếp hạng thi đua</h2>
                    <div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tìm tên..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                </div>

                {/* Topic Filter */}
                <div className="border-t pt-4">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 block flex items-center">
                        <ListFilter className="w-4 h-4 mr-1" /> Lọc theo chủ đề kiểm tra
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {topics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setActiveTopic(topic)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                    activeTopic === topic
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {topic}
                                <span className="ml-2 text-xs">({leaderboard.filter(r => topic === 'Tất cả' ? true : r.topic === topic).length})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
            {filteredData.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="bg-green-50 text-green-900 text-sm font-bold uppercase border-b">
                        <tr><th className="px-6 py-4 text-center">Hạng</th><th className="px-6 py-4">Cán bộ / Chiến sĩ</th><th className="px-6 py-4 text-center">Nội dung kiểm tra</th><th className="px-6 py-4 text-center">Điểm số</th><th className="px-6 py-4 text-right">Ngày thi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.map((result, index) => (
                            <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-center font-bold text-lg">{index + 1}</td>
                                <td className="px-6 py-4"><div><div className="font-bold text-gray-900">{result.userName}</div><div className="text-xs text-gray-500">{result.userRank} - {result.unit}</div></div></td>
                                <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">{result.topic}</td>
                                <td className="px-6 py-4 text-center font-black text-xl" style={{ color: settings.primaryColor }}>{result.score}/{result.totalQuestions}</td>
                                <td className="px-6 py-4 text-right text-gray-500 text-sm">{new Date(result.timestamp).toLocaleDateString('vi-VN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-12 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Chưa có kết quả kiểm tra nào cho chủ đề này.</p>
                </div>
            )}
        </div>
    </div>
  );

  // Login Modal Component
  const LoginModal = () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-t-4" style={{ borderColor: settings.primaryColor }} animate-scale-up>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                      <Trophy className="w-6 h-6 mr-2" style={{ color: settings.primaryColor }} />
                      Yêu cầu đăng nhập
                  </h2>
                  <button 
                      onClick={() => setShowLoginModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                      <X className="w-6 h-6" />
                  </button>
              </div>

              <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Đăng nhập để bắt đầu</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Để tham gia kiểm tra nhận thức và ghi lại kết quả, đồng chí vui lòng đăng nhập vào hệ thống.
                  </p>

                  <div className="space-y-3">
                      <button 
                          onClick={() => navigate('/login')}
                          className="w-full py-3 text-white font-bold rounded-lg hover:shadow-lg transition-all uppercase tracking-wider text-sm"
                          style={{ backgroundColor: settings.primaryColor }}
                      >
                          Đăng nhập
                      </button>
                      <button 
                          onClick={() => navigate('/register')}
                          className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all uppercase tracking-wider text-sm"
                      >
                          Đăng ký tài khoản
                      </button>
                      <button 
                          onClick={() => setShowLoginModal(false)}
                          className="w-full py-2 text-gray-500 font-semibold hover:text-gray-700 transition-colors text-sm"
                      >
                          Đóng
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
        <div className="text-white py-12 px-4 text-center" style={{ backgroundColor: settings.primaryColor }}>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-wider mb-4 text-yellow-500 drop-shadow-md">Hội Thao Trực Tuyến</h1>
            {currentView !== 'topic-select' && (
                <div className="flex justify-center space-x-4 mt-8">
                    <button 
                        onClick={() => setCurrentView('start')} 
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            currentView === 'start' || currentView === 'taking' || currentView === 'result'
                                ? 'bg-yellow-500 text-green-900 shadow-lg' 
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        Làm bài thi
                    </button>
                    <button 
                        onClick={() => setCurrentView('leaderboard')} 
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            currentView === 'leaderboard' 
                                ? 'bg-yellow-500 text-green-900 shadow-lg' 
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        Bảng xếp hạng
                    </button>
                </div>
            )}
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8">
            {currentView === 'start' && renderStartScreen()}
            {currentView === 'topic-select' && renderTopicSelect()}
            {currentView === 'milestone-detail' && renderMilestoneDetail()}
            {currentView === 'taking' && renderTakingQuiz()}
            {currentView === 'result' && renderResult()}
            {currentView === 'leaderboard' && renderLeaderboard()}
        </div>

        {/* Login Modal */}
        {showLoginModal && <LoginModal />}
    </div>
  );
};

export default Quiz;
