import React, { useEffect, useRef } from 'react';
import { PhotoCard } from './PhotoCard';
import { ImageOff, RotateCcw, ChevronDown, Sparkles } from 'lucide-react';

export const GalleryGrid = ({
  photos = [],
  visibleCount = 20,
  onLoadMore,
  onLoadAll,
  onSelectPhoto,
  onOpenExif,
  onResetFilters,
  onShare,
  onEdit,
  onDelete,
  layoutMode = 'masonry',
  isSelectMode = false,
  selectedPhotoIds = new Set(),
  onToggleSelect
}) => {
  const sentinelRef = useRef(null);

  // Auto-trigger load more via IntersectionObserver when user scrolls near the bottom
  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore || visibleCount >= photos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, photos.length, onLoadMore]);

  if (photos.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No photos found</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          We couldn't find any photos matching your current search, favorites, or category filter.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      </div>
    );
  }

  // Progressive displayed batch
  const displayedPhotos = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;
  const progressPercent = Math.min(100, Math.round((displayedPhotos.length / photos.length) * 100));

  // Render container based on layout mode
  const getContainerClass = () => {
    switch (layoutMode) {
      case 'grid':
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-8';
      case 'editorial':
        return 'max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10';
      case 'masonry':
      default:
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-8';
    }
  };

  return (
    <div className="w-full">
      <div className={getContainerClass()}>
        {displayedPhotos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            layoutMode={layoutMode}
            onClick={() => onSelectPhoto(index)}
            onOpenExif={onOpenExif}
            onShare={onShare}
            onEdit={onEdit}
            onDelete={onDelete}
            isSelectMode={isSelectMode}
            isSelected={selectedPhotoIds?.has ? selectedPhotoIds.has(photo.id) : false}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>

      {/* Progressive Load More / Infinite Scroll Section */}
      {hasMore && (
        <div className="max-w-md mx-auto px-4 py-8 sm:py-12 text-center">
          {/* Progress bar and counter */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
              <span>Showing {displayedPhotos.length} of {photos.length} works</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Load More Button */}
          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={onLoadMore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-slate-200/90 dark:border-zinc-800 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 text-purple-600" />
              <span>Load Next {Math.min(16, photos.length - displayedPhotos.length)} Works</span>
            </button>
            {onLoadAll && (
              <button
                onClick={onLoadAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Show All</span>
              </button>
            )}
          </div>

          {/* Sentinel element for infinite scroll */}
          <div ref={sentinelRef} className="h-6 w-full pointer-events-none opacity-0" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
