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
import { AuthProvider, useLocation, Navigate, useAuth } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { supabase } from './services/supabase';

function AppContent() {
    const { pathname } = useLocation();
    const { user } = useAuth();

    // Routes that require authentication
    const protectedRoutes = ['/quiz', '/article/'];
    
    // Check if current route requires authentication and user is not logged in
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (pathname === '/login') return <Login />;
    if (pathname === '/register') return <Register />;
    if (pathname === '/admin') return <AdminDashboard />;
    
    // Redirect to login if trying to access protected route without authentication
    if (isProtectedRoute && !user) {
        return <Navigate to="/login" />;
    }
    
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
        <SiteProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </SiteProvider>
    );
}

export default App;