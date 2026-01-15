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
    <div className="pb-12 bg-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[85vh] md:min-h-[750px] overflow-hidden group flex items-center">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[2s]"
            src="https://picsum.photos/1920/1080?grayscale&blur=2"
            alt="Hero Background"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-900/80 to-green-900/30"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-20 md:py-0">
          <div className="max-w-4xl animate-fade-in-up pl-4 border-l-4 md:border-l-8 border-yellow-500 py-6 md:py-10">
              <div className="inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-[10px] md:text-sm font-bold mb-4 md:mb-6 uppercase tracking-[0.15em] backdrop-blur-sm shadow-sm">
                <Star className="h-3 w-3 md:h-4 md:w-4 mr-2 fill-current" /> Đơn vị Anh hùng LLVTND
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black text-white mb-4 md:mb-6 leading-tight drop-shadow-2xl tracking-tight">
                Phát huy truyền thống <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600">Đoàn Ngự Bình</span>
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-xl text-gray-100 mb-8 md:mb-10 max-w-xl md:max-w-2xl font-light font-serif leading-relaxed text-justify-pretty opacity-90">
                Tiểu đoàn 15 quyết tâm hoàn thành xuất sắc mọi nhiệm vụ được giao, xứng danh Bộ đội Cụ Hồ thời kỳ mới. Sẵn sàng chiến đấu, hy sinh vì độc lập tự do của Tổ quốc.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/history"
                  className="w-full sm:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold rounded shadow-lg hover:shadow-yellow-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center uppercase tracking-wide text-sm"
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

      {/* Featured News - Negative Margin for overlap effect */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-8 md:-mt-16">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-12 mb-16 border border-gray-100">
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-10 pb-6 border-b border-gray-100 gap-4">
             <div>
                <span className="text-green-600 font-bold tracking-widest text-xs uppercase mb-2 block">Tin tức mới nhất</span>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-green-900 flex items-center">
                  Hoạt động & Sự kiện
                </h2>
             </div>
             <Link to="#" className="group flex items-center text-green-800 font-bold hover:text-green-600 transition-colors text-sm uppercase tracking-wider">
               Xem tất cả <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
             </Link>
           </div>

           <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
             {articles.map((article) => (
               <article key={article.id} className="group flex flex-col h-full bg-white hover:-translate-y-2 transition-transform duration-300 rounded-2xl">
                 <Link to={`/article/${article.id}`} className="flex-shrink-0 h-56 md:h-64 w-full relative overflow-hidden rounded-2xl shadow-md mb-5">
                   <img className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" src={article.imageUrl} alt={article.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                   <div className="absolute top-4 left-4 bg-white/90 text-green-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md">
                       Tin hoạt động
                   </div>
                 </Link>
                 <div className="flex-1 flex flex-col px-2">
                   <div className="flex items-center text-xs font-bold text-gray-400 mb-3 space-x-3 uppercase tracking-wide">
                      <span className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-yellow-600"/> {article.date}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center text-green-700"><User className="h-3 w-3 mr-1"/> {article.author}</span>
                   </div>
                   <Link to={`/article/${article.id}`} className="block mb-3">
                      <h3 className="text-lg md:text-xl font-display font-bold text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                          {article.title}
                      </h3>
                   </Link>
                   <p className="text-gray-500 line-clamp-3 leading-relaxed font-serif text-sm text-justify-pretty mb-4 flex-grow">
                       {article.summary}
                   </p>
                   <Link to={`/article/${article.id}`} className="inline-flex items-center text-green-700 font-bold text-xs uppercase tracking-widest border-b-2 border-transparent group-hover:border-green-700 transition-all pb-1 w-fit">
                       Đọc chi tiết
                   </Link>
                 </div>
               </article>
             ))}
           </div>
        </div>
      </div>
      
      {/* Quick Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-green-900 uppercase tracking-tight">Khám phá đơn vị</h2>
            <div className="w-16 h-1.5 bg-yellow-500 mx-auto mt-4 md:mt-6 rounded-full opacity-80"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Link to="/quiz" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=100" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Quiz"/>
                    <div className="absolute inset-0 bg-green-900/80 group-hover:bg-green-900/60 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent group-hover:border-yellow-500/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                        <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" fill="currentColor"/>
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Kiểm tra nhận thức</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Hệ thống trắc nghiệm kiến thức chính trị, quân sự, pháp luật.
                        </p>
                    </div>
                    <span className="text-yellow-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center">
                        Tham gia ngay <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>

             <Link to="/history" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=101" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="History"/>
                    <div className="absolute inset-0 bg-green-900/80 group-hover:bg-red-900/60 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent group-hover:border-yellow-500/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="font-display font-black text-2xl md:text-3xl text-yellow-400">60</div>
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Lịch sử truyền thống</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Hành trình vẻ vang "Trung dũng, kiên cường, liên tục tấn công".
                        </p>
                    </div>
                    <span className="text-yellow-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center">
                        Tìm hiểu <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>

             <Link to="/about" className="group relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/600/800?random=102" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="About"/>
                    <div className="absolute inset-0 bg-green-900/80 group-hover:bg-blue-900/60 transition-colors duration-500 mix-blend-multiply"></div>
                </div>
                <div className="relative h-full p-8 md:p-10 flex flex-col justify-between items-center text-center border-4 border-transparent group-hover:border-yellow-500/30 transition-all rounded-3xl">
                    <div className="bg-white/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                         <User className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 font-display tracking-wide">Giới thiệu đơn vị</h3>
                        <p className="text-green-100 text-xs md:text-sm font-light leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            Cơ cấu tổ chức, ban chỉ huy và các thành tích nổi bật.
                        </p>
                    </div>
                    <span className="text-yellow-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform flex items-center">
                        Chi tiết <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2"/>
                    </span>
                </div>
            </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;