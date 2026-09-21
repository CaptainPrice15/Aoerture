import React from 'react';
import { Folder, FolderOpen, ChevronRight, Image as ImageIcon, Video, ArrowLeft } from 'lucide-react';
import { getThumbnailUrl } from '../utils/imagekit';

export const FolderGrid = ({ folders = [], onSelectFolder }) => {
  if (folders.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>ImageKit Folders & Albums</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse your media organized by their cloud directory in ImageKit
          </p>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
          {folders.length} {folders.length === 1 ? 'Folder' : 'Folders'}
        </span>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => {
          const photoCount = folder.photos.filter((p) => p.mediaType !== 'video').length;
          const videoCount = folder.photos.filter((p) => p.mediaType === 'video').length;
          const previewPhotos = folder.photos.slice(0, 3);

          return (
            <div
              key={folder.path}
              onClick={() => onSelectFolder(folder.path)}
              className="group relative rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              {/* Preview Image Stack */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 mb-4">
                {previewPhotos.length > 0 ? (
                  <div className="w-full h-full grid grid-cols-3 gap-1 p-1 bg-zinc-200 dark:bg-zinc-950">
                    {previewPhotos.map((photo, i) => (
                      <div
                        key={photo.id}
                        className={`relative rounded-xl overflow-hidden ${
                          previewPhotos.length === 1
                            ? 'col-span-3 h-full'
                            : previewPhotos.length === 2 && i === 0
                            ? 'col-span-2 h-full'
                            : i === 0
                            ? 'col-span-2 h-full'
                            : 'col-span-1 h-full'
                        }`}
                      >
                        <img
                          src={getThumbnailUrl(photo)}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Folder className="w-12 h-12 stroke-1" />
                  </div>
                )}

                {/* Folder Path Badge (top-left) */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-zinc-950/75 backdrop-blur-md text-white border border-white/10 shadow-sm">
                    <Folder className="w-3.5 h-3.5 text-purple-400" />
                    <span>{folder.path}</span>
                  </span>
                </div>
              </div>

              {/* Folder Details */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {folder.name}
                  </h3>
                  <div className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Media Counts */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
                  {photoCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                      <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
                    </span>
                  )}
                  {videoCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[11px] text-zinc-400">
                    {folder.photos.length} total
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
