import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, X, ArrowLeft, Folder } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { GalleryGrid } from './components/GalleryGrid';
import { FolderGrid } from './components/FolderGrid';
import { LightboxModal } from './components/LightboxModal';
import { ExifDrawer } from './components/ExifDrawer';
import { AboutModal } from './components/AboutModal';
import { ImageKitGuideModal } from './components/ImageKitGuideModal';
import { AddMediaModal } from './components/AddMediaModal';
import { Footer } from './components/Footer';
import { photos as initialPhotos, INITIAL_FOLDERS } from './data/photos';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // State
  const [photosList, setPhotosList] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('user_gallery_photos');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= initialPhotos.length) return parsed;
        }
      } catch (e) {}
    }
    return initialPhotos;
  });
  const [cloudFolders, setCloudFolders] = useState(INITIAL_FOLDERS);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFolderPath, setSelectedFolderPath] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [selectedExifPhoto, setSelectedExifPhoto] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);

  const handleAddMedia = (newMedia) => {
    setPhotosList((prev) => {
      const filtered = prev.filter((p) => p.id !== newMedia.id);
      const updated = [newMedia, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('user_gallery_photos', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Attempt to fetch live photos and folders from ImageKit if /api/photos is available
  useEffect(() => {
    let isMounted = true;
    fetch('/api/photos')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && data.configured) {
          setIsLiveSync(true);
          if (Array.isArray(data.photos) && data.photos.length > 0) {
            try {
              const saved = localStorage.getItem('user_gallery_photos');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                  const customOnly = parsed.filter((p) => p.id && String(p.id).startsWith('custom-'));
                  const liveIds = new Set(data.photos.map((p) => p.id));
                  const extra = customOnly.filter((p) => !liveIds.has(p.id));
                  if (extra.length > 0) {
                    setPhotosList([...extra, ...data.photos]);
                    if (Array.isArray(data.folders) && data.folders.length > 0) {
                      setCloudFolders(data.folders);
                    }
                    return;
                  }
                }
              }
            } catch (e) {}
            setPhotosList(data.photos);
          }
          if (Array.isArray(data.folders) && data.folders.length > 0) {
            setCloudFolders(data.folders);
          }
        }
      })
      .catch(() => {
        // Fall back gracefully to initialPhotos
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute categories dynamically from photos
  const availableCategories = useMemo(() => {
    const cats = new Set(['All']);
    photosList.forEach((photo) => {
      if (photo.category) cats.add(photo.category);
    });
    return Array.from(cats);
  }, [photosList]);

  // Compute folders dynamically from cloud folders + photos
  const availableFolders = useMemo(() => {
    const foldersMap = new Map();

    // 1. Seed with known / fetched cloud folders so empty folders are kept
    cloudFolders.forEach((f) => {
      foldersMap.set(f.path, {
        name: f.name,
        path: f.path,
        photos: []
      });
    });

    // 2. Attach photos to corresponding folders
    photosList.forEach((photo) => {
      const path = photo.folderPath || (photo.src?.startsWith('/Pics') ? '/Pics' : '/');
      const name = photo.folder || (path === '/' ? 'Root Library' : path.replace(/^\/+/, ''));
      if (!foldersMap.has(path)) {
        foldersMap.set(path, {
          name,
          path,
          photos: []
        });
      }
      foldersMap.get(path).photos.push(photo);
    });

    return Array.from(foldersMap.values());
  }, [cloudFolders, photosList]);

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts = { All: photosList.length };
    availableCategories.forEach((cat) => {
      if (cat !== 'All') {
        if (cat === 'Videos') {
          counts[cat] = photosList.filter((p) => p.mediaType === 'video' || p.category === 'Videos').length;
        } else {
          counts[cat] = photosList.filter((p) => p.category === cat || p.folder === cat || p.folderPath === `/${cat}`).length;
        }
      }
    });
    return counts;
  }, [photosList, availableCategories]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    return photosList
      .filter((photo) => {
        // Folder match
        if (activeCategory === 'Folders') {
          if (selectedFolderPath) {
            const photoPath = photo.folderPath || (photo.src?.startsWith('/Pics') ? '/Pics' : '/');
            if (photoPath !== selectedFolderPath) return false;
          }
        } else if (activeCategory === 'Videos') {
          if (photo.mediaType !== 'video' && photo.category !== 'Videos') return false;
        } else if (activeCategory !== 'All') {
          const matchCategory = photo.category === activeCategory;
          const matchFolder = photo.folder === activeCategory || photo.folderPath === `/${activeCategory}`;
          if (!matchCategory && !matchFolder) return false;
        }

        // Search match
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = photo.title?.toLowerCase().includes(query);
          const matchDesc = photo.description?.toLowerCase().includes(query);
          const matchLoc = photo.location?.toLowerCase().includes(query);
          const matchTags = photo.tags?.some((t) => t.toLowerCase().includes(query));
          const matchFolder = photo.folder?.toLowerCase().includes(query);
          const matchCamera = photo.exif?.camera?.toLowerCase().includes(query);
          const matchLens = photo.exif?.lens?.toLowerCase().includes(query);

          return matchTitle || matchDesc || matchLoc || matchTags || matchFolder || matchCamera || matchLens;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === 'newest') {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === 'oldest') {
          return new Date(a.date) - new Date(b.date);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [photosList, activeCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSortBy('featured');
  };

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
  };

  const handleOpenExif = (photo) => {
    setSelectedExifPhoto(photo);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-300 selection:bg-purple-500/30 selection:text-purple-300">
      {/* Top Navigation */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenCloudGuide={() => setIsGuideOpen(true)}
        onOpenAddMedia={() => setIsAddMediaOpen(true)}
        totalPhotos={photosList.length}
      />

      <main className="flex-1">
        {/* Photographer Intro & Stats */}
        <HeroSection totalPhotos={photosList.length} />

        {/* Sync Notice Banner if in Static Mode */}
        {!isLiveSync && showSyncBanner && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border-y border-purple-200/80 dark:border-purple-800/40 py-2.5 px-3 sm:px-6 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs">
              <div className="flex items-center gap-2.5 text-purple-950 dark:text-purple-200 text-center sm:text-left">
                <span className="p-1 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span>
                  <strong>Added new pics or videos to ImageKit?</strong> Add <code className="font-mono bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-300 px-1 py-0.5 rounded font-semibold">IMAGEKIT_PRIVATE_KEY</code> to your <code className="font-mono">.env</code> to stream all uploads automatically, or register them in <code className="font-mono">photos.js</code>.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-sm"
                >
                  Quick Setup
                </button>
                <button
                  onClick={() => setShowSyncBanner(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ImageKit Live Sync Notification Banner */}
        {isLiveSync && showSyncBanner && (
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200 animate-pulse shrink-0" />
                <p className="font-medium truncate">
                  <span className="font-bold">ImageKit Live Sync:</span> {photosList.length} media items synced from cloud
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowSyncBanner(false)}
                  className="p-1 rounded-md hover:bg-white/20 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter, Search & Sort Bar */}
        <FilterBar
          categories={availableCategories}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            if (cat !== 'Folders') setSelectedFolderPath(null);
          }}
          folders={availableFolders}
          activeFolder={selectedFolderPath}
          onSelectFolder={(path) => {
            if (path) {
              setActiveCategory('Folders');
              setSelectedFolderPath(path);
            } else {
              setSelectedFolderPath(null);
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          matchingCount={filteredPhotos.length}
          categoryCounts={categoryCounts}
        />

        {/* If in Folders view with no specific folder selected: show Folders Grid */}
        {activeCategory === 'Folders' && !selectedFolderPath ? (
          <FolderGrid
            folders={availableFolders}
            onSelectFolder={(path) => setSelectedFolderPath(path)}
          />
        ) : (
          <>
            {/* Breadcrumb if inside a folder */}
            {activeCategory === 'Folders' && selectedFolderPath && (
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedFolderPath(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm w-fit active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Folders</span>
                </button>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Viewing folder:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800/60">
                    {availableFolders.find((f) => f.path === selectedFolderPath)?.name || selectedFolderPath}
                  </span>
                  <span className="text-[11px] font-mono">({filteredPhotos.length} works)</span>
                </div>
              </div>
            )}

            {/* Masonry Image Gallery or Empty Folder State */}
            {activeCategory === 'Folders' && selectedFolderPath && filteredPhotos.length === 0 ? (
              <div className="py-24 text-center max-w-md mx-auto px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Folder className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Folder "{availableFolders.find((f) => f.path === selectedFolderPath)?.name || selectedFolderPath}" is Empty
                </h3>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  This folder is ready in your cloud storage. Once photos or videos are uploaded to or organized inside this folder in ImageKit, they will show up here automatically.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => setSelectedFolderPath(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Folders</span>
                  </button>
                  <button
                    onClick={() => setIsAddMediaOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all"
                  >
                    <span>Add Media</span>
                  </button>
                </div>
              </div>
            ) : (
              <GalleryGrid
                photos={filteredPhotos}
                onSelectPhoto={handleOpenLightbox}
                onOpenExif={handleOpenExif}
                onResetFilters={handleResetFilters}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal
        photos={filteredPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxIndex >= 0}
        onClose={() => setLightboxIndex(-1)}
        onIndexChange={(idx) => setLightboxIndex(idx)}
        onOpenExif={() => {
          if (lightboxIndex >= 0 && filteredPhotos[lightboxIndex]) {
            setSelectedExifPhoto(filteredPhotos[lightboxIndex]);
          }
        }}
      />

      {/* Camera & Shot Details Drawer */}
      <ExifDrawer
        photo={selectedExifPhoto}
        isOpen={!!selectedExifPhoto}
        onClose={() => setSelectedExifPhoto(null)}
        onOpenLightbox={() => {
          if (selectedExifPhoto) {
            const idx = filteredPhotos.findIndex((p) => p.id === selectedExifPhoto.id);
            setSelectedExifPhoto(null);
            setLightboxIndex(idx >= 0 ? idx : 0);
          }
        }}
      />

      {/* Photographer Gear & Bio Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* ImageKit Free Cloud Storage Setup Walkthrough */}
      <ImageKitGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Add Media (Picture/Video) Modal */}
      <AddMediaModal
        isOpen={isAddMediaOpen}
        onClose={() => setIsAddMediaOpen(false)}
        onAddMedia={handleAddMedia}
        categories={availableCategories}
        folders={availableFolders}
      />
    </div>
  );
}
