import React, { useState, useRef } from 'react';
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

// Computes dynamic ambient glow color gradient based on category & tags
const getAmbientGlowColor = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('darjeeling') || cat.includes('sikkim') || cat.includes('nature')) {
    return 'from-emerald-500/30 via-teal-500/20 to-sky-500/30';
  }
  if (cat.includes('kedarnath') || cat.includes('badrinath')) {
    return 'from-amber-500/30 via-orange-500/25 to-rose-500/20';
  }
  if (cat.includes('haridwar')) {
    return 'from-indigo-500/30 via-purple-500/25 to-amber-500/20';
  }
  if (cat.includes('video')) {
    return 'from-purple-600/35 via-fuchsia-600/25 to-indigo-600/30';
  }
  return 'from-purple-500/30 via-indigo-500/25 to-fuchsia-500/20';
};

export const PhotoCard = ({
  photo,
  onClick,
  onOpenExif,
  onShare,
  onEdit,
  onDelete,
  layoutMode = 'masonry',
  isSelectMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const { isAuthenticated, user, isFavorite, toggleFavorite } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const lastTapRef = useRef(0);

  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  const thumbUrl = getThumbnailUrl(photo);
  const lqipUrl = getLqipUrl(photo);
  const favorited = isFavorite ? isFavorite(photo.id) : false;

  const handleCardClick = (e) => {
    if (isSelectMode) {
      e.stopPropagation();
      if (onToggleSelect) onToggleSelect(photo.id);
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      // Double tap/click detected: toggle favorite and trigger heart pop animation
      if (toggleFavorite) toggleFavorite(photo.id);
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    if (onClick) onClick();
  };

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
      <article className="group relative mb-12 sm:mb-16 transform-gpu">
        {/* Dynamic Ambient Glow Behind Card */}
        <div
          className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr ${getAmbientGlowColor(
            photo.category
          )} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none -z-10`}
        />

        <div
          className={`bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-8px_rgba(139,92,246,0.18)] ${
            isSelected
              ? 'ring-2 ring-purple-600 border-purple-500'
              : 'border-slate-200/90 dark:border-zinc-800/80 hover:border-purple-300 dark:hover:border-purple-500/40'
          }`}
        >
          <div
            className={`relative w-full overflow-hidden cursor-pointer ${getAspectClass()}`}
            onClick={handleCardClick}
          >
            {/* Shimmer Placeholder while loading */}
            {!isLoaded && <div className="animate-shimmer absolute inset-0 w-full h-full pointer-events-none" />}

            {!isLoaded && (
              <img
                src={lqipUrl}
                alt={photo.title}
                aria-hidden="true"
                className="protected-media absolute inset-0 w-full h-full object-cover filter blur-lg scale-105 pointer-events-none"
              />
            )}
            <img
              src={thumbUrl}
              alt={photo.title}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              className={`protected-media w-full h-full object-cover transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Double-tap heart pop animation */}
            {showHeartPop && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <Heart className="w-16 h-16 text-rose-500 fill-rose-500 animate-heart-pop drop-shadow-2xl" />
              </div>
            )}

            {/* Multi-Select Indicator Checkbox */}
            {isSelectMode && (
              <div
                className="absolute top-4 left-4 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleSelect) onToggleSelect(photo.id);
                }}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-lg transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-black/60 backdrop-blur-md border-white/40 text-transparent hover:border-white'
                  }`}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Badges Overlay */}
            {!isSelectMode && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 text-white border border-white/10 shadow-md">
                  {photo.category}
                </span>
                {isVideo && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/90 text-white border border-purple-400/30 shadow-md">
                    <Play className="w-3 h-3 fill-white" />
                    <span>Video</span>
                  </span>
                )}
                {photo.featured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    <span>Featured</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Editorial Content Breakdown */}
          <div className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white truncate">
                {photo.title}
              </h2>
              {photo.description && (
                <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {photo.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                {photo.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    {photo.location}
                  </span>
                )}
                {photo.exif?.camera && (
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-zinc-700/60">
                    {photo.exif.camera} • {photo.exif.aperture} • {photo.exif.shutterSpeed}
                  </span>
                )}
              </div>
            </div>

            {/* Editorial Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenExif(photo)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Aperture className="w-3.5 h-3.5 text-purple-600" />
                <span>Details</span>
              </button>
              <button
                onClick={onClick}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>
              {user?.role === 'admin' && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-zinc-800">
                  <button
                    onClick={handleEditClick}
                    title="Edit details (Admin)"
                    className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    title="Delete media (Admin)"
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // STANDARD MASONRY & UNIFORM GRID PRESENTATION
  return (
    <div className="group relative mb-4 sm:mb-6 break-inside-avoid transform-gpu select-none">
      {/* Dynamic Ambient Glow Behind Card */}
      <div
        className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-tr ${getAmbientGlowColor(
          photo.category
        )} opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-300 pointer-events-none -z-10`}
      />

      <div
        className={`relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border transition-all duration-200 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-6px_rgba(139,92,246,0.18)] cursor-pointer ${
          isSelected
            ? 'ring-2 ring-purple-600 border-purple-500 scale-[0.98]'
            : 'border-slate-200/90 dark:border-zinc-800/80 hover:border-purple-300 dark:hover:border-purple-500/40'
        }`}
        onClick={handleCardClick}
      >
        {/* Aspect Ratio Container */}
        <div className={`relative w-full overflow-hidden ${getAspectClass()}`}>
          {/* Anti-Press-and-Hold Shield for Guest Visitors */}
          {!isAuthenticated && (
            <div
              className="absolute inset-0 z-[6] select-none pointer-events-none"
              style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
              onContextMenu={(e) => e.preventDefault()}
              aria-hidden="true"
            />
          )}

          {/* Shimmer Placeholder while loading */}
          {!isLoaded && <div className="animate-shimmer absolute inset-0 w-full h-full pointer-events-none" />}

          {/* 1. Low Quality Image Placeholder */}
          {!isLoaded && (
            <img
              src={lqipUrl}
              alt={photo.title}
              aria-hidden="true"
              draggable="false"
              className="protected-media absolute inset-0 w-full h-full object-cover filter blur-lg scale-105 pointer-events-none select-none"
            />
          )}

          {/* 2. Optimized Thumbnail */}
          <img
            src={thumbUrl}
            alt={photo.title}
            loading="lazy"
            draggable="false"
            onLoad={() => setIsLoaded(true)}
            className={`protected-media w-full h-full object-cover transition-all duration-300 group-hover:scale-105 select-none pointer-events-none ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Double-Tap Heart Pop Animation */}
          {showHeartPop && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <Heart className="w-14 h-14 text-rose-500 fill-rose-500 animate-heart-pop drop-shadow-2xl" />
            </div>
          )}

          {/* Multi-Select Indicator Checkbox */}
          {isSelectMode && (
            <div
              className="absolute top-2.5 left-2.5 z-20"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(photo.id);
              }}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border shadow-lg transition-all ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-black/60 backdrop-blur-md border-white/40 text-transparent hover:border-white'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}

          {/* Category & Video Pill Tag (top-left) */}
          {!isSelectMode && (
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide bg-zinc-950/80 text-white border border-white/15 shadow-sm">
                {photo.category}
              </span>
              {isVideo && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide bg-purple-600/90 text-white border border-purple-400/30 shadow-sm">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>Video</span>
                </span>
              )}
            </div>
          )}

          {/* Center Play Button Overlay for Videos */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600/80">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Top-Right Badges & Actions */}
          <div
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {photo.featured && !isSelectMode && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500 text-zinc-950 shadow-md">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>Featured</span>
              </span>
            )}

            {/* Favorite Heart Button */}
            {!isSelectMode && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                title={favorited ? 'Favorited' : 'Add to Favorites'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-950/80 hover:bg-rose-500 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    favorited ? 'fill-rose-500 text-rose-500 group-hover:text-white' : ''
                  }`}
                />
              </button>
            )}

            {/* Quick Share Button */}
            {!isSelectMode && (
              <button
                type="button"
                onClick={handleShareClick}
                title="Share"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-950/80 hover:bg-purple-600 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Download Button */}
            {isAuthenticated && !isSelectMode && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                title={isVideo ? 'Download video' : 'Download photo'}
                aria-label={isVideo ? 'Download video' : 'Download photo'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-950/80 hover:bg-purple-600 active:bg-purple-700 text-white border border-white/15 shadow-md flex items-center justify-center transition-colors hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                ) : isDownloaded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Admin Edit & Delete Quick Buttons */}
            {user?.role === 'admin' && !isSelectMode && (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  title="Edit photo (Admin)"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600/90 hover:bg-purple-500 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  title="Delete photo (Admin)"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white border border-white/15 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Info Strip */}
          <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-7 flex items-end justify-between gap-2">
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
                className="w-7 h-7 rounded-full bg-black/70 active:bg-purple-600 text-zinc-200 active:text-white border border-white/15 flex items-center justify-center shadow-lg transition-transform active:scale-90"
              >
                <Aperture className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClick}
                aria-label="Fullscreen preview"
                className="w-7 h-7 rounded-full bg-black/70 active:bg-purple-600 text-zinc-200 active:text-white border border-white/15 flex items-center justify-center shadow-lg transition-transform active:scale-90"
              >
                {isVideo ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Desktop Hover Gradient Overlay & Info Bar */}
          <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col justify-end p-4">
            <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
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
                    className="p-2 rounded-full bg-black/70 hover:bg-purple-600 text-zinc-200 hover:text-white border border-white/15 transition-colors shadow-lg cursor-pointer"
                  >
                    <Aperture className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClick}
                    title="Fullscreen Preview"
                    className="p-2 rounded-full bg-black/70 hover:bg-purple-600 text-zinc-200 hover:text-white border border-white/15 transition-colors shadow-lg cursor-pointer"
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
    </div>
  );
};
