import React from 'react';
import { ArrowUp, Aperture } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
        {/* Left: Brand & copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Aperture className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
              © {new Date().getFullYear()} {siteConfig.photographer.name}. All rights reserved.
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              High-performance cloud delivery powered by{' '}
              <span className="text-purple-600 dark:text-purple-400 font-semibold">ImageKit.io CDN</span>
            </p>
          </div>
        </div>

        {/* Center: Tech tags */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
          <span>React 18</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>ImageKit CDN</span>
        </div>

        {/* Right: Scroll to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-white bg-white dark:bg-zinc-900/60 hover:bg-purple-50/50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to Top</span>
        </button>
      </div>
    </footer>
  );
};
