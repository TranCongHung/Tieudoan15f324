import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { Article } from '../types';
import { Calendar, User, ChevronRight, ArrowRight, Star } from 'lucide-react';
import { Link } from '../context/AuthContext';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles(storage.getArticles());
  }, []);

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover transform scale-105"
            src="https://picsum.photos/1920/1080?grayscale&blur=2"
            alt="Hero Background"
          />
          {/* Gradient Overlay using Palette #1E2F23 */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-900/80 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-sm font-bold mb-6 uppercase tracking-wider backdrop-blur-sm">
                <Star className="h-4 w-4 mr-2 fill-current" /> Đơn vị anh hùng lực lượng vũ trang
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-6 leading-tight drop-shadow-2xl">
                Phát huy truyền thống <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Đoàn Ngự Bình</span>
              </h1>
              <p className="mt-4 text-xl text-gray-200 mb-10 max-w-2xl font-light">
                Tiểu đoàn 15 quyết tâm hoàn thành xuất sắc mọi nhiệm vụ được giao, xứng danh Bộ đội Cụ Hồ thời kỳ mới. Sẵn sàng chiến đấu, hy sinh vì độc lập tự do của Tổ quốc.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/history"
                  className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold rounded-lg shadow-lg hover:shadow-yellow-500/30 transition-all transform hover:-translate-y-1 flex items-center"
                >
                  Tìm hiểu lịch sử <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
                <Link
                   to="/quiz"
                   className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-sm border border-white/30 transition-all flex items-center"
                >
                   Kiểm tra nhận thức
                </Link>
              </div>
          </div>
        </div>
      </div>

      {/* Featured News */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-16 border border-gray-100">
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
             <h2 className="text-2xl md:text-3xl font-display font-bold text-green-900 flex items-center">
               <span className="w-2 h-8 bg-yellow-500 mr-4 rounded-sm"></span>
               Tin tức - Sự kiện
             </h2>
             <Link to="#" className="group flex items-center text-green-700 font-bold hover:text-green-900 transition-colors">
               Xem tất cả <div className="ml-2 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors"><ChevronRight className="h-4 w-4"/></div>
             </Link>
           </div>

           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {articles.map((article) => (
               <article key={article.id} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                 <Link to={`/article/${article.id}`} className="flex-shrink-0 h-56 w-full relative overflow-hidden block">
                   <img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500" src={article.imageUrl} alt={article.title} />
                   <div className="absolute top-4 left-4 bg-green-900/90 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider backdrop-blur-md shadow-lg">
                       Tin hoạt động
                   </div>
                 </Link>
                 <div className="flex-1 p-6 flex flex-col justify-between relative">
                   <div className="flex-1">
                     <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-yellow-500"/> {article.date}</span>
                        <span className="flex items-center"><User className="h-4 w-4 mr-1 text-yellow-500"/> {article.author}</span>
                     </div>
                     <Link to={`/article/${article.id}`} className="block">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors font-display">
                            {article.title}
                        </h3>
                     </Link>
                     <p className="text-base text-gray-600 line-clamp-3 leading-relaxed">
                         {article.summary}
                     </p>
                   </div>
                   <div className="mt-6 pt-4 border-t border-gray-100">
                       <Link to={`/article/${article.id}`} className="text-green-600 font-bold text-sm flex items-center group-hover:translate-x-2 transition-transform cursor-pointer">
                           Đọc chi tiết <ArrowRight className="ml-1 h-4 w-4"/>
                       </Link>
                   </div>
                 </div>
               </article>
             ))}
           </div>
        </div>
      </div>
      
      {/* Quick Links Section - Reimagined */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-green-900 uppercase">Khám phá đơn vị</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/quiz" className="group relative h-64 rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/400?random=100" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Quiz"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 to-green-900/20 group-hover:from-green-900/95 transition-colors"></div>
                </div>
                <div className="relative h-full p-8 flex flex-col justify-end">
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:-translate-y-2 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1 font-display">Kiểm tra nhận thức</h3>
                    <p className="text-green-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Hệ thống trắc nghiệm kiến thức chính trị, quân sự trực tuyến.
                    </p>
                </div>
            </Link>

             <Link to="/history" className="group relative h-64 rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/400?random=101" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="History"/>
                    {/* Deep Red kept for History context, but blended with Green Palette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 to-green-900/20 group-hover:from-green-900/95 transition-colors"></div>
                </div>
                <div className="relative h-full p-8 flex flex-col justify-end">
                    <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:-translate-y-2 transition-transform">
                        <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1 font-display">Lịch sử truyền thống</h3>
                     <p className="text-yellow-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Hành trình vẻ vang của Sư đoàn 324 qua các thời kỳ.
                    </p>
                </div>
            </Link>

             <Link to="/about" className="group relative h-64 rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/400?random=102" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="About"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-green-700/90 to-green-700/20 group-hover:from-green-700/95 transition-colors"></div>
                </div>
                <div className="relative h-full p-8 flex flex-col justify-end">
                    <div className="bg-green-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:-translate-y-2 transition-transform">
                         <svg className="w-6 h-6 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1 font-display">Giới thiệu đơn vị</h3>
                     <p className="text-green-100 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Cơ cấu tổ chức, nhiệm vụ và thành tích của Tiểu đoàn.
                    </p>
                </div>
            </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;