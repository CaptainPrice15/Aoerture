import React, { useState } from 'react';
import { Maximize2, MapPin, Camera, Sparkles, Aperture, Play } from 'lucide-react';
import { getThumbnailUrl, getLqipUrl, isVideoSource } from '../utils/imagekit';

export const PhotoCard = ({ photo, onClick, onOpenExif }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  const thumbUrl = getThumbnailUrl(photo);
  const lqipUrl = getLqipUrl(photo);

  // Map aspect ratio string to CSS classes or style
  const getAspectClass = (ratio) => {
    switch (ratio) {
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

  return (
    <div
      className="group relative mb-6 break-inside-avoid rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* Aspect Ratio Container */}
      <div className={`relative w-full overflow-hidden ${getAspectClass(photo.aspectRatio)}`}>
        {/* 1. Low Quality Image Placeholder (Blur-up) */}
        <img
          src={lqipUrl}
          alt={photo.title}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 transition-opacity duration-700 pointer-events-none ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* 2. Optimized Thumbnail (via ImageKit CDN) */}
        <img
          src={thumbUrl}
          alt={photo.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Category & Video Pill Tag (top-left) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-zinc-950/70 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {photo.category}
          </span>
          {isVideo && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-purple-600/90 backdrop-blur-md text-white border border-purple-400/30 shadow-sm">
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Center Play Button Overlay for Videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600/80">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Featured Star (top-right) */}
        {photo.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/90 text-zinc-950 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </span>
          </div>
        )}

        {/* Hover Gradient Overlay & Info Bar */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
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
                {/* EXIF Quick Button */}
                <button
                  onClick={() => onOpenExif(photo)}
                  title={isVideo ? "View Video Details" : "View Camera EXIF Details"}
                  className="p-2 rounded-full bg-zinc-900/80 hover:bg-purple-600 text-zinc-200 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                >
                  <Aperture className="w-3.5 h-3.5" />
                </button>

                {/* Lightbox Expand / Play Button */}
                <button
                  onClick={onClick}
                  title={isVideo ? "Play Fullscreen" : "Fullscreen Preview"}
                  className="p-2 rounded-full bg-zinc-900/80 hover:bg-purple-600 text-zinc-200 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                >
                  {isVideo ? <Play className="w-3.5 h-3.5 fill-current" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Camera Preview Snippet */}
            {photo.exif && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-300 font-mono">
                <span className="truncate max-w-[150px]">{photo.exif.camera}</span>
                <span>{photo.exif.aperture} • {photo.exif.shutterSpeed}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
