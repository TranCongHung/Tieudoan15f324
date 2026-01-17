
import React, { useState, useEffect } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight, Award, Loader2, Calendar } from 'lucide-react';
import { useAuth, Link } from '../context/AuthContext';
import { apiService } from '../services/api';
import { QuizResult, Milestone } from '../types';
import { useSiteSettings } from '../context/SiteContext';

const History: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await apiService.getHistory();
            setMilestones(data);
        } catch (error) {
            console.error("Lỗi lấy lịch sử từ Supabase:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const getPages = (html: string) => {
    if (!html) return [];
    // Sử dụng thẻ <hr> làm điểm ngắt trang
    return html.split(/<hr\s*\/?>/i).filter(p => p.trim() !== '');
  };

  const textPages = selectedMilestone ? getPages(selectedMilestone.story) : [];
  const totalSpreads = 1 + Math.ceil(textPages.length / 2);

  if (loading) {
      return (
          <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-green-800" />
          </div>
      );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20">
       {/* Banner Lịch Sử */}
       <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
           <img src={settings.heroImage} className="absolute inset-0 w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center px-4 text-center">
               <h1 className="text-5xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-tighter mb-4">
                   Lịch Sử <br/> Sư Đoàn 324
               </h1>
               <div className="w-24 h-1 bg-yellow-500 rounded-full"></div>
               <p className="mt-6 text-xl text-yellow-100 font-serif italic max-w-2xl">
                   Hành trình 70 năm Đoàn Ngự Bình anh hùng (1955 - 2025)
               </p>
           </div>
       </div>

       {/* Timeline Dữ liệu từ Supabase */}
       <div className="max-w-7xl mx-auto px-4 py-24 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2 hidden md:block"></div>
          
          <div className="space-y-32">
              {milestones.length > 0 ? milestones.map((item, index) => (
                  <div key={item.id} className={`flex flex-col md:flex-row items-center relative ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                      {/* Node Timeline */}
                      <div className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 shadow-xl z-10 flex items-center justify-center font-black text-xl text-green-900 hidden md:flex" style={{ borderColor: settings.secondaryColor }}>
                          {item.year}
                      </div>

                      {/* Nội dung mốc lịch sử */}
                      <div className="w-full md:w-[45%]">
                          <div 
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden group cursor-pointer hover:-translate-y-4 transition-all duration-500 border border-gray-100"
                            onClick={() => {
                                setSelectedMilestone(item);
                                setCurrentSpread(0);
                            }}
                          >
                              <div className="h-64 relative overflow-hidden">
                                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="bg-yellow-500 text-green-900 px-6 py-2 rounded-full font-bold uppercase text-sm tracking-widest shadow-lg">Xem chi tiết</span>
                                  </div>
                              </div>
                              <div className="p-8">
                                  <div className="flex items-center text-xs font-bold text-yellow-600 uppercase tracking-widest mb-3">
                                      <Calendar className="w-4 h-4 mr-2" /> Năm {item.year}
                                  </div>
                                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">{item.title}</h3>
                                  <p className="text-gray-600 font-serif leading-relaxed line-clamp-3 italic">
                                      "{item.content}"
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              )) : (
                  <div className="text-center py-20 text-gray-400 font-serif italic">
                      Đang cập nhật biên niên sử...
                  </div>
              )}
          </div>
       </div>

       {/* Modal Đọc Sách */}
       {selectedMilestone && (
         <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 md:p-10 animate-fade-in overflow-hidden">
            <button onClick={() => setSelectedMilestone(null)} className="absolute top-6 right-6 text-white/50 hover:text-white z-[110] transition-colors">
                <X className="w-10 h-10" />
            </button>
            
            <div className="relative w-full max-w-7xl h-full md:h-auto md:aspect-[1.6/1] bg-[#fdfbf7] shadow-2xl flex flex-col md:flex-row overflow-hidden md:rounded-xl">
                {/* Gáy sách */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-16 -ml-8 bg-gradient-to-r from-transparent via-black/10 to-transparent z-20 pointer-events-none"></div>
                
                {/* Nội dung Trang Trái */}
                <div className="w-full md:w-1/2 h-full p-8 md:p-16 border-r border-gray-200 flex flex-col overflow-y-auto">
                    {currentSpread === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-center">
                            <img src={selectedMilestone.image} className="w-full max-h-64 object-cover rounded-lg shadow-lg mb-10 border-8 border-white" />
                            <h2 className="text-3xl md:text-5xl font-display font-black text-green-900 uppercase leading-tight mb-4">{selectedMilestone.title}</h2>
                            <div className="w-20 h-1.5 bg-yellow-500 mb-6"></div>
                            <p className="text-xl text-stone-600 font-serif italic">{selectedMilestone.subtitle}</p>
                        </div>
                    ) : (
                        <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose" 
                             dangerouslySetInnerHTML={{ __html: textPages[(currentSpread - 1) * 2 + 1] || '<p class="text-center opacity-30">Hết nội dung trang này</p>' }} />
                    )}
                    <div className="mt-auto pt-8 text-center text-gray-400 font-bold text-xs tracking-widest border-t border-gray-100">
                        {currentSpread === 0 ? 'TRANG TIÊU ĐỀ' : `TRANG ${(currentSpread - 1) * 2 + 1}`}
                    </div>
                </div>

                {/* Nội dung Trang Phải */}
                <div className="w-full md:w-1/2 h-full p-8 md:p-16 flex flex-col overflow-y-auto bg-[#faf8f4]">
                    {currentSpread === 0 ? (
                        <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose" 
                             dangerouslySetInnerHTML={{ __html: textPages[0] }} />
                    ) : (
                        <div className="prose prose-stone prose-lg max-w-none font-serif text-justify leading-loose" 
                             dangerouslySetInnerHTML={{ __html: textPages[(currentSpread - 1) * 2 + 2] || '<div class="h-full flex items-center justify-center opacity-20"><BookOpen className="w-20 h-20"/></div>' }} />
                    )}
                    <div className="mt-auto pt-8 text-center text-gray-400 font-bold text-xs tracking-widest border-t border-gray-100">
                        {currentSpread === 0 ? 'TRANG 1' : `TRANG ${(currentSpread - 1) * 2 + 2}`}
                    </div>
                </div>

                {/* Nút điều hướng */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-10 z-30 pointer-events-none">
                    <button 
                        disabled={currentSpread === 0}
                        onClick={() => setCurrentSpread(p => p - 1)}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-green-900 text-yellow-500 flex items-center justify-center shadow-2xl disabled:opacity-20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        disabled={currentSpread >= totalSpreads - 1}
                        onClick={() => setCurrentSpread(p => p + 1)}
                        className="pointer-events-auto w-12 h-12 rounded-full bg-green-900 text-yellow-500 flex items-center justify-center shadow-2xl disabled:opacity-20"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default History;
