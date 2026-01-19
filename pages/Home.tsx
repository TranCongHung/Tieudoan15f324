
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Article } from '../types';
import { Calendar, User, ArrowRight, Star, Loader2, Newspaper, AlertTriangle } from 'lucide-react';
import { Link } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await apiService.getArticles();
            setArticles(data);
        } catch (error: any) {
            console.error("Lỗi lấy bài viết:", error);
            setErrorMsg(error.message || "Không thể kết nối tới máy chủ dữ liệu.");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  return (
    <div className="pb-20 bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src={settings.heroImage || "https://images.unsplash.com/photo-1579935110378-8126281bd75d?auto=format&fit=crop&q=80"}
            alt="Hero Background"
          />
          <div 
             className="absolute inset-0 bg-black/60"
             style={{ 
                 background: `linear-gradient(to right, ${settings.primaryColor}E6, transparent)` 
             }}
          ></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl animate-fade-in-up">
              <div 
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 uppercase tracking-widest border border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
              >
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 fill-current" /> Sư đoàn 324 - Đoàn Ngự Bình
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-white mb-4 sm:mb-6 leading-tight">
                {settings.heroTitle || "Tiểu đoàn 15 Anh Hùng"}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 lg:mb-10 font-serif leading-relaxed italic border-l-4 pl-4 sm:pl-6" style={{ borderColor: settings.secondaryColor }}>
                {settings.heroSubtitle || "Phát huy truyền thống, cống hiến tài năng, xứng danh Bộ đội Cụ Hồ."}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/history"
                  className="px-6 py-3 sm:px-8 sm:py-4 font-bold rounded-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center uppercase text-xs sm:text-sm tracking-wider"
                  style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}
                >
                  Lịch sử truyền thống <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5"/>
                </Link>
                <Link
                   to="/quiz"
                   className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-md border border-white/30 transition-all flex items-center justify-center uppercase text-xs sm:text-sm tracking-wider"
                >
                   Kiểm tra nhận thức
                </Link>
              </div>
          </div>
        </div>
      </div>

      {/* Tin tức nổi bật */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 lg:-mt-10 relative z-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-100">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 border-b border-gray-100 pb-4 sm:pb-6 gap-4">
             <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 flex items-center">
                  <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-green-700" /> Bản tin đơn vị
                </h2>
                <p className="text-gray-500 mt-1 font-serif text-sm sm:text-base">Cập nhật những hoạt động mới nhất của Tiểu đoàn 15</p>
             </div>
             <Link to="#" className="text-xs sm:text-sm font-bold uppercase tracking-widest hover:text-yellow-600 transition-colors whitespace-nowrap" style={{ color: settings.primaryColor }}>
               Xem tất cả bài viết →
             </Link>
           </div>

           {loading ? (
               <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
                   <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 animate-spin text-green-700 mb-3 sm:mb-4" />
                   <p className="text-gray-500 font-serif italic text-sm sm:text-base">Đang tải dữ liệu từ Supabase...</p>
               </div>
           ) : errorMsg ? (
               <div className="bg-red-50 border-2 border-red-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 text-center">
                   <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                   <h3 className="text-base sm:text-lg font-bold text-red-800 mb-2">Không thể tải bài báo</h3>
                   <p className="text-red-600 font-serif italic mb-4 sm:mb-6 text-sm sm:text-base">{errorMsg}</p>
                   <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-sm sm:text-base"
                   >
                      Thử lại ngay
                   </button>
               </div>
           ) : (
               <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                 {articles.length > 0 ? articles.map((article) => (
                   <article key={article.id} className="group bg-white flex flex-col h-full rounded-xl sm:rounded-2xl overflow-hidden border border-gray-50 hover:shadow-2xl transition-all duration-500">
                     <Link to={`/article/${article.id}`} className="block h-48 sm:h-56 overflow-hidden relative">
                       <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={article.imageUrl || "https://picsum.photos/400/300"} alt={article.title} />
                       <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                           <span className="bg-green-700 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-tighter">Tin mới</span>
                       </div>
                     </Link>
                     <div className="p-4 sm:p-6 flex-1 flex flex-col">
                       <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-widest">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1"/> {article.date}</span>
                          <span className="flex items-center"><User className="h-3 w-3 mr-1"/> {article.author}</span>
                       </div>
                       <Link to={`/article/${article.id}`} className="block group-hover:text-green-700 transition-colors mb-3 sm:mb-4">
                          <h3 className="text-lg sm:text-xl font-display font-bold text-gray-900 leading-tight line-clamp-2">
                              {article.title}
                          </h3>
                       </Link>
                       <p className="text-gray-600 text-sm line-clamp-3 mb-4 sm:mb-6 font-serif leading-relaxed">
                           {article.summary}
                       </p>
                       <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-50">
                           <Link 
                                to={`/article/${article.id}`} 
                                className="inline-flex items-center text-xs font-black uppercase tracking-wider text-green-800 hover:text-yellow-600 transition-colors"
                           >
                               Đọc chi tiết bài viết <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                           </Link>
                       </div>
                     </div>
                   </article>
                 )) : (
                     <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center bg-gray-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200">
                         <p className="text-gray-400 font-serif italic text-base sm:text-lg">Chưa có bài báo nào được cập nhật trên hệ thống.</p>
                     </div>
                 )}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Home;
