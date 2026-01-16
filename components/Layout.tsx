import React from 'react';
import { Shield, Menu, X, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();

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
      {/* Header / Navbar - Use Dynamic Color from Settings */}
      <header 
          className="text-white shadow-xl sticky top-0 z-50 border-b-4"
          style={{ 
              background: settings.primaryColor || '#14532d', // Default green-900 if empty
              borderColor: settings.secondaryColor || '#eab308' // Default yellow-500 if empty
          }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                 <div 
                    className="absolute inset-0 blur-sm opacity-50 rounded-full group-hover:opacity-75 transition-opacity"
                    style={{ background: settings.secondaryColor || '#eab308' }}
                 ></div>
                 {settings.logoUrl ? (
                     <img src={settings.logoUrl} alt="Logo" className="relative h-12 w-12 object-contain drop-shadow-md"/>
                 ) : (
                     <Shield className="relative h-10 w-10 text-yellow-500 drop-shadow-md" style={{ color: settings.secondaryColor || '#eab308' }} />
                 )}
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl uppercase leading-none tracking-wide text-white group-hover:text-yellow-200 transition-colors">
                    {settings.siteTitle}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: settings.secondaryColor || '#eab308' }}>
                    {settings.siteSubtitle}
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-1 items-center">
              {navigation.map((item) => {
                const active = isActive(item.path);
                const activeStyle = active ? {
                    backgroundColor: settings.secondaryColor || '#eab308',
                    color: settings.primaryColor || '#14532d',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                } : {};
                
                return (
                    <Link
                      key={item.name}
                      to={item.path}
                      style={activeStyle}
                      className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                        active
                          ? 'transform -translate-y-0.5'
                          : 'text-gray-100 hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                );
              })}

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-bold uppercase bg-red-800 text-white hover:bg-red-700 shadow-md ml-4 border border-red-600"
                >
                  Admin
                </Link>
              )}

              <div className="h-8 w-px bg-white/20 mx-4"></div>

              {user ? (
                <div className="flex items-center space-x-4 bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4" style={{ color: settings.secondaryColor || '#eab308' }} />
                        <span className="text-sm font-medium text-white">{user.name}</span>
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
                 <Link 
                    to="/login" 
                    className="flex items-center space-x-2 bg-white/10 text-white px-5 py-2 rounded-full font-bold transition-all text-sm border hover:bg-white/20"
                    style={{ borderColor: settings.secondaryColor || '#eab308' }}
                 >
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
          <div 
             className="md:hidden absolute w-full z-50 shadow-xl border-t border-white/10"
             style={{ background: settings.primaryColor || '#14532d' }}
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navigation.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-base font-bold uppercase ${
                         active
                          ? 'text-green-900'
                          : 'text-gray-100 hover:bg-white/10'
                      }`}
                      style={active ? { backgroundColor: settings.secondaryColor || '#eab308' } : {}}
                    >
                      {item.name}
                    </Link>
                  );
              })}
              
              <div className="border-t border-white/10 my-4 pt-4">
                  {user ? (
                      <div className="space-y-3">
                        <div className="px-4 py-2 bg-black/20 rounded-lg text-white text-sm font-bold flex items-center">
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
                        className="block w-full text-center px-4 py-3 rounded-lg font-bold uppercase text-green-900"
                        style={{ backgroundColor: settings.secondaryColor || '#eab308' }}
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

      {/* Footer - Dynamic */}
      <footer 
          className="text-gray-300 relative border-t border-white/10"
          style={{ background: settings.primaryColor || '#14532d' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
                <div className="flex items-center space-x-3 mb-6">
                     {settings.logoUrl ? (
                         <img src={settings.logoUrl} alt="Logo" className="h-8 w-8 object-contain"/>
                     ) : (
                         <Shield className="h-8 w-8 text-yellow-500" style={{ color: settings.secondaryColor }} />
                     )}
                     <h3 className="text-white text-lg font-serif font-bold uppercase">{settings.siteTitle}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">
                Đơn vị chủ lực, cơ động, sẵn sàng chiến đấu cao. Luôn trung thành tuyệt đối với Đảng, Tổ quốc và Nhân dân. 
                Tiếp bước truyền thống "Đoàn Ngự Bình" anh hùng.
                </p>
            </div>
            <div>
                <h3 className="text-white text-lg font-bold mb-6 uppercase border-b border-white/20 pb-2 inline-block">Liên kết nhanh</h3>
                <ul className="space-y-3 text-sm">
                <li><Link to="/history" className="hover:text-yellow-500 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>Lịch sử truyền thống</Link></li>
                <li><Link to="/quiz" className="hover:text-yellow-500 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>Kiểm tra nhận thức</Link></li>
                <li><a href="#" className="hover:text-yellow-500 flex items-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>Báo Quân đội nhân dân</a></li>
                </ul>
            </div>
            <div>
                <h3 className="text-white text-lg font-bold mb-6 uppercase border-b border-white/20 pb-2 inline-block">Liên hệ công tác</h3>
                <p className="text-sm mb-3 flex items-center"><span className="text-green-500 mr-2">📍</span> {settings.contactAddress}</p>
                <p className="text-sm mb-3 flex items-center"><span className="text-green-500 mr-2">📧</span> {settings.contactEmail}</p>
                <p className="text-sm flex items-center"><span className="text-green-500 mr-2">📞</span> {settings.contactPhone}</p>
            </div>
            </div>
        </div>
        <div className="bg-black/20 py-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Cổng thông tin điện tử {settings.siteTitle}.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
