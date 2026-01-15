import React from 'react';
import { Target, Users, Award, MapPin, Shield, Check } from 'lucide-react';

const About: React.FC = () => {
  const leaders = [
    {
      name: "Thiếu tá Nguyễn Văn A",
      role: "Tiểu đoàn trưởng",
      image: "https://picsum.photos/200/200?random=10"
    },
    {
      name: "Đại úy Trần Văn B",
      role: "Chính trị viên",
      image: "https://picsum.photos/200/200?random=11"
    },
    {
      name: "Đại úy Lê Văn C",
      role: "Phó Tiểu đoàn trưởng",
      image: "https://picsum.photos/200/200?random=12"
    },
    {
      name: "Đại úy Phạm Văn D",
      role: "Phó Tiểu đoàn trưởng",
      image: "https://picsum.photos/200/200?random=13"
    }
  ];

  return (
    <div className="bg-stone-50 pb-12">
      {/* Banner */}
      <div className="relative h-96 bg-green-900 overflow-hidden">
        <div className="absolute inset-0">
             <img src="https://picsum.photos/1920/600?random=5" className="w-full h-full object-cover" alt="Banner"/>
             <div className="absolute inset-0 bg-green-900/80 mix-blend-multiply"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-stone-50 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-10">
            <span className="text-yellow-400 font-bold tracking-widest uppercase mb-2">Thông tin đơn vị</span>
            <h1 className="text-5xl md:text-8xl font-display font-black text-white uppercase drop-shadow-lg mb-6">
                Tiểu đoàn 15
            </h1>
            <p className="text-2xl text-white/90 font-light max-w-2xl border-l-4 border-yellow-500 pl-6 italic font-serif">
                "Đoàn kết - Kỷ luật - Quyết thắng"
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Intro Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white p-8 rounded-xl shadow-xl shadow-green-900/10 border-t-8 border-green-600 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-4 bg-green-100 rounded-full mb-6">
                    <Shield className="h-10 w-10 text-green-700"/>
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Nhiệm vụ chính trị</h3>
                <p className="text-gray-600 leading-relaxed">Huấn luyện, sẵn sàng chiến đấu, bảo vệ vững chắc Tổ quốc XHCN trong mọi tình huống.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl shadow-yellow-900/10 border-t-8 border-yellow-500 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                <div className="p-4 bg-yellow-100 rounded-full mb-6">
                    <Users className="h-10 w-10 text-yellow-600"/>
                </div>
                <h3 className="text-xl font-bold mb-3 font-display text-gray-900">Con người</h3>
                <p className="text-gray-600 leading-relaxed">Cán bộ, chiến sĩ có bản lĩnh chính trị vững vàng, kỹ thuật tinh thông, kỷ luật nghiêm minh.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl shadow-red-900/10 border-t-8 border-red-600 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
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
                <h2 className="text-4xl font-display font-bold text-green-900 mb-8 relative inline-block">
                    Chức năng & Nhiệm vụ
                    <span className="absolute bottom-0 left-0 w-1/2 h-2 bg-yellow-500 opacity-50"></span>
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                    Tiểu đoàn 15 là đơn vị trực thuộc Sư đoàn 324, Quân khu 4. Đơn vị có nhiệm vụ chính trị trung tâm là huấn luyện, sẵn sàng chiến đấu, và thực hiện các nhiệm vụ đột xuất như phòng chống thiên tai, tìm kiếm cứu nạn.
                </p>
                <div className="space-y-4">
                    <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-green-100 p-1 rounded-full mr-4 flex-shrink-0 mt-1">
                            <Check className="h-4 w-4 text-green-700"/>
                        </div>
                        <span className="text-gray-800 font-medium">Huấn luyện chiến sĩ mới, nâng cao kỹ thuật, chiến thuật bộ binh, đảm bảo 100% nội dung đạt yêu cầu.</span>
                    </div>
                    <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-green-100 p-1 rounded-full mr-4 flex-shrink-0 mt-1">
                             <Check className="h-4 w-4 text-green-700"/>
                        </div>
                        <span className="text-gray-800 font-medium">Duy trì nghiêm chế độ trực sẵn sàng chiến đấu, tuần tra canh gác, bảo vệ an ninh địa bàn đóng quân.</span>
                    </div>
                    <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="bg-green-100 p-1 rounded-full mr-4 flex-shrink-0 mt-1">
                             <Check className="h-4 w-4 text-green-700"/>
                        </div>
                        <span className="text-gray-800 font-medium">Tham gia công tác dân vận, giúp dân xóa đói giảm nghèo, chung sức xây dựng nông thôn mới.</span>
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 bg-yellow-400 rounded-2xl transform rotate-3 opacity-20"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img src="https://picsum.photos/800/600?random=20" alt="Soldiers training" className="w-full h-full object-cover"/>
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <p className="text-white font-bold text-lg">Huấn luyện bắn súng AK bài 1</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats / Highlights */}
        <div className="bg-gradient-to-r from-emerald-900 to-green-800 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden mb-24">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="p-4 border-r border-green-700/50 last:border-0">
                    <div className="text-6xl font-display font-bold mb-4 text-yellow-400 drop-shadow-lg">10+</div>
                    <div className="text-green-100 text-lg uppercase tracking-wider font-medium">Năm Đơn vị Quyết thắng</div>
                </div>
                <div className="p-4 border-r border-green-700/50 last:border-0">
                    <div className="text-6xl font-display font-bold mb-4 text-yellow-400 drop-shadow-lg">100%</div>
                    <div className="text-green-100 text-lg uppercase tracking-wider font-medium">Hoàn thành nhiệm vụ</div>
                </div>
                 <div className="p-4">
                    <div className="text-6xl font-display font-bold mb-4 text-yellow-400 drop-shadow-lg">03</div>
                    <div className="text-green-100 text-lg uppercase tracking-wider font-medium">Địa bàn chiến lược</div>
                </div>
            </div>
        </div>

        {/* Leadership */}
        <div className="mb-12">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-display font-bold text-green-900 uppercase">Ban Chỉ Huy Tiểu Đoàn</h2>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Những người lãnh đạo tận tâm, dạn dày kinh nghiệm, luôn đi đầu trong mọi nhiệm vụ.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {leaders.map((leader, index) => (
                    <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                        <div className="h-4 bg-gradient-to-r from-green-600 to-green-800"></div>
                        <div className="p-8 text-center flex flex-col h-full">
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-gradient-to-b from-yellow-400 to-yellow-600">
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