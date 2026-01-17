import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { supabase } from '../services/supabase';

// --- Router Context & Hooks (Replacement for react-router-dom) ---
const RouterContext = createContext<{
    path: string;
    navigate: (path: string) => void;
    params: Record<string, string>;
} | null>(null);

export const useRouter = () => {
    const context = useContext(RouterContext);
    if (!context) throw new Error("useRouter must be used within AuthProvider");
    return context;
};

export const useLocation = () => {
    const { path } = useRouter();
    return { pathname: path };
};

export const useNavigate = () => {
    const { navigate } = useRouter();
    return navigate;
};

export const useParams = <T extends Record<string, string | undefined> = {}>() => {
    const { params } = useRouter();
    return params as T;
};

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }> = ({ to, children, className, ...props }) => {
    const { navigate } = useRouter();
    return (
        <a 
            href={`#${to}`}
            onClick={(e) => {
                e.preventDefault();
                navigate(to);
                // Execute external onClick if provided (e.g., closing mobile menu)
                if (props.onClick) {
                    props.onClick(e);
                }
            }}
            className={className}
            {...props}
        >
            {children}
        </a>
    );
};

export const Navigate: React.FC<{ to: string, replace?: boolean }> = ({ to }) => {
    const { navigate } = useRouter();
    useEffect(() => {
        navigate(to);
    }, [to, navigate]);
    return null;
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (user: Omit<User, 'id'>) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Router State
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.slice(1);
      if (!hash) hash = '/';
      setPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
      // Basic route matching for Article Detail
      const articleMatch = path.match(/^\/article\/(.+)$/);
      if (articleMatch) {
          setParams({ id: articleMatch[1] });
      } else {
          setParams({});
      }
  }, [path]);

  const navigate = useCallback((newPath: string) => {
    window.location.hash = newPath;
    setPath(newPath);
  }, []);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          setUser(JSON.parse(storedUser));
        }
    } catch (e) {
        console.error("Failed to parse user from storage", e);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      setIsLoading(true);
      const result = await userService.login(email, pass);
      if (result) {
        // Remove password from stored user data for security
        const { password, ...userWithoutPassword } = result;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return { success: true, message: 'Đăng nhập thành công!' };
      }
      return { success: false, message: 'Đăng nhập thất bại' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Lỗi đăng nhập' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'>) => {
    try {
      setIsLoading(true);
      const result = await userService.createUser(userData);
      if (result) {
        return { success: true, message: 'Đăng ký thành công! Tài khoản của bạn đã được tạo.' };
      }
      return { success: false, message: 'Đăng ký thất bại' };
    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, message: error.message || 'Lỗi đăng ký' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/');
  };

  // Computed values
  const isAuthenticated = !!user;

  // Check for session expiration
  useEffect(() => {
    if (user) {
      const checkSession = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          logout();
        }
      };
      
      // Check session every 5 minutes
      const interval = setInterval(checkSession, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading,
      isAuthenticated 
    }}>
      <RouterContext.Provider value={{ path, navigate, params }}>
         {children}
      </RouterContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);