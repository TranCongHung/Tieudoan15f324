
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

// --- Router Context & Hooks ---
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
                if (props.onClick) props.onClick(e);
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
  login: (email: string, pass: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
      const articleMatch = path.match(/^\/article\/(.+)$/);
      if (articleMatch) setParams({ id: articleMatch[1] });
      else setParams({});
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
        localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const found = await apiService.login(email, pass);
    if (found) {
      setUser(found);
      localStorage.setItem('currentUser', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: Date.now().toString() };
    const success = await apiService.register(newUser);
    if (success) {
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      <RouterContext.Provider value={{ path, navigate, params }}>
         {children}
      </RouterContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
