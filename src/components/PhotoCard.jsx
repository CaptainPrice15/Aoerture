import React, { useState } from 'react';
import {
  Maximize2,
  MapPin,
  Sparkles,
  Aperture,
  Play,
  Download,
  Loader2,
  Check,
  Heart,
  Share2,
  Edit3,
  Trash2
} from 'lucide-react';
import { getThumbnailUrl, getLqipUrl, isVideoSource, downloadMedia } from '../utils/imagekit';
import { useAuth } from '../context/AuthContext';

export const PhotoCard = ({ photo, onClick, onOpenExif, onShare, onEdit, onDelete, layoutMode = 'masonry' }) => {
  const { isAuthenticated, user, isFavorite, toggleFavorite } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  const thumbUrl = getThumbnailUrl(photo);
  const lqipUrl = getLqipUrl(photo);
  const favorited = isFavorite ? isFavorite(photo.id) : false;

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadMedia(photo);
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(photo.id);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onShare) onShare(photo);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(photo);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${photo.title}" from the showcase?`)) {
      if (onDelete) onDelete(photo.id);
    }
  };

  // Determine aspect ratio class depending on layout mode
  const getAspectClass = () => {
    if (layoutMode === 'grid') {
      return 'aspect-square';
    }
    if (layoutMode === 'editorial') {
      return 'aspect-[16/10] sm:aspect-[16/9]';
    }
    switch (photo.aspectRatio) {
      case '4/5':
        return 'aspect-[4/5]';
      case '3/2':
        return 'aspect-[3/2]';
      case '2/3':
        return 'aspect-[2/3]';
      case '16/9':
        return 'aspect-[16/9]';
      case '1/1':
        return 'aspect-square';
      default:
        return isVideo ? 'aspect-[16/9]' : 'aspect-[3/2]';
    }
  };

  // EDITORIAL LAYOUT PRESENTATION
  if (layoutMode === 'editorial') {
    return (
      <article className="group mb-12 sm:mb-16 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div
          className={`relative w-full overflow-hidden cursor-pointer ${getAspectClass()}`}
          onClick={onClick}
        >
          <img
            src={lqipUrl}
            alt={photo.title}
            aria-hidden="true"
            className={`protected-media absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 transition-opacity duration-700 pointer-events-none ${
              isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={thumbUrl}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            className={`protected-media w-full h-full object-cover transition-all duration-500 group-hover:scale-102 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-white border border-white/10 shadow-md">
              {photo.category}
            </span>
            {photo.featured && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-zinc-950 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Quick Corner Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleFavoriteClick}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className="w-9 h-9 rounded-full bg-zinc-950/80 hover:bg-rose-500 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500 group-hover:text-white' : ''}`} />
            </button>
            <button
              onClick={handleShareClick}
              title="Share photo"
              className="w-9 h-9 rounded-full bg-zinc-950/80 hover:bg-purple-600 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isAuthenticated && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download"
                className="w-9 h-9 rounded-full bg-zinc-950/80 hover:bg-purple-600 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all cursor-pointer"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin text-purple-300" /> : <Download className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Editorial Story & Meta Content */}
        <div className="p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h3
              onClick={onClick}
              className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {photo.title}
            </h3>
            {photo.description && (
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {photo.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {photo.location && (
                <span className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{photo.location}</span>
                </span>
              )}
              {photo.exif?.camera && (
                <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  {photo.exif.camera} • {photo.exif.aperture} • {photo.exif.shutterSpeed}
                </span>
              )}
            </div>
          </div>

          {/* Editorial Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenExif(photo)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-all"
            >
              <Aperture className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
            <button
              onClick={onClick}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </button>
            {user?.role === 'admin' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleEditClick}
                  title="Edit details (Admin)"
                  className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  title="Delete media (Admin)"
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // STANDARD MASONRY & UNIFORM GRID PRESENTATION
  return (
    <div
      className={`group relative mb-4 sm:mb-6 break-inside-avoid rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99] touch-manipulation transform-gpu cursor-pointer select-none`}
      onClick={onClick}
    >
      {/* Aspect Ratio Container */}
      <div className={`relative w-full overflow-hidden ${getAspectClass()}`}>
        {/* Anti-Press-and-Hold & Inspect Security Shield Overlay for Guest Visitors */}
        {!isAuthenticated && (
          <div
            className="absolute inset-0 z-[6] select-none pointer-events-none"
            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
            aria-hidden="true"
          />
        )}

        {/* 1. Low Quality Image Placeholder (Blur-up) */}
        <img
          src={lqipUrl}
          alt={photo.title}
          aria-hidden="true"
          draggable="false"
          className={`protected-media absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 transition-opacity duration-700 pointer-events-none select-none ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* 2. Optimized Thumbnail (via ImageKit CDN) */}
        <img
          src={thumbUrl}
          alt={photo.title}
          loading="lazy"
          draggable="false"
          onLoad={() => setIsLoaded(true)}
          className={`protected-media w-full h-full object-cover transition-all duration-500 group-hover:scale-105 select-none pointer-events-none ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Category & Video Pill Tag (top-left) */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex items-center gap-1.5">
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide bg-zinc-950/75 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {photo.category}
          </span>
          {isVideo && (
            <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide bg-purple-600/90 backdrop-blur-md text-white border border-purple-400/30 shadow-sm">
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Center Play Button Overlay for Videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600/80">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Top-Right Badges & Actions */}
        <div
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-amber-500/90 text-zinc-950 shadow-md">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Featured</span>
            </span>
          )}

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            title={favorited ? 'Favorited' : 'Add to Favorites'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-950/75 hover:bg-rose-500 active:scale-95 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-500 text-rose-500 group-hover:text-white' : ''}`} />
          </button>

          {/* Quick Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            title="Share"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-950/75 hover:bg-purple-600 active:scale-95 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Admin Download Button */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              title={isVideo ? 'Download video' : 'Download photo'}
              aria-label={isVideo ? 'Download video' : 'Download photo'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-950/75 hover:bg-purple-600 active:bg-purple-700 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group/dl cursor-pointer"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
              ) : isDownloaded ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5 transition-transform group-hover/dl:-translate-y-0.5" />
              )}
            </button>
          )}

          {/* Admin Edit & Delete Quick Buttons */}
          {user?.role === 'admin' && (
            <>
              <button
                type="button"
                onClick={handleEditClick}
                title="Edit photo (Admin)"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600/90 hover:bg-purple-500 active:scale-95 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                title="Delete photo (Admin)"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Info Strip */}
        <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-transparent p-2.5 pt-7 flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-xs tracking-tight drop-shadow-sm truncate flex items-center gap-1">
              {isVideo && <Play className="w-2.5 h-2.5 fill-purple-400 text-purple-400 shrink-0" />}
              <span className="truncate">{photo.title}</span>
            </h3>
            {photo.location && (
              <p className="text-zinc-300 text-[10px] flex items-center gap-1 mt-0.5 font-light truncate">
                <MapPin className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                <span className="truncate">{photo.location}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onOpenExif(photo)}
              aria-label="View EXIF details"
              className="w-7 h-7 rounded-full bg-zinc-900/80 active:bg-purple-600 text-zinc-200 active:text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              <Aperture className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClick}
              aria-label="Fullscreen preview"
              className="w-7 h-7 rounded-full bg-zinc-900/80 active:bg-purple-600 text-zinc-200 active:text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              {isVideo ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Desktop Hover Gradient Overlay & Info Bar */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex-col justify-end p-4">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-white font-semibold text-sm tracking-tight drop-shadow-sm flex items-center gap-1.5">
                  {isVideo && <Play className="w-3.5 h-3.5 fill-purple-400 text-purple-400 shrink-0" />}
                  <span>{photo.title}</span>
                </h3>
                {photo.location && (
                  <p className="text-zinc-300 text-xs flex items-center gap-1 mt-0.5 font-light">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span>{photo.location}</span>
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onOpenExif(photo)}
                  title="View EXIF Details"
                  className="p-2 rounded-full bg-zinc-900/80 hover:bg-purple-600 text-zinc-200 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg cursor-pointer"
                >
                  <Aperture className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClick}
                  title="Fullscreen Preview"
                  className="p-2 rounded-full bg-zinc-900/80 hover:bg-purple-600 text-zinc-200 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg cursor-pointer"
                >
                  {isVideo ? <Play className="w-3.5 h-3.5 fill-current" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Camera Preview Snippet */}
            {photo.exif && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-300 font-mono">
                <span className="truncate max-w-[150px]">{photo.exif.camera}</span>
                <span>
                  {photo.exif.aperture} • {photo.exif.shutterSpeed}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
