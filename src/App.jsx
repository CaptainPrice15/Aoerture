import React, { useState, useMemo, useEffect } from 'react';
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
        if (isMounted && data && data.configured && Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotosList(data.photos);
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
