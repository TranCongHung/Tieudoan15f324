import React, { useState, memo } from 'react';
import { Heart, Calendar, Clock, BookOpen, Star, Eye } from 'lucide-react';
import { Milestone } from '../types';
import { useImageLazyLoading } from '../hooks/useLazyLoading';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  viewMode?: 'grid' | 'list';
  onSelect: (milestone: Milestone) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  hasRead?: boolean;
}

const MilestoneCard: React.FC<MilestoneCardProps> = memo(({
  milestone,
  index,
  viewMode = 'grid',
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  hasRead = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const { ref: imageRef, src: imageSrc, isLoaded, hasError } = useImageLazyLoading({
    src: milestone.image,
    placeholder: 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ELoading...%3C/text%3E%3C/svg%3E',
    rootMargin: '50px'
  });

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onSelect(milestone);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(milestone.id);
  };

  const cardClasses = `
    relative bg-white rounded-xl shadow-md overflow-hidden
    transition-all duration-300 cursor-pointer
    ${viewMode === 'grid' 
      ? 'hover:shadow-2xl hover:-translate-y-2' 
      : 'hover:shadow-lg hover:translate-x-2'
    }
    ${isPressed ? 'scale-95' : ''}
    ${hasRead ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
    interactive-card
  `;

  const animationDelay = index * 100;

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image Container */}
      <div className={`relative ${viewMode === 'grid' ? 'h-48' : 'h-24 w-24 flex-shrink-0'} overflow-hidden bg-stone-100`}>
        <img
          ref={imageRef}
          src={imageSrc}
          alt={milestone.title}
          className={`
            w-full h-full object-cover
            transition-all duration-500
            ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
            ${isHovered ? 'scale-105' : ''}
          `}
        />
        
        {/* Overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent animate-fade-in" />
        )}
        
        {/* Year Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
          <span className="text-sm font-bold text-stone-800">{milestone.year}</span>
        </div>
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`
              absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200
              ${isFavorite 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white/80 text-stone-600 hover:bg-white hover:scale-110'
              }
              button-press
            `}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
        
        {/* Read Indicator */}
        {hasRead && (
          <div className="absolute bottom-3 right-3 bg-green-500 text-white p-1.5 rounded-full">
            <Eye className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${viewMode === 'grid' ? '' : 'flex-grow'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-lg text-stone-800 mb-1 line-clamp-2 leading-tight">
              {milestone.title}
            </h3>
            <p className="text-sm text-stone-600 line-clamp-2 mb-3">
              {milestone.subtitle}
            </p>
          </div>
          
          {/* Quiz Indicator */}
          {milestone.quiz && milestone.quiz.length > 0 && (
            <div className="flex-shrink-0">
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                {milestone.quiz.length}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{milestone.year}</span>
            </div>
            {milestone.narrationAudio && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Audio</span>
              </div>
            )}
          </div>
          
          {viewMode === 'list' && (
            <button
              onClick={handleClick}
              className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors button-press"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      {isHovered && viewMode === 'grid' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent animate-fade-in" />
        </div>
      )}
    </div>
  );
});

MilestoneCard.displayName = 'MilestoneCard';

export default MilestoneCard;
