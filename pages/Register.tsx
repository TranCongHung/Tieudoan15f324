
import React, { useState } from 'react';
import { useAuth, useNavigate, Link } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';
import { Shield, User, Mail, Award, Briefcase, Lock, X, ArrowRight, UserPlus, Loader2 } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', rank: '', position: '', unit: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
        const success = await register({
          name: formData.name,
          email: formData.email,
          rank: formData.rank,
          position: formData.position,
          unit: formData.unit,
          password: formData.password,
          role: 'user'
        });

        if (success) {
          alert("Đăng ký thành công!");
          navigate('/');
        } else {
          setError('Email này đã tồn tại hoặc có lỗi trong quá trình đăng ký.');
        }
    } catch (err: any) {
        setError(err.message || 'Lỗi hệ thống.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0">
        <img src={settings.heroImage || "https://picsum.photos/1920/1080?grayscale&blur=2"} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 opacity-90 mix-blend-multiply" style={{ background: `linear-gradient(to bottom left, ${settings.primaryColor}, #111111)` }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-scale-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <Link to="/" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full z-20 group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </Link>

            <div className="p-8 text-center relative overflow-hidden" style={{ background: settings.secondaryColor }}>
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: settings.primaryColor }}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-full shadow-lg mb-4 border-2" style={{ borderColor: settings.primaryColor }}>
                        <UserPlus className="h-10 w-10" style={{ color: settings.secondaryColor }} />
                    </div>
                    <h2 className="text-2xl font-display font-black uppercase tracking-wider" style={{ color: settings.primaryColor }}>Đăng Ký Tài Khoản</h2>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 font-medium">{error}</div>}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1" style={{ color: settings.primaryColor }}>Họ và tên</label>
                            <input name="name" type="text" required value={formData.name} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Nguyễn Văn A" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1" style={{ color: settings.primaryColor }}>Email quân sự</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-sm" placeholder="vidu@su324.vn" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1" style={{ color: settings.primaryColor }}>Cấp bậc</label>
                                <input name="rank" type="text" required value={formData.rank} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Trung úy" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1" style={{ color: settings.primaryColor }}>Chức vụ</label>
                                <input name="position" type="text" required value={formData.position} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Trung đội trưởng" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1" style={{ color: settings.primaryColor }}>Đơn vị</label>
                            <input name="unit" type="text" required value={formData.unit} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-sm" placeholder="Đại đội 1 - Tiểu đoàn 15" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1" style={{ color: settings.primaryColor }}>Mật khẩu</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none text-sm" placeholder="••••••••" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white uppercase tracking-wide disabled:opacity-50" style={{ backgroundColor: settings.primaryColor }}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Hoàn tất đăng ký <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center"><p className="text-sm text-gray-600">Đã có tài khoản? <Link to="/login" className="font-bold hover:underline" style={{ color: settings.primaryColor }}>Đăng nhập ngay</Link></p></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
