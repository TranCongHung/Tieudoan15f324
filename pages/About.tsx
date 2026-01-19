
import React, { useEffect, useState } from 'react';
import { Target, Users, Award, MapPin, Shield, Check, TrendingUp, Clock, Star, ChevronRight, Calendar, Flag, Heart } from 'lucide-react';
import { apiService } from '../services/api';
import { Leader } from '../types';
import { useSiteSettings } from '../context/SiteContext';

const About: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [stats, setStats] = useState({
    yearsOfService: 0,
    totalPersonnel: 0,
    completedMissions: 0,
    awards: 0
  });
  const [isVisible, setIsVisible] = useState(false);
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

    // Animate stats on mount
    setTimeout(() => {
      setStats({
        yearsOfService: 30,
        totalPersonnel: 164,
        completedMissions: '500' as unknown as number,
        awards: 71
      });
      setIsVisible(true);
    }, 500);
  }, []);

  return (
    <div className="bg-gradient-to-br from-stone-50 to-stone-100 min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <img 
            src={settings.heroImage || "https://picsum.photos/1920/1080?random=5"} 
            className="w-full h-full object-cover transform scale-105 animate-pulse" 
            alt="Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-800/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
        </div>
        
        {/* Animated overlay elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-red-600 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 border-4 border-yellow-500 rounded-full opacity-20 animate-ping animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 pt-10">
          <div className="transform transition-all duration-1000 translate-y-0 opacity-100">
            <span className="font-bold tracking-widest uppercase mb-4 inline-block px-4 py-2 bg-red-600 text-white rounded-full text-sm animate-bounce">
              Thông tin đơn vị
            </span>
            <h1 className="text-6xl md:text-9xl font-display font-black text-white uppercase drop-shadow-2xl mb-6 leading-tight">
              {settings.siteTitle}
            </h1>
            <p className="text-2xl md:text-4xl text-stone-200 mb-8 font-light max-w-3xl">
              {settings.siteSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transform transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Lịch sử đơn vị
              </button>
              <button className="px-8 py-4 bg-stone-700 hover:bg-stone-800 text-white font-bold rounded-lg transform transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Sứ mệnh
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-display font-bold uppercase mb-4" style={{ color: settings.primaryColor }}>
            Số liệu ấn tượng
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những con số nói lên sự trưởng thành và phát triển của đơn vị qua các thời kỳ
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-t-4 border-red-600">
            <Clock className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {isVisible ? (
                <span className="counter">{stats.yearsOfService}+</span>
              ) : (
                <span>0</span>
              )}
            </div>
            <p className="text-gray-600 font-semibold">Năm xây dựng</p>
          </div>
          
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-t-4 border-green-600">
            <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {isVisible ? (
                <span className="counter">{stats.completedMissions}+</span>
              ) : (
                <span>0</span>
              )}
            </div>
            <p className="text-gray-600 font-semibold">Nhiệm vụ hoàn thành</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-t-4 border-purple-600">
            <Award className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {isVisible ? (
                <span className="counter">{stats.awards}+</span>
              ) : (
                <span>0</span>
              )}
            </div>
            <p className="text-gray-600 font-semibold">Phần thưởng cao quý</p>
          </div>
        </div>
      </div>

      {/* Enhanced Mission Cards */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-display font-bold uppercase mb-4" style={{ color: settings.primaryColor }}>
            Nhiệm vụ cốt lõi
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những nhiệm vụ trọng tâm mà đơn vị luôn tập trung thực hiện xuất sắc
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Shield className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display text-gray-900">Nhiệm vụ chính trị</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Huấn luyện, sẵn sàng chiến đấu, bảo vệ Tổ quốc, giữ vững ổn định chính trị.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">An ninh</span>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">Quốc phòng</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Users className="h-10 w-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display text-gray-900">Con người</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Cán bộ, chiến sĩ có bản lĩnh chính trị vững vàng, chuyên nghiệp nghiệp vụ.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-semibold">Chất lượng</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-semibold">Trình độ</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Award className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display text-gray-900">Thành tích</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Đơn vị Quyết thắng nhiều năm liền, nhiều cá nhân được khen thưởng cao quý.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">Xuất sắc</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">Dẫn đầu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Enhanced Leadership Section */}
        <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold uppercase mb-4" style={{ color: settings.primaryColor }}>
                Ban Chỉ Huy Tiểu Đoàn
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Đội ngũ cán bộ lãnh đạo, chỉ huy nòng cốt, tâm huyết với sự nghiệp của đơn vị
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {leaders.map((leader, index) => (
                    <div key={leader.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border border-gray-100">
                        {/* Gradient top bar */}
                        <div className="h-2" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})` }}></div>
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                        
                        <div className="relative p-5 text-center flex flex-col h-full">
                            <div className="relative mb-3">
                                <div className="w-28 h-28 mx-auto rounded-full p-1 transform transition-transform duration-300 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})` }}>
                                    <img 
                                      src={leader.image} 
                                      alt={leader.name} 
                                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                  {index + 1}
                                </div>
                            </div>
                            
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-white font-display mb-2 transition-colors duration-300 leading-tight">
                              {leader.name}
                            </h3>
                            
                            <p className="text-red-600 font-bold uppercase text-xs tracking-wider mb-2 group-hover:text-yellow-400 transition-colors duration-300 leading-tight">
                              {leader.role}
                            </p>
                            
                            <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold text-xs transform transition-all duration-300 hover:scale-105">
                                Xem hồ sơ
                              </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Timeline Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-display font-bold uppercase mb-4" style={{ color: settings.primaryColor }}>
              Lịch sử hình thành và phát triển
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những mốc son chói lọi trong quá trình xây dựng và trưởng thành của đơn vị
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-600 to-yellow-500"></div>
            
            <div className="space-y-12">
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: settings.primaryColor }}>1979</h3>
                    <h4 className="text-xl font-semibold mb-2">Thành lập đơn vị</h4>
                    <p className="text-gray-600">Tiểu đoàn 15 chính thức được thành lập, đặt nền móng cho sự phát triển vững mạnh.</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-xl z-10"></div>
                <div className="w-1/2 pl-8"></div>
              </div>
              
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-xl z-10"></div>
                <div className="w-1/2 pl-8">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: settings.secondaryColor }}>1995</h3>
                    <h4 className="text-xl font-semibold mb-2">Phong tặng danh hiệu</h4>
                    <p className="text-gray-600">Đơn vị được phong tặng danh hiệu Anh hùng Lực lượng vũ trang nhân dân.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: settings.primaryColor }}>2010</h3>
                    <h4 className="text-xl font-semibold mb-2">Hiện đại hóa</h4>
                    <p className="text-gray-600">Bắt đầu quá trình hiện đại hóa trang thiết bị, nâng cao năng lực chiến đấu.</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-xl z-10"></div>
                <div className="w-1/2 pl-8"></div>
              </div>
              
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-xl z-10"></div>
                <div className="w-1/2 pl-8">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: settings.secondaryColor }}>2024</h3>
                    <h4 className="text-xl font-semibold mb-2">Chuyển đổi số</h4>
                    <p className="text-gray-600">Đẩy mạnh ứng dụng công nghệ thông tin, xây dựng đơn vị kiểu mẫu.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default About;
