import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { Article, Comment } from '../types';
import { Calendar, User, ArrowLeft, Clock, Share2, Printer, Tag, MessageSquare, Send, LogIn } from 'lucide-react';
import { useAuth, useParams, Link, useNavigate } from '../context/AuthContext';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment States
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    // Simulate loading for smoother UX
    setLoading(true);
    window.scrollTo(0, 0);
    
    setTimeout(() => {
        const allArticles = storage.getArticles();
        const found = allArticles.find((a) => a.id === id);
        setArticle(found || null);

        if (found) {
            // Get related articles (exclude current one)
            setRelatedArticles(allArticles.filter(a => a.id !== id).slice(0, 3));
            // Get comments for this article
            setComments(storage.getComments(found.id));
        }
        setLoading(false);
    }, 300);
  }, [id]);

  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !article || !commentText.trim()) return;

      const newComment: Comment = {
          id: Date.now().toString(),
          articleId: article.id,
          userId: user.id,
          userName: user.name,
          userRank: user.rank,
          content: commentText.trim(),
          date: new Date().toISOString().split('T')[0] // Simple YYYY-MM-DD format
      };

      storage.addComment(newComment);
      setComments([...comments, newComment]);
      setCommentText('');
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-stone-50 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-800 rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
        <p className="text-gray-600 mb-8">Bài viết này có thể đã bị xóa hoặc đường dẫn không tồn tại.</p>
        <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center"
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Quay về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20">
      {/* Breadcrumb / Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
             <Link to="/" className="text-gray-500 hover:text-green-800 flex items-center text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Trang chủ
             </Link>
             <div className="flex items-center space-x-4">
                 <button className="text-gray-400 hover:text-green-800 transition-colors" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                 <button className="text-gray-400 hover:text-green-800 transition-colors" title="In bài viết" onClick={() => window.print()}><Printer className="w-4 h-4" /></button>
             </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Content (Left) */}
            <div className="w-full lg:w-2/3">
                <article className="animate-fade-in-up">
                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 font-medium">
                         <span className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 uppercase text-xs tracking-wider font-bold">
                            Tin tức
                         </span>
                         <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-yellow-500"/> {article.date}</span>
                         <span className="flex items-center"><User className="w-4 h-4 mr-1 text-yellow-500"/> {article.author}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-display font-black text-green-900 mb-8 leading-tight">
                        {article.title}
                    </h1>

                    {/* Summary (Sapo) */}
                    <div className="text-xl font-serif text-gray-700 italic border-l-4 border-yellow-500 pl-6 mb-10 leading-relaxed bg-yellow-50/50 py-4 pr-4 rounded-r-lg">
                        {article.summary}
                    </div>

                    {/* Featured Image */}
                    {article.imageUrl && (
                        <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover" />
                            <div className="bg-gray-100 p-2 text-center text-xs text-gray-500 italic">
                                Hình ảnh minh họa hoạt động
                            </div>
                        </div>
                    )}

                    {/* Body Content */}
                    <div 
                        className="prose prose-lg prose-stone max-w-none font-serif text-gray-800 leading-loose
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-green-900
                        prose-a:text-green-700 prose-a:font-bold hover:prose-a:text-green-900
                        prose-img:rounded-xl prose-img:shadow-md
                        prose-blockquote:border-l-green-700 prose-blockquote:text-green-800 prose-blockquote:bg-green-50 prose-blockquote:py-2 prose-blockquote:pr-4"
                        dangerouslySetInnerHTML={{ __html: article.content }} 
                    />

                    {/* Tags / Footer */}
                    <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-2">
                        <Tag className="w-5 h-5 text-gray-400 mr-2" />
                        {['Quân sự', 'Tiểu đoàn 15', 'Huấn luyện', 'Sư đoàn 324'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm cursor-pointer transition-colors">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </article>

                {/* --- COMMENT SECTION --- */}
                <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-display font-bold text-xl text-green-900 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2" /> Bình luận ({comments.length})
                        </h3>
                    </div>

                    <div className="p-6">
                        {/* Comment Form */}
                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Viết bình luận của đồng chí..."
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                                        required
                                    ></textarea>
                                    <div className="mt-2 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={!commentText.trim()}
                                            className="px-4 py-2 bg-green-700 text-white rounded-lg font-bold text-sm hover:bg-green-800 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4 mr-2" /> Gửi bình luận
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                             <div className="mb-10 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                 <p className="text-gray-700 mb-4">Vui lòng đăng nhập để tham gia thảo luận.</p>
                                 <Link to="/login" className="inline-flex items-center px-6 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 transition-colors">
                                     <LogIn className="w-4 h-4 mr-2"/> Đăng nhập ngay
                                 </Link>
                             </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                                            {comment.userName.charAt(0)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="bg-gray-50 p-4 rounded-r-2xl rounded-bl-2xl">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <span className="font-bold text-gray-900 text-sm mr-2">{comment.userName}</span>
                                                        {comment.userRank && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{comment.userRank}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">{comment.date}</span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 italic py-4">
                                    Chưa có bình luận nào. Hãy là người đầu tiên!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation (Next/Prev) Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-12 border-t border-gray-200">
                    <div className="group cursor-pointer">
                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Bài viết trước</div>
                        <div className="font-display font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                             ← Hội thi văn nghệ quần chúng năm 2023
                        </div>
                    </div>
                     <div className="group cursor-pointer text-right">
                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Bài viết tiếp theo</div>
                        <div className="font-display font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                             Kế hoạch trực sẵn sàng chiến đấu dịp Lễ →
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (Right) */}
            <div className="w-full lg:w-1/3 space-y-8">
                {/* Related News Widget */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-40">
                    <h3 className="text-xl font-bold font-display text-green-900 mb-6 pb-2 border-b-2 border-yellow-500 inline-block">
                        Tin liên quan
                    </h3>
                    <div className="space-y-6">
                        {relatedArticles.map((item) => (
                            <Link to={`/article/${item.id}`} key={item.id} className="group flex space-x-4 items-start">
                                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors line-clamp-3 text-sm leading-relaxed">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center text-xs text-gray-400 mt-2">
                                        <Clock className="w-3 h-3 mr-1" /> {item.date}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-sm text-gray-700 mb-4 uppercase">Tiêu điểm</h4>
                        <div className="relative rounded-lg overflow-hidden h-48 group cursor-pointer">
                             <img src="https://picsum.photos/400/300?random=88" className="w-full h-full object-cover" alt="Banner" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                 <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2">NỔI BẬT</span>
                                 <p className="text-white font-bold text-sm leading-tight group-hover:underline">Gương mặt trẻ tiêu biểu toàn quân năm 2024</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;