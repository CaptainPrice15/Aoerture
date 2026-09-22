import React from 'react';
import { PhotoCard } from './PhotoCard';
import { ImageOff, RotateCcw } from 'lucide-react';

export const GalleryGrid = ({ photos, onSelectPhoto, onOpenExif, onResetFilters }) => {
  if (photos.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No photos found</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          We couldn't find any photos matching your current search or category filter.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-8">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onSelectPhoto(index)}
          onOpenExif={onOpenExif}
        />
      ))}
    </div>
  );
};
