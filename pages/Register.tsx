import React, { useState } from 'react';
import { useAuth, useNavigate, Link } from '../context/AuthContext';
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
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            className="w-full h-full object-cover" 
            alt="Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-green-900/95 via-green-800/90 to-black/80 mix-blend-multiply"></div>
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
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-800"></div>
                <div className="absolute top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-full shadow-lg mb-4 border-2 border-green-800">
                        <UserPlus className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-green-900 uppercase tracking-wider">
                        Đăng Ký Tài Khoản
                    </h2>
                    <p className="text-green-900/80 text-sm font-serif italic mt-1 font-bold">
                        Trở thành thành viên Tiểu đoàn 15
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
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 group-focus-within:text-yellow-600">Họ và tên</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 group-focus-within:text-yellow-600">Gmail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                placeholder="vidu@su324.vn"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Rank */}
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 group-focus-within:text-yellow-600">Cấp bậc</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Award className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                                </div>
                                <input
                                    id="rank"
                                    name="rank"
                                    type="text"
                                    required
                                    value={formData.rank}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                    placeholder="Trung úy"
                                />
                            </div>
                        </div>

                        {/* Position */}
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 group-focus-within:text-yellow-600">Chức vụ</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                                </div>
                                <input
                                    id="position"
                                    name="position"
                                    type="text"
                                    required
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                    placeholder="Trung đội trưởng"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 group-focus-within:text-yellow-600">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-green-900 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transform hover:-translate-y-0.5 transition-all uppercase tracking-wide"
                        >
                            Hoàn tất đăng ký <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-bold text-green-700 hover:text-green-600 transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        
        <p className="text-center text-green-200/60 text-xs mt-6 font-serif">
            &copy; 2024 Tiểu đoàn 15 - Sư đoàn 324.
        </p>
      </div>
    </div>
  );
};

export default Register;