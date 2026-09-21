import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { GalleryGrid } from './components/GalleryGrid';
import { LightboxModal } from './components/LightboxModal';
import { ExifDrawer } from './components/ExifDrawer';
import { AboutModal } from './components/AboutModal';
import { ImageKitGuideModal } from './components/ImageKitGuideModal';
import { Footer } from './components/Footer';
import { photos as initialPhotos } from './data/photos';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // State
  const [photosList, setPhotosList] = useState(initialPhotos);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [selectedExifPhoto, setSelectedExifPhoto] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Attempt to fetch live photos from ImageKit if /api/photos is available
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
            setPhotosList(data.photos);
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

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts = { All: photosList.length };
    availableCategories.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = photosList.filter((p) => p.category === cat).length;
      }
    });
    return counts;
  }, [photosList, availableCategories]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    return photosList
      .filter((photo) => {
        // Category match
        if (activeCategory !== 'All' && photo.category !== activeCategory) {
          return false;
        }

        // Search match
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = photo.title.toLowerCase().includes(query);
          const matchDesc = photo.description?.toLowerCase().includes(query);
          const matchLoc = photo.location?.toLowerCase().includes(query);
          const matchTags = photo.tags?.some((t) => t.toLowerCase().includes(query));
          const matchCamera = photo.exif?.camera?.toLowerCase().includes(query);
          const matchLens = photo.exif?.lens?.toLowerCase().includes(query);

          return matchTitle || matchDesc || matchLoc || matchTags || matchCamera || matchLens;
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
        totalPhotos={photosList.length}
      />

      <main className="flex-1">
        {/* Photographer Intro & Stats */}
        <HeroSection totalPhotos={photosList.length} />

        {/* Sync Notice Banner if in Static Mode */}
        {!isLiveSync && showSyncBanner && (
          <div className="bg-purple-50 dark:bg-purple-950/40 border-y border-purple-200/80 dark:border-purple-800/40 py-2.5 px-4 sm:px-6 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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

        {/* Filter, Search & Sort Bar */}
        <FilterBar
          categories={availableCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          matchingCount={filteredPhotos.length}
          categoryCounts={categoryCounts}
        />

        {/* Masonry Image Gallery */}
        <GalleryGrid
          photos={filteredPhotos}
          onSelectPhoto={handleOpenLightbox}
          onOpenExif={handleOpenExif}
          onResetFilters={handleResetFilters}
        />
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
    </div>
  );
}
