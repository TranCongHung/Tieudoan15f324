import React from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Quiz from './pages/Quiz';
import About from './pages/About';
import Media from './pages/Media';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleDetail from './pages/ArticleDetail';
import { AuthProvider, useLocation, Navigate } from './context/AuthContext';

function AppContent() {
    const { pathname } = useLocation();

    if (pathname === '/login') return <Login />;
    if (pathname === '/register') return <Register />;
    if (pathname === '/admin') return <AdminDashboard />;
    
    if (pathname === '/' || pathname === '') return <Layout><Home /></Layout>;
    if (pathname === '/history') return <Layout><History /></Layout>;
    if (pathname === '/quiz') return <Layout><Quiz /></Layout>;
    if (pathname === '/about') return <Layout><About /></Layout>;
    if (pathname === '/media') return <Layout><Media /></Layout>;
    if (pathname.startsWith('/article/')) return <Layout><ArticleDetail /></Layout>;

    return <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;