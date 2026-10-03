import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Sparkles,
  X,
  ArrowLeft,
  Folder,
  ShieldAlert,
  Check,
  Share2,
  Download,
  Loader2,
  Eye,
  EyeOff,
  CheckSquare
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { GalleryGrid } from './components/GalleryGrid';
import { FolderGrid } from './components/FolderGrid';
import { ExifDrawer } from './components/ExifDrawer';
import { Footer } from './components/Footer';
import { useImageProtection } from './hooks/useImageProtection';
import { photos as initialPhotos, INITIAL_FOLDERS } from './data/photos';
import { downloadMedia } from './utils/imagekit';
import { recordPhotoDownload } from './utils/analytics';
import { AnalyticsPage } from './components/AnalyticsPage';

// Code-split heavy modals and Lightbox to drastically reduce initial mobile load time
const LightboxModal = lazy(() => import('./components/LightboxModal').then((m) => ({ default: m.LightboxModal })));
const AboutModal = lazy(() => import('./components/AboutModal').then((m) => ({ default: m.AboutModal })));
const ImageKitGuideModal = lazy(() => import('./components/ImageKitGuideModal').then((m) => ({ default: m.ImageKitGuideModal })));
const AddMediaModal = lazy(() => import('./components/AddMediaModal').then((m) => ({ default: m.AddMediaModal })));
const LoginModal = lazy(() => import('./components/LoginModal').then((m) => ({ default: m.LoginModal })));
const ShareModal = lazy(() => import('./components/ShareModal').then((m) => ({ default: m.ShareModal })));
const EditPhotoModal = lazy(() => import('./components/EditPhotoModal').then((m) => ({ default: m.EditPhotoModal })));

function GalleryApp() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, favorites } = useAuth();
  const { toastMessage } = useImageProtection(isAuthenticated);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'analytics') return 'analytics';
      } catch (e) {}
    }
    return 'gallery';
  });

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
  const [colorFilter, setColorFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(() => new Set());
  const [isDownloadingCollection, setIsDownloadingCollection] = useState(false);
  const [collectionToast, setCollectionToast] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [layoutMode, setLayoutMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('gallery_layout_mode') || 'masonry';
      } catch (e) {}
    }
    return 'masonry';
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [selectedExifPhoto, setSelectedExifPhoto] = useState(null);
  const [sharePhoto, setSharePhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [pendingPhotoId, setPendingPhotoId] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('photo');
      } catch (e) {}
    }
    return null;
  });

  const handleLayoutChange = useCallback((mode) => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gallery_layout_mode', mode);
      } catch (e) {}
    }
  }, []);

  const handleAddMedia = useCallback((newMedia) => {
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
  }, []);

  const handleSaveEditedPhoto = useCallback((updatedPhoto) => {
    setPhotosList((prev) => {
      const updated = prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('user_gallery_photos', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  }, []);

  const handleDeletePhoto = useCallback((photoId) => {
    if (user?.role !== 'admin') {
      alert('Permission denied: Only administrators can delete photos.');
      return;
    }
    setPhotosList((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('user_gallery_photos', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  }, [user?.role]);

  // 1. Initial Deep-linking check on page mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const folderParam = params.get('folder');
      const layoutParam = params.get('layout');
      const collectionParam = params.get('collection');
      const viewParam = params.get('view');

      if (viewParam === 'analytics') {
        setCurrentView('analytics');
      }

      if (layoutParam && ['masonry', 'grid', 'editorial'].includes(layoutParam)) {
        setLayoutMode(layoutParam);
      }
      if (catParam) {
        setActiveCategory(catParam);
      }
      if (folderParam) {
        setActiveCategory('Folders');
        setSelectedFolderPath(folderParam);
      }
      if (collectionParam) {
        const ids = collectionParam.split(',').filter(Boolean);
        if (ids.length > 0) {
          setSelectedPhotoIds(new Set(ids));
          setIsSelectMode(true);
          setCollectionToast(`Loaded shared collection (${ids.length} photos)`);
          setTimeout(() => setCollectionToast(''), 4000);
        }
      }
    } catch (e) {}
  }, []);

  // Reset progressive visibleCount when any filter changes
  useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory, selectedFolderPath, searchQuery, sortBy, showFavoritesOnly, colorFilter]);

  // 2. Fetch live photos and folders from ImageKit if /api/photos is available
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
                    const combined = [...extra, ...data.photos];
                    setPhotosList(combined);
                    try {
                      localStorage.setItem('user_gallery_photos', JSON.stringify(combined));
                    } catch (e) {}
                    if (Array.isArray(data.folders) && data.folders.length > 0) {
                      setCloudFolders(data.folders);
                    }
                    return;
                  }
                }
              }
            } catch (e) {}
            setPhotosList(data.photos);
            try {
              localStorage.setItem('user_gallery_photos', JSON.stringify(data.photos));
            } catch (e) {}
          }
          if (Array.isArray(data.folders) && data.folders.length > 0) {
            setCloudFolders(data.folders);
          }
        }
      })
      .catch(() => {});

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
    const normalize = (p) => (p || '/').replace(/\/+$/, '').toLowerCase() || '/';

    cloudFolders.forEach((f) => {
      const key = normalize(f.path);
      foldersMap.set(key, {
        name: f.name,
        path: f.path,
        photos: []
      });
    });

    photosList.forEach((photo) => {
      const rawPath = photo.folderPath || (photo.src?.startsWith('/Pics') ? '/Pics' : '/');
      const key = normalize(rawPath);
      const name = photo.folder || (key === '/' ? 'Root Library' : rawPath.replace(/^\/+/, ''));
      if (!foldersMap.has(key)) {
        foldersMap.set(key, {
          name,
          path: rawPath,
          photos: []
        });
      }
      foldersMap.get(key).photos.push(photo);
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
          const catNorm = cat.toLowerCase();
          counts[cat] = photosList.filter((p) => {
            const photoCat = (p.category || '').toLowerCase();
            const photoFolder = (p.folder || '').toLowerCase();
            const photoFolderPath = (p.folderPath || '').toLowerCase();
            return photoCat === catNorm || photoFolder === catNorm || photoFolderPath === `/${catNorm}`;
          }).length;
        }
      }
    });
    return counts;
  }, [photosList, availableCategories]);

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    return photosList
      .filter((photo) => {
        // Favorites filter
        if (showFavoritesOnly) {
          if (!favorites || !favorites.includes(photo.id)) return false;
        }

        // Folder match
        if (activeCategory === 'Folders') {
          if (selectedFolderPath) {
            const normalize = (p) => (p || '/').replace(/\/+$/, '').toLowerCase() || '/';
            const photoPath = photo.folderPath || (photo.src?.startsWith('/Pics') ? '/Pics' : '/');
            if (normalize(photoPath) !== normalize(selectedFolderPath)) return false;
          }
        } else if (activeCategory === 'Videos') {
          if (photo.mediaType !== 'video' && photo.category !== 'Videos') return false;
        } else if (activeCategory !== 'All') {
          const activeNorm = activeCategory.toLowerCase();
          const matchCategory = (photo.category || '').toLowerCase() === activeNorm;
          const matchFolder = (photo.folder || '').toLowerCase() === activeNorm || (photo.folderPath || '').toLowerCase() === `/${activeNorm}`;
          if (!matchCategory && !matchFolder) return false;
        }

        // Chromatic Color Filter match
        if (colorFilter && colorFilter !== 'All') {
          const text = `${photo.title || ''} ${photo.category || ''} ${photo.description || ''} ${(photo.tags || []).join(' ')}`.toLowerCase();
          if (colorFilter === 'warm') {
            const isWarm =
              ['darjeeling', 'kedarnath', 'badrinath'].includes(photo.category?.toLowerCase()) ||
              ['warm', 'gold', 'sunset', 'orange', 'yellow', 'sun', 'autumn', 'red'].some((w) => text.includes(w));
            if (!isWarm) return false;
          } else if (colorFilter === 'emerald') {
            const isEmerald =
              ['sikkim', 'nature'].includes(photo.category?.toLowerCase()) ||
              ['green', 'forest', 'trees', 'nature', 'tea', 'valley', 'leaf', 'mountain'].some((w) => text.includes(w));
            if (!isEmerald) return false;
          } else if (colorFilter === 'blue') {
            const isBlue =
              ['haridwar'].includes(photo.category?.toLowerCase()) ||
              ['water', 'river', 'sky', 'blue', 'ganga', 'ice', 'snow', 'glacier', 'lake'].some((w) => text.includes(w));
            if (!isBlue) return false;
          } else if (colorFilter === 'purple') {
            const isPurple =
              ['pics', 'videos'].includes(photo.category?.toLowerCase()) ||
              ['purple', 'neon', 'violet', 'fuchsia', 'night', 'vibrant', 'pink'].some((w) => text.includes(w));
            if (!isPurple) return false;
          } else if (colorFilter === 'mono') {
            const isMono = ['mono', 'black', 'white', 'b&w', 'shadow', 'contrast', 'dark', 'monochrome'].some((w) =>
              text.includes(w)
            );
            if (!isMono) return false;
          }
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
  }, [photosList, activeCategory, searchQuery, sortBy, showFavoritesOnly, favorites, selectedFolderPath, colorFilter]);

  // 1b. Reliably resolve deep-linked photo across categories, filters, and async ImageKit sync
  useEffect(() => {
    if (!pendingPhotoId || photosList.length === 0) return;

    // Check if photo is in current filteredPhotos
    const targetIdx = filteredPhotos.findIndex((p) => p.id === pendingPhotoId);
    if (targetIdx >= 0) {
      setLightboxIndex(targetIdx);
      setPendingPhotoId(null);
      return;
    }

    // If not in filteredPhotos, check if it exists in photosList
    const inTotal = photosList.find((p) => p.id === pendingPhotoId);
    if (inTotal) {
      // Clear restrictive filters so photo becomes visible in filtered list
      setActiveCategory('All');
      setSearchQuery('');
      setShowFavoritesOnly(false);
      setColorFilter('All');
      setSelectedFolderPath(null);
    } else {
      setPendingPhotoId(null);
    }
  }, [pendingPhotoId, filteredPhotos, photosList]);

  // Sync state to URL for deep-linking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);

      if (lightboxIndex >= 0 && filteredPhotos[lightboxIndex]) {
        url.searchParams.set('photo', filteredPhotos[lightboxIndex].id);
      } else {
        url.searchParams.delete('photo');
      }

      if (activeCategory && activeCategory !== 'All') {
        url.searchParams.set('category', activeCategory);
      } else {
        url.searchParams.delete('category');
      }

      if (selectedFolderPath) {
        url.searchParams.set('folder', selectedFolderPath);
      } else {
        url.searchParams.delete('folder');
      }

      if (currentView === 'analytics') {
        url.searchParams.set('view', 'analytics');
      } else {
        url.searchParams.delete('view');
      }

      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [lightboxIndex, activeCategory, selectedFolderPath, filteredPhotos, currentView]);

  const handleResetFilters = useCallback(() => {
    setActiveCategory('All');
    setSearchQuery('');
    setSortBy('featured');
    setShowFavoritesOnly(false);
    setColorFilter('All');
    setVisibleCount(20);
  }, []);

  const handleOpenLightbox = useCallback((index) => {
    setLightboxIndex(index);
  }, []);

  const handleOpenExif = useCallback((photo) => {
    setSelectedExifPhoto(photo);
  }, []);

  const handleOpenExifLightbox = useCallback((photo) => {
    const target = photo && photo.id ? photo : selectedExifPhoto;
    if (!target) return;
    const idx = filteredPhotos.findIndex((p) => p.id === target.id);
    if (idx >= 0) {
      setSelectedExifPhoto(null);
      setLightboxIndex(idx);
    }
  }, [selectedExifPhoto, filteredPhotos]);

  // Multi-Select Operations
  const handleToggleSelect = useCallback((id) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPhotoIds(new Set(filteredPhotos.map((p) => p.id)));
  }, [filteredPhotos]);

  const handleClearSelect = useCallback(() => {
    setSelectedPhotoIds(new Set());
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedPhotoIds.size === 0 || isDownloadingCollection) return;
    setIsDownloadingCollection(true);
    try {
      const toDownload = photosList.filter((p) => selectedPhotoIds.has(p.id));
      for (const photo of toDownload) {
        await downloadMedia(photo);
        try {
          recordPhotoDownload(photo.id);
        } catch (e) {}
        await new Promise((r) => setTimeout(r, 350));
      }
      setCollectionToast(`Downloaded ${toDownload.length} items successfully`);
      setTimeout(() => setCollectionToast(''), 3500);
    } catch (err) {
      console.error('Download collection error:', err);
    } finally {
      setIsDownloadingCollection(false);
    }
  }, [selectedPhotoIds, isDownloadingCollection, photosList]);

  const handleCopyCollectionLink = useCallback(() => {
    if (selectedPhotoIds.size === 0) return;
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('collection', Array.from(selectedPhotoIds).join(','));
      navigator.clipboard.writeText(url.toString());
      setCollectionToast('Curated collection link copied to clipboard!');
      setTimeout(() => setCollectionToast(''), 3500);
    } catch (e) {}
  }, [selectedPhotoIds]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 16);
  }, []);

  const handleLoadAll = useCallback(() => {
    setVisibleCount(filteredPhotos.length);
  }, [filteredPhotos.length]);

  const handleShare = useCallback((photo) => {
    setSharePhoto(photo);
  }, []);

  const handleEdit = useCallback((photo) => {
    setEditingPhoto(photo);
  }, []);

  return (
    <div
      className={`min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-purple-500/30 selection:text-purple-300 relative transition-colors duration-500 ${
        isFocusMode ? 'bg-zinc-950 text-white' : ''
      }`}
    >
      {/* High-Performance Fixed Ambient Light Mesh (hidden in Focus Mode) */}
      {!isFocusMode && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transform-gpu" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-purple-200/35 rounded-full blur-[100px] transform-gpu dark:opacity-0 transition-opacity duration-300" />
          <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-indigo-200/30 rounded-full blur-[100px] transform-gpu dark:opacity-0 transition-opacity duration-300" />
          <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-pink-200/20 rounded-full blur-[100px] transform-gpu dark:opacity-0 transition-opacity duration-300" />
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenCloudGuide={() => setIsGuideOpen(true)}
        onOpenAddMedia={() => setIsAddMediaOpen(true)}
        onOpenLogin={(mode = 'signin') => {
          setAuthMode(mode);
          setIsLoginOpen(true);
        }}
        totalPhotos={photosList.length}
        currentView={currentView}
        onNavigateView={setCurrentView}
      />

      <main className="flex-1">
        {currentView === 'analytics' ? (
          user?.role === 'admin' ? (
            <AnalyticsPage
              photos={photosList}
              onBack={() => setCurrentView('gallery')}
              onSelectPhoto={handleOpenLightbox}
            />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Access Restricted</h2>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                The Analytics Console is confidential and only accessible when logged in with administrator credentials.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2.5">
                <button
                  onClick={() => setCurrentView('gallery')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Return to Gallery
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setIsLoginOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  Sign in as Admin
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Photographer Intro & Stats (Hidden in Cinema Focus Mode) */}
            {!isFocusMode && <HeroSection totalPhotos={photosList.length} />}

        {/* Sync Notice Banner if in Static Mode */}
        {!isFocusMode && !isLiveSync && showSyncBanner && (
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
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-sm cursor-pointer"
                >
                  Quick Setup
                </button>
                <button
                  onClick={() => setShowSyncBanner(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ImageKit Live Sync Notification Banner */}
        {!isFocusMode && isLiveSync && showSyncBanner && (
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
                  className="p-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter, Search, Layout, Color Palette & Sort Bar */}
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
          layoutMode={layoutMode}
          onLayoutChange={handleLayoutChange}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={setShowFavoritesOnly}
          favoritesCount={favorites?.length || 0}
          colorFilter={colorFilter}
          onColorFilterChange={setColorFilter}
          isSelectMode={isSelectMode}
          onToggleSelectMode={(mode) => {
            setIsSelectMode(mode);
            if (!mode) setSelectedPhotoIds(new Set());
          }}
          selectedCount={selectedPhotoIds.size}
          isFocusMode={isFocusMode}
          onToggleFocusMode={setIsFocusMode}
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
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm w-fit active:scale-95 cursor-pointer"
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

            {/* Gallery Grid or Empty State */}
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Folders</span>
                  </button>
                  <button
                    onClick={() => setIsAddMediaOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <span>Add Media</span>
                  </button>
                </div>
              </div>
            ) : (
              <GalleryGrid
                photos={filteredPhotos}
                visibleCount={visibleCount}
                onLoadMore={handleLoadMore}
                onLoadAll={handleLoadAll}
                layoutMode={layoutMode}
                onSelectPhoto={handleOpenLightbox}
                onOpenExif={handleOpenExif}
                onResetFilters={handleResetFilters}
                onShare={handleShare}
                onEdit={handleEdit}
                onDelete={handleDeletePhoto}
                isSelectMode={isSelectMode}
                selectedPhotoIds={selectedPhotoIds}
                onToggleSelect={handleToggleSelect}
              />
            )}
          </>
        )}
          </>
        )}
      </main>

      {/* Floating Multi-Select Action Dock */}
      {isSelectMode && (
        <div className="fixed bottom-safe bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)] w-auto bg-zinc-950/95 text-white rounded-2xl p-1.5 sm:p-2 sm:px-4 shadow-2xl border border-white/15 backdrop-blur-xl flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar animate-fade-in">
          <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-xs font-mono font-bold whitespace-nowrap">
            {selectedPhotoIds.size} Selected
          </span>

          <button
            onClick={handleSelectAll}
            className="px-2.5 py-1 rounded-xl text-xs hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Select All
          </button>

          {selectedPhotoIds.size > 0 && (
            <button
              onClick={handleClearSelect}
              className="px-2 py-1 rounded-xl text-xs hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          )}

          <div className="h-4 w-px bg-white/20 shrink-0" />

          {/* Copy Share Link */}
          <button
            onClick={handleCopyCollectionLink}
            disabled={selectedPhotoIds.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
            title="Share this curated collection"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Share Link</span>
          </button>

          {/* Download Selected */}
          <button
            onClick={handleDownloadSelected}
            disabled={selectedPhotoIds.size === 0 || isDownloadingCollection}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/30 cursor-pointer whitespace-nowrap"
          >
            {isDownloadingCollection ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Download className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>Download ({selectedPhotoIds.size})</span>
          </button>

          {/* Close Select Mode */}
          <button
            onClick={() => {
              setIsSelectMode(false);
              setSelectedPhotoIds(new Set());
            }}
            className="p-1 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Exit select mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cinema Focus Mode Exit Pill */}
      {isFocusMode && (
        <div className="fixed bottom-safe bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 animate-fade-in">
          <button
            onClick={() => setIsFocusMode(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950/90 text-amber-400 border border-amber-500/40 shadow-2xl backdrop-blur-xl hover:bg-zinc-900 transition-all text-xs font-semibold cursor-pointer active:scale-95"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Exit Cinema Mode</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {collectionToast && (
        <div className="fixed top-safe top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-950 text-white border border-purple-500/50 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{collectionToast}</span>
        </div>
      )}

      {/* Footer */}
      {!isFocusMode && <Footer />}

      {/* Lightbox Modal */}
      {lightboxIndex >= 0 && (
        <Suspense fallback={null}>
          <LightboxModal
            photos={filteredPhotos}
            currentIndex={lightboxIndex}
            isOpen={lightboxIndex >= 0}
            onClose={() => setLightboxIndex(-1)}
            onIndexChange={setLightboxIndex}
            onOpenExif={handleOpenExif}
          />
        </Suspense>
      )}

      {/* EXIF Metadata Drawer */}
      <ExifDrawer
        photo={selectedExifPhoto}
        isOpen={!!selectedExifPhoto}
        onClose={() => setSelectedExifPhoto(null)}
        onOpenLightbox={handleOpenExifLightbox}
        onShare={handleShare}
        onEdit={handleEdit}
        onDelete={handleDeletePhoto}
      />

      {/* Social Share & Deep Link Modal */}
      {sharePhoto && (
        <Suspense fallback={null}>
          <ShareModal
            isOpen={!!sharePhoto}
            photo={sharePhoto}
            onClose={() => setSharePhoto(null)}
          />
        </Suspense>
      )}

      {/* Admin Edit Photo Modal */}
      {editingPhoto && (
        <Suspense fallback={null}>
          <EditPhotoModal
            isOpen={!!editingPhoto}
            photo={editingPhoto}
            onClose={() => setEditingPhoto(null)}
            onSave={handleSaveEditedPhoto}
            categories={availableCategories}
            folders={availableFolders}
          />
        </Suspense>
      )}

      {/* Photographer Gear & Bio Modal */}
      {isAboutOpen && (
        <Suspense fallback={null}>
          <AboutModal
            isOpen={isAboutOpen}
            onClose={() => setIsAboutOpen(false)}
          />
        </Suspense>
      )}

      {/* ImageKit Free Cloud Storage Setup Walkthrough */}
      {isGuideOpen && (
        <Suspense fallback={null}>
          <ImageKitGuideModal
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        </Suspense>
      )}

      {/* Add Media (Picture/Video) Modal with Direct Drag & Drop */}
      {isAddMediaOpen && (
        <Suspense fallback={null}>
          <AddMediaModal
            isOpen={isAddMediaOpen}
            onClose={() => setIsAddMediaOpen(false)}
            onAddMedia={handleAddMedia}
            categories={availableCategories}
            folders={availableFolders}
          />
        </Suspense>
      )}

      {/* Sign In / Sign Up Modal */}
      {isLoginOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginOpen}
            initialMode={authMode}
            onClose={() => setIsLoginOpen(false)}
          />
        </Suspense>
      )}

      {/* Floating Image Protection Toast for Non-Logged-in Visitors */}
      {toastMessage && (
        <div className="fixed bottom-safe bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-950/90 text-white text-xs font-medium shadow-2xl border border-white/10 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GalleryApp />
    </AuthProvider>
  );
}
