import React from 'react';
import { Camera, Aperture, Sun, Moon, Info, Cloud, Compass } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const Navbar = ({ theme, toggleTheme, onOpenAbout, onOpenCloudGuide, totalPhotos }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-zinc-950/80 dark:bg-zinc-950/80 bg-white/80 border-b border-zinc-800/50 dark:border-zinc-800/60 border-zinc-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
            <div className="w-full h-full bg-zinc-950 dark:bg-zinc-950 bg-white rounded-[10px] flex items-center justify-center">
              <Aperture className="w-5 h-5 text-purple-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {siteConfig.photographer.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-medium">
                {totalPhotos} Works
              </span>
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {siteConfig.photographer.title}
            </p>
          </div>
        </a>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Storage Guide Modal Trigger */}
          <button
            onClick={onOpenCloudGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 transition-all"
            title="ImageKit.io Cloud Setup Guide"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ImageKit CDN</span>
          </button>

          {/* About / Gear Modal Trigger */}
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-400" />
            <span>About & Gear</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 transition-transform -rotate-12 hover:rotate-0 duration-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
