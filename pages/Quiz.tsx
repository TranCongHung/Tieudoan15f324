
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { QuizResult, Question } from '../types';
import { Trophy, Medal, Calendar, Search, User, Award, Shield, ListFilter, Play, CheckCircle, Clock } from 'lucide-react';
import { Link, useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';

type QuizView = 'leaderboard' | 'start' | 'taking' | 'result';

const Quiz: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [currentView, setCurrentView] = useState<QuizView>('start');
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [filter, setFilter] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('Tất cả');
  const [topics, setTopics] = useState<string[]>(['Tất cả']);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<any>(null);

  useEffect(() => {
    refreshLeaderboard();
  }, []);

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
      if (!user) { alert("Vui lòng đăng nhập!"); return; }
      try {
          const allQuestions = await apiService.getQuestions();
          if (allQuestions.length === 0) { alert("Ngân hàng câu hỏi trống!"); return; }
          const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 20);
          setQuestions(shuffled);
          setUserAnswers(new Array(shuffled.length).fill(null));
          setCurrentQuestionIdx(0);
          setTimer(0);
          setCurrentView('taking');
      } catch (e) { alert("Lỗi khi tải câu hỏi."); }
  };

  const handleSubmitQuiz = async () => {
      if (!user) return;
      clearInterval(intervalId);
      let score = 0;
      questions.forEach((q, idx) => { if (userAnswers[idx] === q.correctAnswerIndex) score++; });
      setQuizScore(score);
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
          <h2 className="text-3xl font-display font-bold mb-4" style={{ color: settings.primaryColor }}>Kiểm Tra Nhận Thức Chính Trị</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Hệ thống câu hỏi được cập nhật từ Ngân hàng đề thi của Tiểu đoàn.</p>
          <button onClick={handleStartQuiz} className="inline-flex items-center px-8 py-4 text-white font-bold text-lg rounded-full hover:scale-105 shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
              <Play className="w-6 h-6 mr-2" fill="currentColor" /> Bắt đầu làm bài
          </button>
      </div>
  );

  const renderTakingQuiz = () => {
      const currentQuestion = questions[currentQuestionIdx];
      const progress = ((currentQuestionIdx + 1) / questions.length) * 100;
      return (
          <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-gray-500">Câu hỏi {currentQuestionIdx + 1}/{questions.length}</span>
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
                      <button onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))} className="px-6 py-2 text-gray-600 font-bold disabled:opacity-30" disabled={currentQuestionIdx === 0}>Câu trước</button>
                      {currentQuestionIdx === questions.length - 1 ? <button onClick={handleSubmitQuiz} className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Nộp bài</button> : <button onClick={() => setCurrentQuestionIdx(p => p + 1)} className="px-8 py-3 text-white font-bold rounded-lg" style={{ backgroundColor: settings.primaryColor }}>Câu tiếp theo</button>}
                  </div>
              </div>
          </div>
      );
  };

  const renderResult = () => (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
              <div className="text-white p-8 text-center" style={{ backgroundColor: settings.primaryColor }}><h2 className="text-3xl font-display font-bold mb-2">Kết Quả Bài Thi</h2></div>
              <div className="p-8 text-center">
                  <div className="text-6xl font-black text-gray-800 mb-2">{quizScore}<span className="text-2xl text-gray-400 font-normal">/{questions.length}</span></div>
                  <div className="flex justify-center space-x-4 mt-8">
                       <button onClick={() => setCurrentView('start')} className="px-6 py-2 border border-gray-300 rounded-lg font-bold text-gray-600">Quay lại</button>
                       <button onClick={() => setCurrentView('leaderboard')} className="px-6 py-2 bg-yellow-500 text-green-900 rounded-lg font-bold">Xếp hạng</button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderLeaderboard = () => (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 uppercase flex items-center"><Shield className="w-6 h-6 mr-2" style={{ color: settings.primaryColor }} /> Xếp hạng thi đua</h2>
            <div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tìm tên..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-green-50 text-green-900 text-sm font-bold uppercase border-b">
                    <tr><th className="px-6 py-4 text-center">Hạng</th><th className="px-6 py-4">Cán bộ / Chiến sĩ</th><th className="px-6 py-4 text-center">Điểm số</th><th className="px-6 py-4 text-right">Ngày thi</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.map((result, index) => (
                        <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-center font-bold text-lg">{index + 1}</td>
                            <td className="px-6 py-4"><div><div className="font-bold text-gray-900">{result.userName}</div><div className="text-xs text-gray-500">{result.userRank} - {result.unit}</div></div></td>
                            <td className="px-6 py-4 text-center font-black text-xl" style={{ color: settings.primaryColor }}>{result.score}/{result.totalQuestions}</td>
                            <td className="px-6 py-4 text-right text-gray-500 text-sm">{new Date(result.timestamp).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
        <div className="text-white py-12 px-4 text-center" style={{ backgroundColor: settings.primaryColor }}>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-wider mb-4 text-yellow-500 drop-shadow-md">Hội Thao Trực Tuyến</h1>
            <div className="flex justify-center space-x-4 mt-8">
                <button onClick={() => setCurrentView('start')} className={`px-6 py-3 rounded-lg font-bold ${currentView === 'start' ? 'bg-yellow-500 text-green-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>Làm bài thi</button>
                <button onClick={() => setCurrentView('leaderboard')} className={`px-6 py-3 rounded-lg font-bold ${currentView === 'leaderboard' ? 'bg-yellow-500 text-green-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>Bảng xếp hạng</button>
            </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8">{currentView === 'start' && renderStartScreen()}{currentView === 'taking' && renderTakingQuiz()}{currentView === 'result' && renderResult()}{currentView === 'leaderboard' && renderLeaderboard()}</div>
    </div>
  );
};

export default Quiz;
