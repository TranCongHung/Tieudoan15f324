import React, { useEffect, useState } from 'react';
import { Target, Users, Award, MapPin, Shield, Check } from 'lucide-react';
import { storage } from '../services/storage';
import { Leader } from '../types';
import { useSiteSettings } from '../context/SiteContext';

const About: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    setLeaders(storage.getLeaders());
  }, []);

  return (
    <div className="bg-stone-50 pb-12">
      {/* Banner */}
      <div className="relative h-96 overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
        <div className="absolute inset-0">
             <img src={settings.heroImage || "https://picsum.photos/1920/600?random=5"} className="w-full h-full object-cover" alt="Banner"/>
             <div className="absolute inset-0 opacity-80 mix-blend-multiply" style={{ backgroundColor: settings.primaryColor }}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-stone-50 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-10">
            <span className="font-bold tracking-widest uppercase mb-2" style={{ color: settings.secondaryColor }}>Thông tin đơn vị</span>
            <h1 className="text-5xl md:text-8xl font-display font-black text-white uppercase drop-shadow-lg mb-6">
                {settings.siteTitle}
            </h1>
            <p className="text-2xl text-white/90 font-light max-w-2xl border-l-4 pl-6 italic font-serif" style={{ borderColor: settings.secondaryColor }}>
                "Đoàn kết - Kỷ luật - Quyết thắng"
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Intro Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300" style={{ borderColor: settings.primaryColor, boxShadow: `0 20px 25px -5px ${settings.primaryColor}20` }}>
                <div className="p-4 rounded-full mb-6 bg-gray-100">
                    <Shield className="h-10 w-10" style={{ color: settings.primaryColor }}/>
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Nhiệm vụ chính trị</h3>
                <p className="text-gray-600 leading-relaxed">Huấn luyện, sẵn sàng chiến đấu, bảo vệ vững chắc Tổ quốc XHCN trong mọi tình huống.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300" style={{ borderColor: settings.secondaryColor, boxShadow: `0 20px 25px -5px ${settings.secondaryColor}20` }}>
                <div className="p-4 rounded-full mb-6 bg-gray-100">
                    <Users className="h-10 w-10" style={{ color: settings.secondaryColor }}/>
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Con người</h3>
                <p className="text-gray-600 leading-relaxed">Cán bộ, chiến sĩ có bản lĩnh chính trị vững vàng, kỹ thuật tinh thông, kỷ luật nghiêm minh.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 border-red-600 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300" style={{ boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.1)' }}>
                <div className="p-4 bg-red-100 rounded-full mb-6">
                    <Award className="h-10 w-10 text-red-600"/>
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Thành tích</h3>
                <p className="text-gray-600 leading-relaxed">Đơn vị Quyết thắng nhiều năm liền, lá cờ đầu trong phong trào thi đua Sư đoàn.</p>
            </div>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
                <h2 className="text-4xl font-display font-bold mb-8 relative inline-block" style={{ color: settings.primaryColor }}>
                    Chức năng & Nhiệm vụ
                    <span className="absolute bottom-0 left-0 w-1/2 h-2 opacity-50" style={{ backgroundColor: settings.secondaryColor }}></span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    {settings.siteTitle} có nhiệm vụ chính trị trung tâm là huấn luyện, sẵn sàng chiến đấu, và thực hiện các nhiệm vụ đột xuất như phòng chống thiên tai, tìm kiếm cứu nạn.
                </p>
                <div className="space-y-4">
                    <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-gray-100 p-1 rounded-full mr-4 flex-shrink-0 mt-1">
                            <Check className="h-4 w-4" style={{ color: settings.primaryColor }}/>
                        </div>
                        <span className="text-gray-800 font-medium">Huấn luyện chiến sĩ mới, nâng cao kỹ thuật, chiến thuật bộ binh, đảm bảo 100% nội dung đạt yêu cầu.</span>
                    </div>
                    <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-gray-100 p-1 rounded-full mr-4 flex-shrink-0 mt-1">
                             <Check className="h-4 w-4" style={{ color: settings.primaryColor }}/>
                        </div>
                        <span className="text-gray-800 font-medium">Duy trì nghiêm chế độ trực sẵn sàng chiến đấu, tuần tra canh gác, bảo vệ an ninh địa bàn đóng quân.</span>
                    </div>
                    <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-gray-100 p-1 rounded-full mr-4 flex-shrink-0 mt-1">
                             <Check className="h-4 w-4" style={{ color: settings.primaryColor }}/>
                        </div>
                        <span className="text-gray-800 font-medium">Tham gia công tác dân vận, giúp dân xóa đói giảm nghèo, chung sức xây dựng nông thôn mới.</span>
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 rounded-2xl transform rotate-3 opacity-20" style={{ backgroundColor: settings.secondaryColor }}></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img src="https://picsum.photos/800/600?random=20" alt="Soldiers training" className="w-full h-full object-cover"/>
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <p className="text-white font-bold text-lg">Huấn luyện bắn súng AK bài 1</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats / Highlights */}
        <div className="rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden mb-24" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, #000000)` }}>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: settings.secondaryColor }}></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="p-4 border-r border-white/20 last:border-0">
                    <div className="text-6xl font-display font-bold mb-4 drop-shadow-lg" style={{ color: settings.secondaryColor }}>10+</div>
                    <div className="text-green-100 text-lg uppercase tracking-wider font-medium">Năm Đơn vị Quyết thắng</div>
                </div>
                <div className="p-4 border-r border-white/20 last:border-0">
                    <div className="text-6xl font-display font-bold mb-4 drop-shadow-lg" style={{ color: settings.secondaryColor }}>100%</div>
                    <div className="text-green-100 text-lg uppercase tracking-wider font-medium">Hoàn thành nhiệm vụ</div>
                </div>
                 <div className="p-4">
                    <div className="text-6xl font-display font-bold mb-4 drop-shadow-lg" style={{ color: settings.secondaryColor }}>03</div>
                    <div className="text-green-100 text-lg uppercase tracking-wider font-medium">Địa bàn chiến lược</div>
                </div>
            </div>
        </div>

        {/* Leadership */}
        <div className="mb-12">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-display font-bold uppercase" style={{ color: settings.primaryColor }}>Ban Chỉ Huy Tiểu Đoàn</h2>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Những người lãnh đạo tận tâm, dạn dày kinh nghiệm, luôn đi đầu trong mọi nhiệm vụ.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {leaders.map((leader) => (
                    <div key={leader.id} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                        <div className="h-4" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})` }}></div>
                        <div className="p-8 text-center flex flex-col h-full">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1" style={{ background: `linear-gradient(to bottom, ${settings.secondaryColor}, #f59e0b)` }}>
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover rounded-full border-4 border-white"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors font-display min-h-[3.5rem] flex items-center justify-center">{leader.name}</h3>
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mt-2 mb-4">{leader.role}</p>
                            <div className="flex justify-center space-x-2 mt-auto">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default About;