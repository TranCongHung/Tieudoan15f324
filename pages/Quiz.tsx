import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { QuizResult, Question } from '../types';
import { Trophy, Medal, Calendar, Search, User, Award, Shield, ListFilter, Play, CheckCircle, XCircle, Clock, AlertCircle, Check } from 'lucide-react';
import { Link } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

type QuizView = 'leaderboard' | 'start' | 'taking' | 'result';

const Quiz: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<QuizView>('start');
  
  // Leaderboard Data
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [filter, setFilter] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('Tất cả');
  const [topics, setTopics] = useState<string[]>(['Tất cả']);

  // Quiz Taking Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<any>(null);

  useEffect(() => {
    refreshLeaderboard();
  }, []);

  // Timer Effect
  useEffect(() => {
      if (currentView === 'taking') {
          const id = setInterval(() => {
              setTimer(prev => prev + 1);
          }, 1000);
          setIntervalId(id);
      } else {
          clearInterval(intervalId);
      }
      return () => clearInterval(intervalId);
  }, [currentView]);

  const refreshLeaderboard = () => {
    const results = storage.getQuizResults();
    const sorted = results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setLeaderboard(sorted);
    const uniqueTopics = Array.from(new Set(results.map(r => r.topic)));
    setTopics(['Tất cả', ...uniqueTopics]);
  };

  // --- QUIZ LOGIC ---

  const handleStartQuiz = () => {
      if (!user) {
          alert("Vui lòng đăng nhập để tham gia thi!");
          return;
      }
      
      const allQuestions = storage.getQuestions();
      if (allQuestions.length === 0) {
          alert("Ngân hàng câu hỏi hiện đang trống. Vui lòng liên hệ Admin!");
          return;
      }

      // Randomize and pick max 20 questions
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 20);
      
      setQuestions(shuffled);
      setUserAnswers(new Array(shuffled.length).fill(null));
      setCurrentQuestionIdx(0);
      setQuizScore(0);
      setTimer(0);
      setCurrentView('taking');
  };

  const handleAnswerSelect = (optionIdx: number) => {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIdx] = optionIdx;
      setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
      if (!user) return;

      clearInterval(intervalId);
      
      // Calculate Score
      let score = 0;
      questions.forEach((q, idx) => {
          if (userAnswers[idx] === q.correctAnswerIndex) {
              score++;
          }
      });
      setQuizScore(score);

      // Save Result
      const result: QuizResult = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          userRank: user.rank,
          unit: user.unit || 'Chiến sĩ',
          topic: 'Kiểm tra nhận thức chung',
          score: score,
          totalQuestions: questions.length,
          timestamp: new Date().toISOString()
      };
      storage.saveQuizResult(result);
      refreshLeaderboard(); // Update leaderboard data
      setCurrentView('result');
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RENDERING ---

  // 1. Leaderboard Filter Logic
  const filteredData = leaderboard.filter(item => {
      const matchesTopic = activeTopic === 'Tất cả' || item.topic === activeTopic;
      const matchesSearch = 
        item.userName.toLowerCase().includes(filter.toLowerCase()) || 
        item.unit.toLowerCase().includes(filter.toLowerCase());
      return matchesTopic && matchesSearch;
  });

  // Render Functions for Views
  const renderStartScreen = () => (
      <div className="bg-white rounded-xl shadow-xl p-8 text-center animate-fade-in-up border-t-8 border-green-700">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-12 h-12 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-display font-bold text-green-900 mb-4">Kiểm Tra Nhận Thức Chính Trị</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Hệ thống câu hỏi được cập nhật từ Ngân hàng đề thi của Tiểu đoàn. 
              Bài thi bao gồm các nội dung về Lịch sử, Chính trị, Quân sự và Pháp luật.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-green-800 text-lg mb-1">Ngẫu nhiên</h4>
                  <p className="text-sm text-green-600">Câu hỏi được chọn lọc ngẫu nhiên từ ngân hàng đề.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-green-800 text-lg mb-1">Không giới hạn</h4>
                  <p className="text-sm text-green-600">Thời gian làm bài thoải mái để nghiên cứu kỹ.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-green-800 text-lg mb-1">Xếp hạng</h4>
                  <p className="text-sm text-green-600">Kết quả được lưu vào Bảng vàng thành tích.</p>
              </div>
          </div>

          <button 
            onClick={handleStartQuiz}
            className="inline-flex items-center px-8 py-4 bg-green-700 text-white font-bold text-lg rounded-full hover:bg-green-800 hover:scale-105 transition-all shadow-lg hover:shadow-green-900/30"
          >
              <Play className="w-6 h-6 mr-2" fill="currentColor" /> Bắt đầu làm bài
          </button>
      </div>
  );

  const renderTakingQuiz = () => {
      const currentQuestion = questions[currentQuestionIdx];
      const isLastQuestion = currentQuestionIdx === questions.length - 1;
      const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

      return (
          <div className="max-w-4xl mx-auto animate-fade-in">
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-500">Câu hỏi {currentQuestionIdx + 1}/{questions.length}</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>
                  <div className="flex items-center text-green-700 font-mono font-bold text-lg">
                      <Clock className="w-5 h-5 mr-2" /> {formatTime(timer)}
                  </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 min-h-[400px] flex flex-col">
                  <div className="p-8 flex-grow">
                      <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                          {currentQuestion.questionText}
                      </h3>

                      <div className="space-y-4">
                          {currentQuestion.options.map((option, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => handleAnswerSelect(idx)}
                                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${
                                      userAnswers[currentQuestionIdx] === idx
                                      ? 'border-green-600 bg-green-50'
                                      : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                                  }`}
                              >
                                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold flex-shrink-0 transition-colors ${
                                      userAnswers[currentQuestionIdx] === idx
                                      ? 'border-green-600 bg-green-600 text-white'
                                      : 'border-gray-300 text-gray-400 group-hover:border-green-400'
                                  }`}>
                                      {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className={`text-lg ${userAnswers[currentQuestionIdx] === idx ? 'font-bold text-green-900' : 'text-gray-700'}`}>
                                      {option}
                                  </span>
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Navigation */}
                  <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
                      <button 
                          onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIdx === 0}
                          className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                          Câu trước
                      </button>

                      {isLastQuestion ? (
                          <button 
                              onClick={() => {
                                  if(window.confirm("Đồng chí chắc chắn muốn nộp bài?")) handleSubmitQuiz();
                              }}
                              className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition-all transform hover:scale-105"
                          >
                              Nộp bài thi
                          </button>
                      ) : (
                          <button 
                              onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                              className="px-8 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 shadow-md transition-all"
                          >
                              Câu tiếp theo
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderResult = () => {
      const percentage = Math.round((quizScore / questions.length) * 100);
      let message = "";
      let colorClass = "";

      if (percentage >= 80) {
          message = "Xuất sắc! Đồng chí nắm rất vững kiến thức.";
          colorClass = "text-green-600";
      } else if (percentage >= 50) {
          message = "Đạt yêu cầu. Cần cố gắng phát huy hơn nữa.";
          colorClass = "text-yellow-600";
      } else {
          message = "Chưa đạt. Đồng chí cần ôn luyện thêm.";
          colorClass = "text-red-600";
      }

      return (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
                  <div className="bg-green-900 text-white p-8 text-center">
                      <h2 className="text-3xl font-display font-bold mb-2">Kết Quả Bài Thi</h2>
                      <p className="opacity-80">Hoàn thành trong: {formatTime(timer)}</p>
                  </div>
                  <div className="p-8 text-center">
                      <div className="text-6xl font-black text-gray-800 mb-2">{quizScore}<span className="text-2xl text-gray-400 font-normal">/{questions.length}</span></div>
                      <div className={`text-xl font-bold mb-6 ${colorClass}`}>{message}</div>
                      
                      <div className="flex justify-center space-x-4">
                           <button 
                              onClick={() => {
                                  setQuestions([]); 
                                  setCurrentView('start');
                                  refreshLeaderboard();
                              }}
                              className="px-6 py-2 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50"
                           >
                               Quay lại
                           </button>
                           <button 
                              onClick={() => setCurrentView('leaderboard')}
                              className="px-6 py-2 bg-yellow-500 text-green-900 rounded-lg font-bold hover:bg-yellow-400 shadow-md"
                           >
                               Xem Bảng xếp hạng
                           </button>
                      </div>
                  </div>
              </div>

              {/* Review Answers */}
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Xem lại đáp án</h3>
                  {questions.map((q, idx) => {
                      const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                      return (
                          <div key={idx} className={`bg-white p-6 rounded-lg border-l-4 shadow-sm ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                              <div className="flex items-start mb-3">
                                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-3 ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                                      {idx + 1}
                                  </span>
                                  <p className="font-bold text-gray-800 text-lg">{q.questionText}</p>
                              </div>
                              <div className="ml-11 space-y-2">
                                  {q.options.map((opt, oIdx) => {
                                      let optStyle = "p-2 rounded border border-transparent";
                                      if (oIdx === q.correctAnswerIndex) optStyle = "bg-green-100 text-green-800 font-bold border-green-200";
                                      else if (oIdx === userAnswers[idx] && !isCorrect) optStyle = "bg-red-100 text-red-800 border-red-200 line-through";
                                      else optStyle = "text-gray-500";
                                      
                                      return (
                                          <div key={oIdx} className={optStyle}>
                                              {String.fromCharCode(65 + oIdx)}. {opt}
                                          </div>
                                      );
                                  })}
                                  {!isCorrect && q.explanation && (
                                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded italic">
                                          <span className="font-bold not-italic text-gray-800">Giải thích:</span> {q.explanation}
                                      </div>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderLeaderboard = () => (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-h-[500px] animate-fade-in">
        {/* Controls Area */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Shield className="w-6 h-6 text-green-800" />
                    <h2 className="text-xl font-bold text-gray-800 uppercase">Xếp hạng thi đua</h2>
                </div>
                
                {/* Search Box */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Tìm tên, đơn vị..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                </div>
            </div>

            {/* Topic Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex-shrink-0 text-gray-500 text-sm mr-2 flex items-center">
                    <ListFilter className="w-4 h-4 mr-1"/> Lọc theo nội dung:
                </div>
                {topics.map(topic => (
                    <button
                        key={topic}
                        onClick={() => setActiveTopic(topic)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            activeTopic === topic 
                            ? 'bg-green-700 text-white shadow-md transform -translate-y-0.5' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700'
                        }`}
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-green-50/50 text-green-900 text-sm font-bold uppercase tracking-wider border-b border-green-100">
                        <th className="px-6 py-4 w-20 text-center">Hạng</th>
                        <th className="px-6 py-4">Cán bộ / Chiến sĩ</th>
                        <th className="px-6 py-4">Nội dung thi</th>
                        <th className="px-6 py-4 text-center">Điểm số</th>
                        <th className="px-6 py-4 text-right">Ngày thi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.length > 0 ? (
                        filteredData.map((result, index) => {
                            // Top 3 Styling
                            let rankBadge;
                            let rowClass = "hover:bg-gray-50 transition-colors";
                            
                            // Calculate rank based on current filtered view
                            const rank = index + 1;

                            if (rank === 1) {
                                rankBadge = <Medal className="w-8 h-8 text-yellow-500 mx-auto drop-shadow-sm" fill="currentColor" />;
                                rowClass += " bg-yellow-50/30";
                            } else if (rank === 2) {
                                rankBadge = <Medal className="w-7 h-7 text-gray-400 mx-auto" fill="currentColor" />;
                            } else if (rank === 3) {
                                rankBadge = <Medal className="w-7 h-7 text-orange-400 mx-auto" fill="currentColor" />;
                            } else {
                                rankBadge = <span className="text-gray-500 font-bold text-lg">{rank}</span>;
                            }

                            return (
                                <tr key={result.id} className={rowClass}>
                                    <td className="px-6 py-4 text-center">
                                        {rankBadge}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="bg-green-100 p-2 rounded-full mr-3 border border-green-200">
                                                <User className="w-4 h-4 text-green-700" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{result.userName}</div>
                                                <div className="text-xs text-gray-500 font-medium">{result.userRank} - {result.unit}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {result.topic}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-block">
                                            <span className="text-xl font-display font-black text-green-800">{result.score}</span>
                                            <span className="text-xs text-gray-400 font-medium">/{result.totalQuestions}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 text-sm">
                                        <div className="flex items-center justify-end">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(result.timestamp).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-gray-500 italic bg-gray-50/50">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                                        <Award className="w-8 h-8 text-gray-400"/>
                                    </div>
                                    <p>Chưa có dữ liệu thi đua cho nội dung này.</p>
                                    {activeTopic !== 'Tất cả' && (
                                        <p className="text-sm mt-1">Hãy thử chọn chủ đề khác hoặc Tất cả.</p>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
        {/* Header Banner */}
        <div className="bg-green-900 text-white py-12 px-4 relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="max-w-7xl mx-auto relative z-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-full mb-4 shadow-lg animate-bounce-slow">
                    <Trophy className="w-8 h-8 text-green-900" />
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-wider mb-4 text-yellow-500 drop-shadow-md">
                    Hội Thao Trực Tuyến
                </h1>
                <p className="text-green-100 max-w-2xl mx-auto font-serif text-lg italic">
                    "Trung dũng, kiên cường, liên tục tấn công, lập công tập thể"
                </p>
                
                {/* View Switcher Tabs */}
                {currentView !== 'taking' && currentView !== 'result' && (
                    <div className="flex justify-center space-x-4 mt-8">
                        <button 
                            onClick={() => setCurrentView('start')}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${currentView === 'start' ? 'bg-yellow-500 text-green-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Làm bài thi</span>
                        </button>
                        <button 
                            onClick={() => setCurrentView('leaderboard')}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${currentView === 'leaderboard' ? 'bg-yellow-500 text-green-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <span className="flex items-center"><Trophy className="w-4 h-4 mr-2"/> Bảng xếp hạng</span>
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 relative z-20">
            {currentView === 'start' && renderStartScreen()}
            {currentView === 'taking' && renderTakingQuiz()}
            {currentView === 'result' && renderResult()}
            {currentView === 'leaderboard' && renderLeaderboard()}
        </div>
    </div>
  );
};

export default Quiz;