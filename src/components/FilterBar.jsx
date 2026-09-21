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
    <div className="sticky top-16 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800/40 py-3.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const isActive = !isFoldersActive && activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;

            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  if (onSelectFolder) onSelectFolder(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
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

          {/* Folders Category Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (activeCategory === 'Folders' && !activeFolder) {
                    setIsDropdownOpen(!isDropdownOpen);
                  } else {
                    onSelectCategory('Folders');
                    if (onSelectFolder) onSelectFolder(null);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
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
                  {activeFolderObj ? activeFolderObj.photos.length : folders.length}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </span>
              </button>
            </div>

            {/* Folders Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Cloud Folders
                </div>
                
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
                      {f.photos.length}
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
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
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
              className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-all"
            >
              <option value="featured">✨ Featured</option>
              <option value="newest">📅 Newest First</option>
              <option value="oldest">⏳ Oldest First</option>
              <option value="title">🔤 Title (A-Z)</option>
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
