import React, { useState } from 'react';
import { useAuth, useNavigate, Link } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';
import { Shield, Lock, Mail, X, ArrowRight, User } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@su324.vn');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect based on user role
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Lỗi hệ thống: ' + err.message);
    } finally {
      setLoading(false);
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
                background: `linear-gradient(to bottom right, ${settings.primaryColor}, #000000)`
            }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
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
            <div 
                className="p-8 text-center relative overflow-hidden"
                style={{ background: settings.primaryColor }}
            >
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: settings.secondaryColor }}></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-full shadow-lg mb-4 border-2" style={{ borderColor: settings.secondaryColor }}>
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} className="h-10 w-10 object-contain" alt="Logo" />
                        ) : (
                            <Shield className="h-10 w-10" style={{ color: settings.primaryColor }} fill="currentColor" fillOpacity={0.2} />
                        )}
                    </div>
                    <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">
                        Đăng Nhập
                    </h2>
                    <p className="text-white/80 text-sm font-serif italic mt-1">
                        Cổng thông tin {settings.siteTitle}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-pulse">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>
                                Tài khoản / Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm font-medium"
                                    style={{ '--tw-ring-color': settings.primaryColor } as any}
                                    placeholder="Nhap email quan su..."
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 transition-colors" style={{ color: settings.primaryColor }}>
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm font-medium"
                                    style={{ '--tw-ring-color': settings.primaryColor } as any}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 border-gray-300 rounded" style={{ color: settings.primaryColor }} />
                            <label htmlFor="remember-me" className="ml-2 block text-gray-600">Ghi nhớ</label>
                        </div>
                        <a href="#" className="font-medium hover:underline" style={{ color: settings.primaryColor }}>Quên mật khẩu?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all uppercase tracking-wide"
                        style={{ backgroundColor: settings.primaryColor }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12v8a8 8 0 4-4-4 4 0-4-4-4 4v-8"></path>
                                </svg>
                                <span>Đang đăng nhập...</span>
                            </>
                        ) : (
                            'Đăng nhập hệ thống <ArrowRight className="ml-2 w-4 h-4" />'
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Chưa có tài khoản?</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link to="/register" className="flex items-center font-bold transition-colors" style={{ color: settings.primaryColor }}>
                            <User className="w-4 h-4 mr-2" /> Đăng ký tài khoản mới
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        
        <p className="text-center text-white/60 text-xs mt-6 font-serif">
            &copy; {new Date().getFullYear()} {settings.siteTitle}. Bảo mật tuyệt đối.
        </p>
      </div>
    </div>
  );
};

export default Login;