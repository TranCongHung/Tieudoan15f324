
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { MediaItem } from '../types';
import { Play, Music, Film, Calendar, X, Headphones } from 'lucide-react';
import { useSiteSettings } from '../context/SiteContext';

const Media: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const { settings } = useSiteSettings();

  // Lấy direct audio URL từ YouTube (chỉ audio stream)
  const getYouTubeAudioUrl = (url: string): string => {
    if (!url) return '';
    
    // Trích xuất video ID
    let videoId = '';
    
    // Format: https://youtu.be/VIDEO_ID
    const youtubeShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtubeShortMatch) {
      videoId = youtubeShortMatch[1];
    } else {
      // Format: https://www.youtube.com/watch?v=VIDEO_ID (với các parameters khác)
      const youtubeMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        videoId = youtubeMatch[1];
      }
    }
    
    if (!videoId) return url;
    
    // Sử dụng YouTube embed với autoplay và parameter để ẩn video
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&showinfo=0&modestbranding=1&fs=0`;
  };

  // Chuyển đổi URL YouTube sang embed format cho cả video và audio
  const getYouTubeEmbedUrl = (url: string, type: 'video' | 'audio' = 'video'): string => {
    if (!url) return '';
    
    // Nếu đã là embed URL thì giữ nguyên
    if (url.includes('/embed/')) return url;
    
    // Trích xuất video ID từ các format khác nhau
    let videoId = '';
    
    // Format: https://youtu.be/VIDEO_ID
    const youtubeShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (youtubeShortMatch) {
      videoId = youtubeShortMatch[1];
    } else {
      // Format: https://www.youtube.com/watch?v=VIDEO_ID (với các parameters khác)
      const youtubeMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        videoId = youtubeMatch[1];
      }
    }
    
    // Nếu không phải YouTube URL thì trả về url gốc (có thể là file upload)
    if (!videoId) return url;
    
    if (type === 'video') {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`;
    } else {
      // Sử dụng YouTube no-cookie embed với audio-focused parameters
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&mute=0&loop=1&playlist=${videoId}&showinfo=0&modestbranding=1`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await apiService.getMedia();
            setMediaItems(data);
        } catch (error) {
            console.error("Lỗi đồng bộ thư viện:", error);
        }
    };
    fetchData();
  }, []);

  const videos = mediaItems.filter(item => item.type === 'video');
  const audios = mediaItems.filter(item => item.type === 'audio');

  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <div className="relative h-80 overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
        <div className="absolute inset-0">
          <img src={settings.heroImage || "https://picsum.photos/1920/600?grayscale&blur=2&random=99"} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t to-transparent" style={{ '--tw-gradient-from': settings.primaryColor } as any}></div>
        </div>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase drop-shadow-lg">Truyền thông & Tư liệu</h1>
        </div>
      </div>

      <div className="sticky top-20 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-8">
            <button onClick={() => setActiveTab('video')} className={`py-4 px-6 flex items-center font-bold text-lg border-b-4 transition-all ${activeTab === 'video' ? 'border-yellow-500' : 'border-transparent text-gray-500'}`} style={activeTab === 'video' ? { color: settings.primaryColor } : {}}><Film className="w-5 h-5 mr-2" /> Video</button>
            <button onClick={() => setActiveTab('audio')} className={`py-4 px-6 flex items-center font-bold text-lg border-b-4 transition-all ${activeTab === 'audio' ? 'border-yellow-500' : 'border-transparent text-gray-500'}`} style={activeTab === 'audio' ? { color: settings.primaryColor } : {}}><Music className="w-5 h-5 mr-2" /> Âm thanh</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                    <div key={video.id} onClick={() => setSelectedVideo(video)} className="group bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer transform hover:-translate-y-1">
                        <div className="relative h-56 overflow-hidden">
                            <img src={video.thumbnail || `https://img.youtube.com/vi/${video.url.split('/').pop()}/mqdefault.jpg`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"><Play className="w-8 h-8 text-white ml-1" fill="currentColor" /></div></div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 font-display line-clamp-2">{video.title}</h3>
                            <p className="text-gray-500 text-xs mt-2">{video.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'audio' && (
            <div className="space-y-4">
                {audios.map((audio) => (
                    <div key={audio.id} className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{ borderColor: settings.primaryColor }}>
                        <div className="flex items-center space-x-4">
                            <Headphones className="w-8 h-8" style={{ color: settings.primaryColor }} />
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 font-display">{audio.title}</h3>
                                <p className="text-gray-500 text-xs">{audio.date}</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            {audio.url.includes('youtube.com') || audio.url.includes('youtu.be') ? (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">🎵 YouTube Audio</span>
                                        <button 
                                            onClick={() => {
                                                const audioUrl = getYouTubeAudioUrl(audio.url);
                                                window.open(audioUrl, '_blank');
                                            }}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                        >
                                            Mở Audio
                                        </button>
                                    </div>
                                    <div className="relative" style={{ paddingBottom: '25%' }}>
                                        <iframe 
                                            className="absolute inset-0 w-full h-full rounded-lg"
                                            src={getYouTubeEmbedUrl(audio.url, 'audio')} 
                                            title={audio.title}
                                            allowFullScreen
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
                                        ></iframe>
                                    </div>
                                </div>
                            ) : (
                                <audio controls className="w-full h-10">
                                    <source src={audio.url} type="audio/mpeg" />
                                    <source src={audio.url} type="audio/wav" />
                                    <source src={audio.url} type="audio/ogg" />
                                    <source src={audio.url} type="audio/mp4" />
                                </audio>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-5xl bg-black rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-stone-900 text-white"><h3 className="font-bold truncate">{selectedVideo.title}</h3><button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button></div>
                <div className="relative pt-[56.25%]"><iframe className="absolute inset-0 w-full h-full" src={getYouTubeEmbedUrl(selectedVideo.url)} title={selectedVideo.title} allowFullScreen></iframe></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Media;
