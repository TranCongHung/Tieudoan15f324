
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
      <div className="relative min-h-[80vh] flex items-center overflow-hidden">
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
                className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold mb-6 uppercase tracking-widest border border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
              >
                <Star className="h-4 w-4 mr-2 fill-current" /> Sư đoàn 324 - Đoàn Ngự Bình
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-tight">
                {settings.heroTitle || "Tiểu đoàn 15 Anh Hùng"}
              </h1>
              <p className="text-xl text-gray-200 mb-10 font-serif leading-relaxed italic border-l-4 pl-6" style={{ borderColor: settings.secondaryColor }}>
                {settings.heroSubtitle || "Phát huy truyền thống, cống hiến tài năng, xứng danh Bộ đội Cụ Hồ."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/history"
                  className="px-8 py-4 font-bold rounded-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center uppercase text-sm tracking-wider"
                  style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}
                >
                  Lịch sử truyền thống <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
                <Link
                   to="/quiz"
                   className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-md border border-white/30 transition-all flex items-center uppercase text-sm tracking-wider"
                >
                   Kiểm tra nhận thức
                </Link>
              </div>
          </div>
        </div>
      </div>

      {/* Tin tức nổi bật */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
           <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
             <div>
                <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center">
                  <Newspaper className="w-8 h-8 mr-3 text-green-700" /> Bản tin đơn vị
                </h2>
                <p className="text-gray-500 mt-1 font-serif">Cập nhật những hoạt động mới nhất của Tiểu đoàn 15</p>
             </div>
             <Link to="#" className="text-sm font-bold uppercase tracking-widest hover:text-yellow-600 transition-colors" style={{ color: settings.primaryColor }}>
               Xem tất cả bài viết →
             </Link>
           </div>

           {loading ? (
               <div className="flex flex-col items-center justify-center py-20">
                   <Loader2 className="w-12 h-12 animate-spin text-green-700 mb-4" />
                   <p className="text-gray-500 font-serif italic">Đang tải dữ liệu từ Supabase...</p>
               </div>
           ) : errorMsg ? (
               <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-10 text-center">
                   <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-red-800 mb-2">Không thể tải bài báo</h3>
                   <p className="text-red-600 font-serif italic mb-6">{errorMsg}</p>
                   <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                   >
                      Thử lại ngay
                   </button>
               </div>
           ) : (
               <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                 {articles.length > 0 ? articles.map((article) => (
                   <article key={article.id} className="group bg-white flex flex-col h-full rounded-2xl overflow-hidden border border-gray-50 hover:shadow-2xl transition-all duration-500">
                     <Link to={`/article/${article.id}`} className="block h-56 overflow-hidden relative">
                       <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={article.imageUrl || "https://picsum.photos/400/300"} alt={article.title} />
                       <div className="absolute top-4 left-4">
                           <span className="bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Tin mới</span>
                       </div>
                     </Link>
                     <div className="p-6 flex-1 flex flex-col">
                       <div className="flex items-center text-[10px] font-bold text-gray-400 mb-4 space-x-4 uppercase tracking-widest">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1.5"/> {article.date}</span>
                          <span className="flex items-center"><User className="h-3 w-3 mr-1.5"/> {article.author}</span>
                       </div>
                       <Link to={`/article/${article.id}`} className="block group-hover:text-green-700 transition-colors mb-4">
                          <h3 className="text-xl font-display font-bold text-gray-900 leading-tight line-clamp-2">
                              {article.title}
                          </h3>
                       </Link>
                       <p className="text-gray-600 text-sm line-clamp-3 mb-6 font-serif leading-relaxed">
                           {article.summary}
                       </p>
                       <div className="mt-auto pt-4 border-t border-gray-50">
                           <Link 
                                to={`/article/${article.id}`} 
                                className="inline-flex items-center text-xs font-black uppercase tracking-widest text-green-800 hover:text-yellow-600 transition-colors"
                           >
                               Đọc chi tiết bài viết <ArrowRight className="w-4 h-4 ml-2" />
                           </Link>
                       </div>
                     </div>
                   </article>
                 )) : (
                     <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                         <p className="text-gray-400 font-serif italic text-lg">Chưa có bài báo nào được cập nhật trên hệ thống.</p>
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
