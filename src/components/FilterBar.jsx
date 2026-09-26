import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Folder,
  FolderOpen,
  ChevronDown,
  Columns3,
  LayoutGrid,
  Rows3,
  Heart,
  Palette,
  CheckSquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { CATEGORIES } from '../data/photos';

export const COLOR_PALETTES = [
  { id: 'All', name: 'All Tones', dotClass: 'bg-gradient-to-tr from-purple-500 via-amber-400 to-emerald-400' },
  { id: 'warm', name: 'Warm / Golden', dotClass: 'bg-amber-500' },
  { id: 'emerald', name: 'Emerald / Green', dotClass: 'bg-emerald-500' },
  { id: 'blue', name: 'Ocean / Blue', dotClass: 'bg-sky-500' },
  { id: 'purple', name: 'Vibrant / Purple', dotClass: 'bg-purple-500' },
  { id: 'mono', name: 'Monochrome', dotClass: 'bg-zinc-800 dark:bg-zinc-200' }
];

export const FilterBar = ({
  categories = CATEGORIES,
  activeCategory,
  onSelectCategory,
  folders = [],
  activeFolder = null,
  onSelectFolder,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  matchingCount,
  categoryCounts,
  layoutMode = 'masonry',
  onLayoutChange,
  showFavoritesOnly = false,
  onToggleFavoritesOnly,
  favoritesCount = 0,
  colorFilter = 'All',
  onColorFilterChange,
  isSelectMode = false,
  onToggleSelectMode,
  selectedCount = 0,
  isFocusMode = false,
  onToggleFocusMode
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const dropdownRef = useRef(null);
  const paletteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setIsPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFoldersActive = activeCategory === 'Folders';
  const activeFolderObj = activeFolder ? folders.find((f) => f.path === activeFolder) : null;
  const activeColorObj = COLOR_PALETTES.find((c) => c.id === colorFilter) || COLOR_PALETTES[0];

  return (
    <div className="sticky top-16 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-zinc-950/90 border-b border-slate-200/80 dark:border-zinc-800/40 py-2 sm:py-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3">
        {/* Category Pills & Folders Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-visible min-w-0">
          {/* Scrollable Category Pills with edge-fade indicator */}
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-scroll pr-5 sm:pr-0">
              {categories.map((cat) => {
                const isActive = !showFavoritesOnly && !isFoldersActive && activeCategory === cat;
                const count = categoryCounts[cat] ?? 0;

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      if (showFavoritesOnly && onToggleFavoritesOnly) {
                        onToggleFavoritesOnly(false);
                      }
                      onSelectCategory(cat);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-semibold border border-purple-500'
                        : 'bg-white/90 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-zinc-800 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs hover:border-purple-300'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-purple-700/80 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Edge fade hint on mobile */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-1 md:bottom-0 w-5 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent sm:hidden" />
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 shrink-0 hidden sm:block" />

          {/* Favorites Filter Button */}
          <button
            onClick={() => onToggleFavoritesOnly && onToggleFavoritesOnly(!showFavoritesOnly)}
            title={showFavoritesOnly ? 'Show all photos' : 'Show favorited photos only'}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all duration-200 shrink-0 cursor-pointer ${
              showFavoritesOnly
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 font-semibold border border-rose-400'
                : 'bg-white dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 shadow-xs'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : 'fill-rose-500/20'}`} />
            <span className="hidden sm:inline">Favorites</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                showFavoritesOnly
                  ? 'bg-rose-600/80 text-white'
                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
              }`}
            >
              {favoritesCount}
            </span>
          </button>

          {/* Folders Category Pill & Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (showFavoritesOnly && onToggleFavoritesOnly) {
                    onToggleFavoritesOnly(false);
                  }
                  setIsDropdownOpen((prev) => !prev);
                  onSelectCategory('Folders');
                  if (!activeFolder && onSelectFolder) {
                    onSelectFolder(null);
                  }
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer ${
                  !showFavoritesOnly && isFoldersActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-semibold border border-purple-500'
                    : 'bg-white/90 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-400 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-zinc-800 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs hover:border-purple-300'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-inherit" />
                <span className="max-w-[70px] sm:max-w-none truncate">{activeFolderObj ? activeFolderObj.name : 'Folders'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    !showFavoritesOnly && isFoldersActive
                      ? 'bg-purple-700/80 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {activeFolderObj ? (activeFolderObj.photos ? activeFolderObj.photos.length : 0) : folders.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Folders Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 sm:left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl py-2 z-50 animate-fade-in max-h-80 overflow-y-auto">
                <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Cloud Folders</span>
                  <span className="font-mono text-[10px] text-slate-400">{folders.length} folders</span>
                </div>

                {/* All Folders Overview Option */}
                <button
                  onClick={() => {
                    onSelectCategory('Folders');
                    if (onSelectFolder) onSelectFolder(null);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    isFoldersActive && !activeFolder
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 font-semibold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-purple-50/50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>All Folders Overview</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{folders.length}</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />

                {folders.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => {
                      onSelectCategory('Folders');
                      if (onSelectFolder) onSelectFolder(f.path);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      activeFolder === f.path
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 font-semibold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-purple-50/50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                      {f.photos ? f.photos.length : 0} {f.photos?.length === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controls Row: Layout Switcher + Color Palette + Multi-Select + Search + Sort */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          {/* Gallery Layout Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-inner shrink-0">
            <button
              onClick={() => onLayoutChange && onLayoutChange('masonry')}
              title="Masonry Layout"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'masonry'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onLayoutChange && onLayoutChange('grid')}
              title="Uniform Grid Layout"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onLayoutChange && onLayoutChange('editorial')}
              title="Editorial Storytelling Layout"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'editorial'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chromatic Color Palette Filter Trigger */}
          <div className="relative shrink-0" ref={paletteRef}>
            <button
              onClick={() => setIsPaletteOpen((prev) => !prev)}
              title={`Filter by color: ${activeColorObj.name}`}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                colorFilter !== 'All'
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-xs font-semibold'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200/90 dark:border-zinc-800 shadow-xs hover:text-zinc-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className={`w-2.5 h-2.5 rounded-full ${activeColorObj.dotClass} shrink-0 ring-1 ring-black/10`} />
              <span className="hidden lg:inline text-[11px]">{activeColorObj.name}</span>
            </button>

            {/* Color Swatches Popover */}
            {isPaletteOpen && (
              <div className="absolute right-0 sm:left-0 mt-2 p-2 w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl z-50 animate-fade-in flex flex-col gap-1">
                <span className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Chromatic Tone
                </span>
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => {
                      if (onColorFilterChange) onColorFilterChange(pal.id);
                      setIsPaletteOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      colorFilter === pal.id
                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${pal.dotClass} shadow-xs ring-1 ring-black/10`} />
                      <span>{pal.name}</span>
                    </span>
                    {colorFilter === pal.id && <span className="text-[10px] font-bold text-purple-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Select Mode Toggle */}
          <button
            onClick={() => onToggleSelectMode && onToggleSelectMode(!isSelectMode)}
            title={isSelectMode ? 'Exit select mode' : 'Select multiple photos to download or share'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs transition-all shrink-0 cursor-pointer ${
              isSelectMode
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25 font-semibold'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200/90 dark:border-zinc-800 shadow-xs hover:text-zinc-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSelectMode ? `Selected (${selectedCount})` : 'Select'}
            </span>
          </button>

          {/* Focus / Cinema Mode Toggle */}
          <button
            onClick={() => onToggleFocusMode && onToggleFocusMode(!isFocusMode)}
            title={isFocusMode ? 'Exit Cinema Focus mode' : 'Enter Cinema Focus mode'}
            className={`p-1.5 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isFocusMode
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm font-semibold'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200/90 dark:border-zinc-800 shadow-xs hover:text-zinc-900'
            }`}
          >
            {isFocusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Search Input (Fluid min-w-0 for mobile screens) */}
          <div className="relative flex-1 min-w-0 sm:w-44 md:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 sm:pl-8 pr-7 sm:pr-8 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-2.5 sm:pl-3 pr-6 sm:pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer transition-all font-medium"
            >
              <option value="featured">✨ Featured</option>
              <option value="newest">📅 Newest</option>
              <option value="oldest">⏳ Oldest</option>
              <option value="title">🔤 Title</option>
            </select>
            <div className="pointer-events-none absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
