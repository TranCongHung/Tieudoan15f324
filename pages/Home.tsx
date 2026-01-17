
import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { apiService } from '../services/api';
import { Article } from '../types';
import { Calendar, User, ChevronRight, ArrowRight, Star, Loader2 } from 'lucide-react';
import { Link } from '../context/AuthContext';
=======
import { articleService } from '../services/api';
import { Article } from '../services/supabase';
import { Calendar, User, ChevronRight, ArrowRight, Star, LogOut } from 'lucide-react';
import { Link, useAuth } from '../context/AuthContext';
>>>>>>> 722ff39 (feat: Rebuild authentication system with enhanced security and user experience)
import { useSiteSettings } from '../context/SiteContext';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const { user, logout } = useAuth();

  useEffect(() => {
<<<<<<< HEAD
    const fetchData = async () => {
        setLoading(true);
        try {
            // Đồng bộ dữ liệu bài viết trực tiếp từ API/Database
            const data = await apiService.getArticles();
            setArticles(data);
        } catch (error) {
            console.error("Lỗi đồng bộ bài viết:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
=======
    const loadArticles = async () => {
      try {
        const data = await articleService.getAllArticles();
        setArticles(data);
      } catch (error) {
        console.error('Failed to load articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
>>>>>>> 722ff39 (feat: Rebuild authentication system with enhanced security and user experience)
  }, []);

  return (
    <div className="pb-12 bg-gray-50">
      {/* Hero Section - Dữ liệu lấy từ Settings trong Database */}
      <div className="relative min-h-[85vh] md:min-h-[750px] overflow-hidden group flex items-center">
        {/* User Welcome Bar */}
        {user && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Xin chào, <span className="font-bold" style={{ color: settings.primaryColor }}>{user.name}</span></p>
                  <p className="text-xs text-gray-500">{user.rank_name} - {user.position}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[2s]"
            src={settings.heroImage || "https://picsum.photos/1920/1080?grayscale&blur=2"}
            alt="Hero Background"
          />
          <div 
             className="absolute inset-0"
             style={{ 
                 background: `linear-gradient(to right, ${settings.primaryColor}F2, ${settings.primaryColor}CC, ${settings.primaryColor}4D)` 
             }}
          ></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-20 md:py-0">
          <div className="max-w-4xl animate-fade-in-up pl-4 border-l-4 md:border-l-8 py-6 md:py-10" style={{ borderColor: settings.secondaryColor }}>
              <div 
                className="inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold mb-4 md:mb-6 uppercase tracking-[0.15em] backdrop-blur-sm shadow-sm"
                style={{ 
                    backgroundColor: `${settings.secondaryColor}33`, 
                    color: settings.secondaryColor, 
                    borderColor: `${settings.secondaryColor}80`, 
                    borderWidth: '1px'
                }}
              >
                <Star className="h-3 w-3 md:h-4 md:w-4 mr-2 fill-current" /> Đơn vị Anh hùng LLVTND
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl tracking-tight">
                {settings.heroTitle || "Phát huy truyền thống Đoàn Ngự Bình"}
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-xl text-gray-100 mb-8 md:mb-10 max-w-xl md:max-w-2xl font-light font-serif leading-relaxed text-justify-pretty opacity-90">
                {settings.heroSubtitle || "Tiểu đoàn 15 quyết tâm hoàn thành xuất sắc mọi nhiệm vụ được giao, xứng danh Bộ đội Cụ Hồ thời kỳ mới."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/history"
                  className="w-full sm:w-auto px-8 py-4 font-bold rounded shadow-lg hover:shadow-yellow-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center uppercase tracking-wide text-sm"
                  style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}
                >
                  Tìm hiểu lịch sử <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
                <Link
                   to="/quiz"
                   className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded backdrop-blur-sm border border-white/30 transition-all flex items-center justify-center uppercase tracking-wide text-sm hover:border-white"
                 >
                   Kiểm tra nhận thức
                </Link>
              </div>
          </div>
        </div>
      </div>

      {/* Featured News - Dữ liệu lấy từ Articles trong Database */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-8 md:-mt-16">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-12 mb-16 border border-gray-100">
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-10 pb-6 border-b border-gray-100 gap-4">
             <div>
                <span className="font-bold tracking-widest text-xs uppercase mb-2 block" style={{ color: settings.primaryColor }}>Tin tức mới nhất</span>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-green-900 flex items-center">
                  Hoạt động & Sự kiện
                </h2>
             </div>
             <Link to="#" className="group flex items-center font-bold transition-colors text-sm uppercase tracking-wider" style={{ color: settings.primaryColor }}>
               Xem tất cả <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
             </Link>
           </div>

           {loading ? (
<<<<<<< HEAD
               <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                   <Loader2 className="w-10 h-10 animate-spin mb-4" />
                   <p className="font-serif italic">Đang đồng bộ dữ liệu từ đơn vị...</p>
               </div>
           ) : (
               <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                 {articles.length > 0 ? articles.map((article) => (
                   <article key={article.id} className="group flex flex-col h-full bg-white hover:-translate-y-2 transition-transform duration-300 rounded-2xl">
                     <Link to={`/article/${article.id}`} className="flex-shrink-0 h-56 md:h-64 w-full relative overflow-hidden rounded-2xl shadow-md mb-5">
                       <img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" src={article.imageUrl} alt={article.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                     </Link>
                     <div className="flex-1 flex flex-col px-2">
                       <div className="flex items-center text-xs font-bold text-gray-400 mb-3 space-x-3 uppercase tracking-wide">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-yellow-600"/> {article.date}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="flex items-center" style={{ color: settings.primaryColor }}><User className="h-3 w-3 mr-1"/> {article.author}</span>
                       </div>
                       <Link to={`/article/${article.id}`} className="block mb-3">
                          <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                              {article.title}
=======
             <div className="text-center py-8">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-t-2 border-gray-900"></div>
               <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
             </div>
           ) : (
             <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
               {articles.length > 0 ? (
                 articles.map((article) => (
                   <article key={article.id} className="group flex flex-col h-full bg-white hover:-translate-y-2 transition-transform duration-300 rounded-2xl">
                     <Link to={`/article/${article.id}`} className="flex-shrink-0 h-56 md:h-64 w-full relative overflow-hidden rounded-2xl shadow-md mb-5">
                       <img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" src={article.image_url || "https://picsum.photos/400/300?random=" + article.id} alt={article.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                       <div className="absolute top-4 left-4 bg-white/90 text-green-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md">
                           Tin hoạt động
                       </div>
                     </Link>
                     <div className="flex-1 flex flex-col px-2">
                       <div className="flex items-center text-xs font-bold text-gray-400 mb-3 space-x-3 uppercase tracking-wide">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-yellow-600"/> {article.date || 'N/A'}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="flex items-center" style={{ color: settings.primaryColor }}><User className="h-3 w-3 mr-1"/> {article.author || 'Admin'}</span>
                       </div>
                       <Link to={`/article/${article.id}`} className="block mb-3">
                          <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                             {article.title}
>>>>>>> 722ff39 (feat: Rebuild authentication system with enhanced security and user experience)
                          </h3>
                       </Link>
                       <p className="text-gray-500 line-clamp-3 leading-relaxed font-serif text-sm text-justify-pretty mb-4 flex-grow">
                           {article.summary}
                       </p>
                       <Link 
                          to={`/article/${article.id}`} 
                          className="inline-flex items-center font-bold text-xs uppercase tracking-widest border-b-2 border-transparent transition-all pb-1 w-fit"
                          style={{ color: settings.primaryColor, borderColor: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.primaryColor}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                       >
<<<<<<< HEAD
                           Đọc chi tiết
                       </Link>
                     </div>
                   </article>
                 )) : (
                     <div className="col-span-full py-20 text-center text-gray-400 font-serif italic border-2 border-dashed border-gray-100 rounded-xl">
                         Chưa có bài viết nào được đăng tải. Đồng chí vui lòng vào trang Quản trị để cập nhật.
                     </div>
                 )}
               </div>
=======
                          Đọc chi tiết
                       </Link>
                     </div>
                   </article>
                 ))
               ) : (
                 <div className="col-span-full text-center py-8">
                   <p className="text-gray-500">Chưa có bài viết nào.</p>
                   <Link 
                     to="/admin" 
                     className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                   >
                     Tạo bài viết đầu tiên
                   </Link>
                 </div>
               )}
             </div>
>>>>>>> 722ff39 (feat: Rebuild authentication system with enhanced security and user experience)
           )}
        </div>
      </div>
      
      {/* Các liên kết khám phá */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-green-900 uppercase tracking-tight">Cổng thông tin nghiệp vụ</h2>
            <div className="w-16 h-1.5 mx-auto mt-4 md:mt-6 rounded-full opacity-80" style={{ background: settings.secondaryColor }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Link to="/history" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=100" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Quiz"/>
                    <div className="absolute inset-0 transition-colors duration-500 mix-blend-multiply" style={{ background: `${settings.primaryColor}CC` }}></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent hover:border-white/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                        <Star className="w-6 h-6 md:w-8 md:h-8" style={{ color: settings.secondaryColor }} fill="currentColor"/>
                    </div>
                    <div>
<<<<<<< HEAD
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Kiểm tra nhận thức</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Ngân hàng đề thi chính trị, quân sự trực tuyến.
                        </p>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center" style={{ color: settings.secondaryColor }}>
                        Vào thi ngay <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>

             <Link to="/history" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=101" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="History"/>
                    <div className="absolute inset-0 bg-red-900/80 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent hover:border-white/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="font-display font-black text-2xl md:text-3xl" style={{ color: settings.secondaryColor }}>324</div>
                    </div>
                    <div>
=======
>>>>>>> 722ff39 (feat: Rebuild authentication system with enhanced security and user experience)
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Lịch sử truyền thống</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Hành trình 60 năm Đoàn Ngự Bình anh hùng.
                        </p>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center" style={{ color: settings.secondaryColor }}>
                        Tìm hiểu <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>

            <Link to="/quiz" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=101" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="History"/>
                    <div className="absolute inset-0 bg-red-900/80 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent hover:border-white/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="font-display font-black text-2xl md:text-3xl" style={{ color: settings.secondaryColor }}>60</div>
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Kiểm tra nhận thức</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Hệ thống trắc nghiệm kiến thức chính trị, quân sự, pháp luật.
                        </p>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center" style={{ color: settings.secondaryColor }}>
                        Tham gia ngay <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>

            <Link to="/about" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=102" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="About"/>
                    <div className="absolute inset-0 bg-blue-900/80 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent hover:border-white/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                         <User className="w-6 h-6 md:w-8 md:h-8" style={{ color: settings.secondaryColor }} />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Giới thiệu đơn vị</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Cơ cấu tổ chức và ban chỉ huy tiểu đoàn.
                        </p>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center" style={{ color: settings.secondaryColor }}>
                        Xem chi tiết <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;
