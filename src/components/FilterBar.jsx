import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowDownAZ, Sparkles, Calendar, Layers, Folder, FolderOpen, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/photos';

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
  categoryCounts
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFoldersActive = activeCategory === 'Folders';
  const activeFolderObj = activeFolder ? folders.find((f) => f.path === activeFolder) : null;

  return (
    <div className="sticky top-16 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800/40 py-2.5 sm:py-3.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Category Pills & Folders Dropdown */}
        <div className="flex items-center gap-2 overflow-visible min-w-0">
          {/* Scrollable Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-scroll">
            {categories.map((cat) => {
              const isActive = !isFoldersActive && activeCategory === cat;
              const count = categoryCounts[cat] ?? 0;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    if (onSelectFolder) onSelectFolder(null);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-purple-700 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0 hidden sm:block" />

          {/* Folders Category Pill & Dropdown (OUTSIDE overflow-x-auto so dropdown is NEVER clipped) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={() => {
                  setIsDropdownOpen((prev) => !prev);
                  onSelectCategory('Folders');
                  if (!activeFolder && onSelectFolder) {
                    onSelectFolder(null);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all duration-200 touch-manipulation ${
                  isFoldersActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-inherit" />
                <span>{activeFolderObj ? activeFolderObj.name : 'Folders'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isFoldersActive
                      ? 'bg-purple-700 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {activeFolderObj ? (activeFolderObj.photos ? activeFolderObj.photos.length : 0) : folders.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Folders Dropdown Menu (Safe right-0 sm:left-0 positioning to never overflow screen) */}
            {isDropdownOpen && (
              <div className="absolute right-0 sm:left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-2 z-50 animate-fade-in max-h-80 overflow-y-auto">
                <div className="px-3.5 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Cloud Folders</span>
                  <span className="font-mono text-[10px] text-zinc-400">{folders.length} folders</span>
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
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
                    <span>All Folders Overview</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{folders.length}</span>
                </button>

                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

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
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
                      {f.photos ? f.photos.length : 0} {f.photos?.length === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search gear, place, tag..."
              className="w-full pl-8 pr-8 py-1.5 text-sm sm:text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm sm:text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-all"
            >
              <option value="featured">✨ Featured</option>
              <option value="newest">📅 Newest</option>
              <option value="oldest">⏳ Oldest</option>
              <option value="title">🔤 Title</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
