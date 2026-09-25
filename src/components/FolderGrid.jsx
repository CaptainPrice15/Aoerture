import React from 'react';
import { Folder, FolderOpen, ChevronRight, Image as ImageIcon, Video, ArrowLeft } from 'lucide-react';
import { getThumbnailUrl } from '../utils/imagekit';

export const FolderGrid = ({ folders = [], onSelectFolder }) => {
  if (folders.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-xs">
          <Folder className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No folders found</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Create folders in your ImageKit account or upload files into folders to organize them.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Section Header */}
      <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>ImageKit Folders & Albums</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
            Browse your media organized by cloud directory
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-mono font-medium px-3 py-1 rounded-full bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 shadow-xs">
          {folders.length} {folders.length === 1 ? 'Folder' : 'Folders'}
        </span>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {folders.map((folder) => {
          const photoCount = folder.photos.filter((p) => p.mediaType !== 'video').length;
          const videoCount = folder.photos.filter((p) => p.mediaType === 'video').length;
          const previewPhotos = folder.photos.slice(0, 3);

          return (
            <div
              key={folder.path}
              onClick={() => onSelectFolder(folder.path)}
              className="group relative rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 p-4 sm:p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-6px_rgba(139,92,246,0.16)] hover:border-purple-300 dark:hover:border-purple-500/40 active:scale-[0.98] touch-manipulation transform-gpu transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              {/* Preview Image Stack */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/60 mb-4">
                {previewPhotos.length > 0 ? (
                  <div className="w-full h-full grid grid-cols-3 gap-1 p-1 bg-slate-200/60 dark:bg-zinc-950">
                    {previewPhotos.map((photo, i) => (
                      <div
                        key={photo.id}
                        className={`relative rounded-xl overflow-hidden ${
                          previewPhotos.length === 1
                            ? 'col-span-3 h-full'
                            : previewPhotos.length === 2 && i === 0
                            ? 'col-span-2 h-full'
                            : 'h-full'
                        }`}
                      >
                        <img
                          src={getThumbnailUrl(photo)}
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Folder className="w-10 h-10 opacity-30" />
                    <span className="text-xs">No media preview</span>
                  </div>
                )}
              </div>

              {/* Folder Details */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    {photoCount > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-purple-500" />
                        <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
                      </span>
                    )}
                    {videoCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-purple-500" />
                        <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                      </span>
                    )}
                    {photoCount === 0 && videoCount === 0 && <span>Empty folder</span>}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-purple-600 flex items-center justify-center shrink-0 transition-all shadow-xs">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
