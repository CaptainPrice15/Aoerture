import React, { useState } from 'react';
import {
  X,
  Camera,
  Aperture,
  Clock,
  Zap,
  MapPin,
  Calendar,
  Tag,
  Layers,
  Share2,
  Check,
  Play,
  Download,
  Loader2,
  Heart,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { getThumbnailUrl, isVideoSource, downloadMedia } from '../utils/imagekit';
import { useAuth } from '../context/AuthContext';

export const ExifDrawer = ({
  photo,
  isOpen,
  onClose,
  onOpenLightbox,
  onShare,
  onEdit,
  onDelete
}) => {
  const { isAuthenticated, user, isFavorite, toggleFavorite } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen || !photo) return null;

  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  const favorited = isFavorite ? isFavorite(photo.id) : false;

  const handleShareClick = () => {
    if (onShare) {
      onShare(photo);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavoriteClick = () => {
    if (toggleFavorite) {
      toggleFavorite(photo.id);
    }
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

  const mapsUrl = photo.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(photo.location)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 transition-colors duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                <Aperture className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Media Details</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">EXIF & shot breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFavoriteClick}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                className="p-2 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Visual Thumbnail */}
            <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group shadow-inner">
              <img
                src={getThumbnailUrl(photo)}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={onOpenLightbox}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white gap-2 backdrop-blur-xs cursor-pointer"
              >
                <span>{isVideo ? 'Click to Play Video' : 'Click for Fullscreen'}</span>
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {photo.category}
                </span>
                {photo.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-zinc-950">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {photo.title}
              </h3>
              {photo.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                  {photo.description}
                </p>
              )}
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 min-w-0">
                <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-purple-600 dark:hover:text-purple-400 hover:underline flex items-center gap-1"
                    title="View on Google Maps"
                  >
                    <span className="truncate">{photo.location}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                  </a>
                ) : (
                  <span className="truncate">Undisclosed</span>
                )}
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
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {photo.exif.camera || 'Standard'}
                    </p>
                  </div>

                  {/* Lens */}
                  <div className="col-span-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      <span>Lens Optics</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {photo.exif.lens || 'Prime'}
                    </p>
                  </div>

                  {/* Aperture */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Aperture className="w-3.5 h-3.5 text-purple-500" />
                      <span>Aperture</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {photo.exif.aperture || 'Auto'}
                    </p>
                  </div>

                  {/* Shutter Speed */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>Shutter</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {photo.exif.shutterSpeed || 'Auto'}
                    </p>
                  </div>

                  {/* ISO */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Zap className="w-3.5 h-3.5 text-purple-500" />
                      <span>ISO</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {photo.exif.iso || '100'}
                    </p>
                  </div>

                  {/* Focal Length */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      <span>Focal Length</span>
                    </div>
                    <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {photo.exif.focalLength || '35mm'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Tags */}
            {Array.isArray(photo.tags) && photo.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Tags & Metadata
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                    >
                      <Tag className="w-3 h-3 text-purple-500" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Management Section */}
            {user?.role === 'admin' && (
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-2">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                  Admin Tools
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit && onEdit(photo)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Metadata</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${photo.title}"?`)) {
                        if (onDelete) onDelete(photo.id);
                        onClose();
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenLightbox}
              className="flex-1 min-w-[140px] py-3 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white shadow-lg shadow-purple-600/30 transition-all text-center cursor-pointer"
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
              onClick={handleShareClick}
              className="py-3 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-[0.98] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
