
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Article, Comment } from '../types';
import { Calendar, User, ArrowLeft, Clock, Share2, Printer, Tag, MessageSquare, Send, LogIn, ImageIcon } from 'lucide-react';
import { useAuth, useParams, Link, useNavigate } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteContext';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment States
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        window.scrollTo(0, 0);
        
        try {
            const allArticles = await apiService.getArticles();
            const found = allArticles.find((a) => a.id === id);
            
            if (found) {
                setArticle(found);
                setRelatedArticles(allArticles.filter(a => a.id !== id).slice(0, 3));
                const commentData = await apiService.getComments(found.id);
                setComments(commentData);
            }
        } catch (error) {
            console.error("Lỗi đồng bộ chi tiết bài viết:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !article || !commentText.trim()) return;

      const newComment: Comment = {
          id: Date.now().toString(),
          articleId: article.id,
          userId: user.id,
          userName: user.name,
          userRank: user.rank,
          content: commentText.trim(),
          date: new Date().toISOString().split('T')[0]
      };

      try {
          await apiService.addComment(newComment);
          setComments([...comments, newComment]);
          setCommentText('');
      } catch (e) {
          alert("Không thể gửi bình luận lúc này.");
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-200 rounded-full animate-spin" style={{ borderTopColor: settings.primaryColor }}></div>
          </div>
      );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-[#fdfbf7]">
        <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
        <p className="text-gray-600 mb-8 font-serif">Bài viết này có thể đã bị xóa hoặc đường dẫn không tồn tại.</p>
        <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 text-white rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center shadow-md"
            style={{ backgroundColor: settings.primaryColor }}
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Quay về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfaf7] min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
             <Link to="/" className="text-gray-500 hover:text-green-800 flex items-center text-sm font-bold uppercase tracking-wide transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Trang chủ
             </Link>
             <div className="flex items-center space-x-6">
                 <button className="text-gray-400 hover:text-green-800 transition-colors flex items-center text-xs font-bold uppercase tracking-wider"><Share2 className="w-4 h-4 mr-1" /> Chia sẻ</button>
                 <button className="text-gray-400 hover:text-green-800 transition-colors flex items-center text-xs font-bold uppercase tracking-wider" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" /> In bài</button>
             </div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-3/4">
                <article className="animate-fade-in-up bg-white p-8 md:p-12 shadow-sm rounded-none md:rounded-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})` }}></div>
                    <div className="mb-8">
                        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500 mb-6 font-bold uppercase tracking-widest">
                             <span className="bg-green-50 px-3 py-1 rounded-full border border-green-100" style={{ color: settings.primaryColor }}>Tin tức</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-yellow-600"/> {article.date}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                             <span className="flex items-center hidden sm:flex">Bởi <User className="w-3 h-3 mx-1" style={{ color: settings.primaryColor }}/> <span className="font-bold" style={{ color: settings.primaryColor }}>{article.author}</span></span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-2">
                            {article.title}
                        </h1>
                    </div>
                    {article.imageUrl && (
                        <div className="mb-10 -mx-8 md:-mx-12 md:rounded-lg overflow-hidden group relative">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            <div className="bg-gray-50 border-t border-gray-100 p-3 text-center">
                                <p className="text-xs text-gray-500 italic font-serif flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3 mr-1.5 opacity-70"/> Hình ảnh minh họa hoạt động của đơn vị
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="text-lg md:text-xl font-serif text-gray-800 leading-relaxed font-semibold mb-10 pl-6 border-l-4 italic" style={{ borderColor: settings.secondaryColor }}>
                        {article.summary}
                    </div>
                    <div className="prose prose-lg md:prose-xl prose-stone max-w-none font-serif text-gray-800"
                        style={{ '--tw-prose-headings': settings.primaryColor, '--tw-prose-links': settings.primaryColor, '--tw-prose-bold': settings.primaryColor } as any}
                        dangerouslySetInnerHTML={{ __html: article.content }} 
                    />
                    <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            <Tag className="w-4 h-4 mt-1" style={{ color: settings.primaryColor }} />
                            {['Quân sự', 'Tiểu đoàn 15', 'Huấn luyện', 'Sư đoàn 324'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-800 rounded text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="text-gray-400 italic font-serif text-sm">&copy; Bản quyền thuộc về {settings.siteTitle}</div>
                    </div>
                </article>
                <div className="mt-12">
                    <div className="flex items-center space-x-3 mb-8">
                        <MessageSquare className="w-6 h-6" style={{ color: settings.primaryColor }} />
                        <h3 className="font-display font-bold text-2xl text-green-900">Bình luận ({comments.length})</h3>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="mb-12 flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md" style={{ backgroundColor: settings.primaryColor }}>{user.name.charAt(0)}</div>
                                <div className="flex-grow relative">
                                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Viết bình luận của đồng chí..." rows={3} className="w-full border border-gray-300 rounded-lg p-4 pr-12 focus:ring-2 focus:ring-green-500 resize-none text-sm font-serif" required />
                                    <button type="submit" disabled={!commentText.trim()} className="absolute bottom-3 right-3 p-2 text-white rounded-md transition-colors shadow-sm disabled:opacity-50" style={{ backgroundColor: settings.primaryColor }}><Send className="w-4 h-4" /></button>
                                </div>
                            </form>
                        ) : (
                             <div className="mb-10 bg-yellow-50 border border-yellow-100 rounded-lg p-8 text-center">
                                 <p className="text-gray-800 mb-4 font-serif">Vui lòng đăng nhập để tham gia thảo luận cùng đơn vị.</p>
                                 <Link to="/login" className="inline-flex items-center px-6 py-2.5 text-white rounded font-bold shadow-lg" style={{ backgroundColor: settings.primaryColor }}><LogIn className="w-4 h-4 mr-2"/> Đăng nhập ngay</Link>
                             </div>
                        )}
                        <div className="space-y-8">
                            {comments.length > 0 ? comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-300 mt-1">{comment.userName.charAt(0)}</div>
                                    <div className="flex-grow">
                                        <div className="bg-gray-50 p-5 rounded-2xl rounded-tl-none border border-gray-100">
                                            <div className="flex justify-between items-baseline mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm">{comment.userName}</span>
                                                    {comment.userRank && <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-green-200">{comment.userRank}</span>}
                                                </div>
                                                <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {comment.date}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-serif">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <div className="text-center py-10 text-gray-400 italic font-serif">Chưa có bình luận nào.</div>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full lg:w-1/4 space-y-10">
                <div className="sticky top-40">
                    <h3 className="text-lg font-bold font-display text-green-900 mb-6 pb-2 border-b-2 inline-block uppercase tracking-wider" style={{ borderColor: settings.secondaryColor }}>Tin liên quan</h3>
                    <div className="space-y-6">
                        {relatedArticles.map((item) => (
                            <Link to={`/article/${item.id}`} key={item.id} className="group flex flex-col gap-2">
                                <div className="w-full h-32 rounded-lg overflow-hidden relative shadow-sm">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h4 className="font-bold text-gray-800 group-hover:text-green-700 line-clamp-2 text-sm leading-snug font-display">{item.title}</h4>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
