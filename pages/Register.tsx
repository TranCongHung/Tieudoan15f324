import React, { useState } from 'react';
import { useAuth, useNavigate, Link } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';
import { Shield, User, Mail, Award, Briefcase, Lock, X, ArrowRight, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rank: '',
    position: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.rank || !formData.position || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const success = register({
      ...formData,
      role: 'user' // Default role
    });

    if (success) {
      alert("Đăng ký thành công!");
      navigate('/');
    } else {
      setError('Gmail này đã được đăng ký.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
            src={settings.heroImage || "https://picsum.photos/1920/1080?grayscale&blur=2"} 
            className="w-full h-full object-cover" 
            alt="Background" 
        />
        <div 
             className="absolute inset-0 opacity-90 mix-blend-multiply"
             style={{ 
                 background: `linear-gradient(to bottom left, ${settings.primaryColor}, #111111)`
             }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg animate-scale-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            
            {/* Close Button */}
            <Link 
                to="/" 
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 z-20 group"
                title="Đóng / Quay về trang chủ"
            >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </Link>

            {/* Header */}
            <div className="p-8 text-center relative overflow-hidden" style={{ background: settings.secondaryColor }}>
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: settings.primaryColor }}></div>
                <div className="absolute top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-full shadow-lg mb-4 border-2" style={{ borderColor: settings.primaryColor }}>
                        <UserPlus className="h-10 w-10" style={{ color: settings.secondaryColor }} />
                    </div>
                    <h2 className="text-2xl font-display font-black uppercase tracking-wider" style={{ color: settings.primaryColor }}>
                        Đăng Ký Tài Khoản
                    </h2>
                    <p className="text-sm font-serif italic mt-1 font-bold" style={{ color: settings.primaryColor }}>
                        Trở thành thành viên {settings.siteTitle}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md text-sm text-red-700 font-medium">
                            {error}
                        </div>
                    )}
                    
                    {/* Name */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>Họ và tên</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 transition-colors" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                style={{ '--tw-ring-color': settings.secondaryColor } as any}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>Gmail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 transition-colors" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                style={{ '--tw-ring-color': settings.secondaryColor } as any}
                                placeholder="vidu@su324.vn"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Rank */}
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>Cấp bậc</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Award className="h-5 w-5 text-gray-400 transition-colors" />
                                </div>
                                <input
                                    id="rank"
                                    name="rank"
                                    type="text"
                                    required
                                    value={formData.rank}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                    style={{ '--tw-ring-color': settings.secondaryColor } as any}
                                    placeholder="Trung úy"
                                />
                            </div>
                        </div>

                        {/* Position */}
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>Chức vụ</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-gray-400 transition-colors" />
                                </div>
                                <input
                                    id="position"
                                    name="position"
                                    type="text"
                                    required
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                    style={{ '--tw-ring-color': settings.secondaryColor } as any}
                                    placeholder="Trung đội trưởng"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                style={{ '--tw-ring-color': settings.secondaryColor } as any}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all uppercase tracking-wide"
                            style={{ 
                                backgroundColor: settings.primaryColor,
                                color: '#ffffff'
                            }}
                        >
                            Hoàn tất đăng ký <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-bold hover:underline transition-colors" style={{ color: settings.primaryColor }}>
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        
        <p className="text-center text-white/60 text-xs mt-6 font-serif">
            &copy; {new Date().getFullYear()} {settings.siteTitle}.
        </p>
      </div>
    </div>
  );
};

export default Register;