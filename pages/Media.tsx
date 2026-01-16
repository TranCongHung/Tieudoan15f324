import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { MediaItem } from '../types';
import { Play, Music, Film, Calendar, X, Headphones } from 'lucide-react';
import { useSiteSettings } from '../context/SiteContext';

const Media: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    setMediaItems(storage.getMedia());
  }, []);

  const videos = mediaItems.filter(item => item.type === 'video');
  const audios = mediaItems.filter(item => item.type === 'audio');

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
        <div className="absolute inset-0">
          <img 
            src={settings.heroImage || "https://picsum.photos/1920/600?grayscale&blur=2&random=99"} 
            className="w-full h-full object-cover opacity-50" 
            alt="Media Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t to-transparent" style={{ '--tw-gradient-from': settings.primaryColor } as any}></div>
        </div>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-yellow-500 rounded-full animate-pulse">
                    <Film className="h-6 w-6" style={{ color: settings.primaryColor }} />
                </div>
                <span className="text-yellow-400 font-bold tracking-widest uppercase">Thư viện số</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase drop-shadow-lg">
                Truyền thông & Tư liệu
            </h1>
            <p className="mt-4 text-gray-300 max-w-2xl font-serif italic text-lg">
                Lưu giữ những thước phim lịch sử, những bài ca đi cùng năm tháng của người lính {settings.siteTitle}.
            </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-8">
                <button
                    onClick={() => setActiveTab('video')}
                    className={`py-4 px-6 flex items-center font-bold text-lg border-b-4 transition-all ${
                        activeTab === 'video' 
                        ? 'border-yellow-500' 
                        : 'border-transparent text-gray-500 hover:text-green-700'
                    }`}
                    style={activeTab === 'video' ? { color: settings.primaryColor } : {}}
                >
                    <Film className="w-5 h-5 mr-2" /> Video Hoạt động
                </button>
                <button
                    onClick={() => setActiveTab('audio')}
                    className={`py-4 px-6 flex items-center font-bold text-lg border-b-4 transition-all ${
                        activeTab === 'audio' 
                        ? 'border-yellow-500' 
                        : 'border-transparent text-gray-500 hover:text-green-700'
                    }`}
                    style={activeTab === 'audio' ? { color: settings.primaryColor } : {}}
                >
                    <Music className="w-5 h-5 mr-2" /> Âm thanh / Bài hát
                </button>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* VIDEO SECTION */}
        {activeTab === 'video' && (
            <div className="animate-fade-in-up">
                {videos.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Chưa có video nào được cập nhật.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map((video) => (
                            <div 
                                key={video.id} 
                                onClick={() => setSelectedVideo(video)}
                                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img 
                                        src={video.thumbnail || `https://img.youtube.com/vi/${video.url.split('/').pop()}/mqdefault.jpg`} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        Video
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <Calendar className="w-4 h-4 mr-1 text-yellow-500" />
                                        {video.date}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 line-clamp-2 mb-2 font-display">
                                        {video.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {video.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* AUDIO SECTION */}
        {activeTab === 'audio' && (
             <div className="animate-fade-in-up">
                {audios.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Chưa có bài hát nào được cập nhật.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {audios.map((audio) => (
                            <div key={audio.id} className="bg-white rounded-xl p-6 shadow-md border-l-4 flex items-center space-x-6 hover:shadow-lg transition-shadow" style={{ borderColor: settings.primaryColor }}>
                                <div className="flex-shrink-0 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center relative overflow-hidden group">
                                    <Headphones className="w-10 h-10 relative z-10" style={{ color: settings.primaryColor }} />
                                    <div className="absolute inset-0 bg-green-200 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 font-display">{audio.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{audio.description}</p>
                                    <div className="w-full bg-gray-100 rounded-full h-10 flex items-center px-2">
                                        <audio controls className="w-full h-8 bg-transparent">
                                            <source src={audio.url} type="audio/mpeg" />
                                            Trình duyệt không hỗ trợ thẻ audio.
                                        </audio>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-5xl bg-black rounded-lg shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-stone-900 text-white border-b border-stone-800">
                    <h3 className="font-bold truncate pr-4">{selectedVideo.title}</h3>
                    <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="relative pt-[56.25%] bg-black">
                     <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={selectedVideo.url} 
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="p-6 bg-stone-900 text-gray-300">
                    <p className="text-sm font-serif italic">{selectedVideo.description}</p>
                    <p className="text-xs text-stone-500 mt-2 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> Đăng ngày: {selectedVideo.date}
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Media;