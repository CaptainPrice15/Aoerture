import React, { useState } from 'react';
import { X, Camera, Aperture, Clock, Zap, MapPin, Calendar, Tag, Layers, Share2, Check, Play, Download, Loader2 } from 'lucide-react';
import { getThumbnailUrl, isVideoSource, downloadMedia } from '../utils/imagekit';
import { useAuth } from '../context/AuthContext';

export const ExifDrawer = ({ photo, isOpen, onClose, onOpenLightbox }) => {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen || !photo) return null;

  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel (Desktop: right drawer, Mobile: bottom sheet) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:inset-y-0 sm:right-0 max-w-full flex sm:pl-10 z-50">
        <div className="w-full sm:w-screen sm:max-w-md max-h-[88vh] sm:max-h-full rounded-t-3xl sm:rounded-none bg-white dark:bg-zinc-950 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 select-none">
          {/* Mobile Bottom Sheet Pill Handle */}
          <div className="sm:hidden w-full pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Aperture className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                {isVideo ? 'Media & Technical Specs' : 'Camera & Shot Data'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
            {/* Image/Video Preview Thumbnail */}
            <div
              className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group aspect-[3/2] bg-zinc-100 dark:bg-zinc-900"
              onContextMenu={(e) => {
                if (!isAuthenticated) e.preventDefault();
              }}
            >
              <img
                src={getThumbnailUrl(photo)}
                alt={photo.title}
                draggable="false"
                className="protected-media w-full h-full object-cover select-none pointer-events-none"
              />
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              )}
              <button
                onClick={onOpenLightbox}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white gap-2 backdrop-blur-xs"
              >
                <span>{isVideo ? 'Click to Play Video' : 'Click for Fullscreen'}</span>
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
                {photo.category}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{photo.title}</h3>
              {photo.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  {photo.description}
                </p>
              )}
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="truncate">{photo.location || 'Undisclosed'}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{photo.date || 'Unknown'}</span>
              </div>
            </div>

            {/* Technical EXIF Grid */}
            {photo.exif ? (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Exposure Parameters
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Camera Body */}
                  <div className="col-span-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Camera className="w-3.5 h-3.5 text-purple-500" />
                      <span>Camera Body</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">{photo.exif.camera}</p>
                  </div>

                  {/* Lens */}
                  <div className="col-span-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      <span>Lens</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">{photo.exif.lens}</p>
                  </div>

                  {/* Aperture */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Aperture className="w-3.5 h-3.5 text-amber-500" />
                      <span>Aperture</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{photo.exif.aperture}</p>
                  </div>

                  {/* Shutter Speed */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Shutter</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{photo.exif.shutterSpeed}</p>
                  </div>

                  {/* ISO */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>ISO</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{photo.exif.iso}</p>
                  </div>

                  {/* Focal Length */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Layers className="w-3.5 h-3.5 text-pink-500" />
                      <span>Focal Length</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{photo.exif.focalLength}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No EXIF data recorded for this shot.</p>
            )}

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenLightbox}
              className="flex-1 min-w-[140px] py-3 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white shadow-lg shadow-purple-600/30 transition-all text-center"
            >
              {isVideo ? 'Play Fullscreen' : 'Open Fullscreen'}
            </button>
            {isAuthenticated && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                title={isVideo ? 'Download Video' : 'Download Photo'}
                className="py-3 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white active:scale-[0.98] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                ) : isDownloaded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloading ? 'Downloading...' : isDownloaded ? 'Saved' : 'Download'}</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="py-3 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-[0.98] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
