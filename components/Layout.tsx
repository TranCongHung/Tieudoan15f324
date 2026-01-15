import React from 'react';
import { Shield, Menu, X, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Lịch sử', path: '/history' },
    { name: 'Kiểm tra nhận thức', path: '/quiz' },
    { name: 'Thư viện', path: '/media' },
    { name: 'Giới thiệu', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar - Gradient Background using Palette #1E2F23 and #34623F */}
      <header className="bg-gradient-to-r from-green-900 via-green-700 to-green-900 text-white shadow-xl sticky top-0 z-50 border-b-4 border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                 <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50 rounded-full group-hover:opacity-75 transition-opacity"></div>
                 <Shield className="relative h-10 w-10 text-yellow-500 drop-shadow-md" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl uppercase leading-none tracking-wide text-white group-hover:text-yellow-200 transition-colors">Tiểu đoàn 15</span>
                <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest mt-1">Sư đoàn 324 - Quân Khu 4</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-1 items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-yellow-500 text-green-900 shadow-lg transform -translate-y-0.5'
                      : 'text-gray-100 hover:bg-white/10 hover:text-yellow-500'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-bold uppercase bg-red-800 text-white hover:bg-red-700 shadow-md ml-4 border border-red-600"
                >
                  Admin
                </Link>
              )}

              <div className="h-8 w-px bg-green-500 mx-4"></div>

              {user ? (
                <div className="flex items-center space-x-4 bg-green-800/50 px-4 py-1.5 rounded-full border border-green-600">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-100">{user.name}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-gray-300 hover:text-white transition-colors"
                        title="Đăng xuất"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
              ) : (
                 <Link to="/login" className="flex items-center space-x-2 bg-white/10 text-white px-5 py-2 rounded-full font-bold hover:bg-yellow-500 hover:text-green-900 transition-all text-sm border border-yellow-500/30">
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                 </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-200 hover:text-white focus:outline-none p-2 bg-white/10 rounded-md"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-green-900 border-t border-green-700 absolute w-full z-50 shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-bold uppercase ${
                     isActive(item.path)
                      ? 'bg-yellow-500 text-green-900'
                      : 'text-gray-100 hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-green-700 my-4 pt-4">
                  {user ? (
                      <div className="space-y-3">
                        <div className="px-4 py-2 bg-green-800 rounded-lg text-yellow-500 text-sm font-bold flex items-center">
                            <UserIcon className="h-4 w-4 mr-2" /> {user.name}
                        </div>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg bg-red-900/50 text-red-200 hover:text-white flex items-center"
                        >
                            <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                        </button>
                      </div>
                  ) : (
                      <Link 
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-center px-4 py-3 rounded-lg bg-yellow-500 text-green-900 font-bold uppercase"
                      >
                          Đăng nhập
                      </Link>
                  )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-gray-300 relative border-t border-green-800">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-yellow-500 to-green-700"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
                <div className="flex items-center space-x-3 mb-6">
                     <Shield className="h-8 w-8 text-yellow-500" />
                     <h3 className="text-white text-lg font-serif font-bold uppercase">Tiểu đoàn 15</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">
                Đơn vị chủ lực, cơ động, sẵn sàng chiến đấu cao. Luôn trung thành tuyệt đối với Đảng, Tổ quốc và Nhân dân. 
                Tiếp bước truyền thống "Đoàn Ngự Bình" anh hùng.
                </p>
            </div>
            <div>
                <h3 className="text-white text-lg font-bold mb-6 uppercase border-b border-green-700 pb-2 inline-block">Liên kết nhanh</h3>
                <ul className="space-y-3 text-sm">
                <li><Link to="/history" className="hover:text-yellow-500 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>Lịch sử truyền thống</Link></li>
                <li><Link to="/quiz" className="hover:text-yellow-500 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>Kiểm tra nhận thức</Link></li>
                <li><a href="#" className="hover:text-yellow-500 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>Báo Quân đội nhân dân</a></li>
                </ul>
            </div>
            <div>
                <h3 className="text-white text-lg font-bold mb-6 uppercase border-b border-green-700 pb-2 inline-block">Liên hệ công tác</h3>
                <p className="text-sm mb-3 flex items-center"><span className="text-green-500 mr-2">📍</span> Quân khu 4, Nghệ An</p>
                <p className="text-sm mb-3 flex items-center"><span className="text-green-500 mr-2">📧</span> contact@su324.vn</p>
                <p className="text-sm flex items-center"><span className="text-green-500 mr-2">📞</span> 069.xxxx.xxx</p>
            </div>
            </div>
        </div>
        <div className="bg-black/20 py-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Cổng thông tin điện tử Tiểu đoàn 15 - Sư đoàn 324.
        </div>
      </footer>
    </div>
  );
};

export default Layout;