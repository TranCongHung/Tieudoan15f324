
import React, { useEffect, useState } from 'react';
import { Target, Users, Award, MapPin, Shield, Check } from 'lucide-react';
import { apiService } from '../services/api';
import { Leader } from '../types';
import { useSiteSettings } from '../context/SiteContext';

const About: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await apiService.getLeaders();
            setLeaders(data);
        } catch (error) {
            console.error("Lỗi đồng bộ cán bộ:", error);
        }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-stone-50 pb-12">
      <div className="relative h-96 overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
        <div className="absolute inset-0">
             <img src={settings.heroImage || "https://picsum.photos/1920/600?random=5"} className="w-full h-full object-cover" alt="Banner"/>
             <div className="absolute inset-0 opacity-80 mix-blend-multiply" style={{ backgroundColor: settings.primaryColor }}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-stone-50 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 pt-10">
            <span className="font-bold tracking-widest uppercase mb-2" style={{ color: settings.secondaryColor }}>Thông tin đơn vị</span>
            <h1 className="text-5xl md:text-8xl font-display font-black text-white uppercase drop-shadow-lg mb-6">{settings.siteTitle}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 text-center" style={{ borderColor: settings.primaryColor }}>
                <Shield className="h-10 w-10 mx-auto mb-6" style={{ color: settings.primaryColor }}/>
                <h3 className="text-xl font-bold mb-3 font-display">Nhiệm vụ chính trị</h3>
                <p className="text-gray-600">Huấn luyện, sẵn sàng chiến đấu, bảo vệ Tổ quốc.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 text-center" style={{ borderColor: settings.secondaryColor }}>
                <Users className="h-10 w-10 mx-auto mb-6" style={{ color: settings.secondaryColor }}/>
                <h3 className="text-xl font-bold mb-3 font-display">Con người</h3>
                <p className="text-gray-600">Cán bộ, chiến sĩ có bản lĩnh chính trị vững vàng.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 border-red-600 text-center">
                <Award className="h-10 w-10 mx-auto mb-6 text-red-600"/>
                <h3 className="text-xl font-bold mb-3 font-display">Thành tích</h3>
                <p className="text-gray-600">Đơn vị Quyết thắng nhiều năm liền.</p>
            </div>
        </div>

        <div className="mb-12">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-display font-bold uppercase" style={{ color: settings.primaryColor }}>Ban Chỉ Huy Tiểu Đoàn</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {leaders.map((leader) => (
                    <div key={leader.id} className="bg-white rounded-2xl overflow-hidden shadow-xl group border border-gray-100">
                        <div className="h-4" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})` }}></div>
                        <div className="p-8 text-center flex flex-col h-full">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1" style={{ background: settings.secondaryColor }}>
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover rounded-full border-4 border-white"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 font-display min-h-[3.5rem] flex items-center justify-center">{leader.name}</h3>
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mt-2 mb-4">{leader.role}</p>
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
