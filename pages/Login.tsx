
import React, { useState } from 'react';
import { useAuth, useNavigate, Link } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';
import { Shield, Lock, Mail, X, ArrowRight, User, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
        const success = await login(email, password);
        if (success) {
            const storedUser = localStorage.getItem('currentUser');
            const user = storedUser ? JSON.parse(storedUser) : null;
            if (user?.role === 'admin') navigate('/admin');
            else navigate('/');
        } else {
            setError('Tài khoản hoặc mật khẩu không chính xác.');
        }
    } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ dữ liệu.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0">
        <img src={settings.heroImage || "https://picsum.photos/1920/1080?grayscale&blur=2"} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 opacity-90 mix-blend-multiply" style={{ background: `linear-gradient(to bottom right, ${settings.primaryColor}, #000000)` }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <Link to="/" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 z-20 group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </Link>

            <div className="p-8 text-center relative overflow-hidden" style={{ background: settings.primaryColor }}>
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: settings.secondaryColor }}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-full shadow-lg mb-4 border-2" style={{ borderColor: settings.secondaryColor }}>
                        {settings.logoUrl ? <img src={settings.logoUrl} className="h-10 w-10 object-contain" alt="Logo" /> : <Shield className="h-10 w-10" style={{ color: settings.primaryColor }} fill="currentColor" fillOpacity={0.2} />}
                    </div>
                    <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">Đăng Nhập</h2>
                    <p className="text-white/80 text-sm font-serif italic mt-1">Cổng thông tin {settings.siteTitle}</p>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1" style={{ color: settings.primaryColor }}>Tài khoản / Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none text-sm font-medium" placeholder="Nhap email quan su..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1" style={{ color: settings.primaryColor }}>Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none text-sm font-medium" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white uppercase tracking-wide disabled:opacity-50" style={{ backgroundColor: settings.primaryColor }}>
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Đăng nhập hệ thống <ArrowRight className="ml-2 w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">Chưa có tài khoản?</span></div></div>
                    <div className="mt-6 flex justify-center">
                        <Link to="/register" className="flex items-center font-bold" style={{ color: settings.primaryColor }}><User className="w-4 h-4 mr-2" /> Đăng ký tài khoản mới</Link>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
