import React from 'react';
import { ArrowUp, Aperture } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left">
        {/* Left: Brand & copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
            <Aperture className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              © {new Date().getFullYear()} {siteConfig.photographer.name}. All rights reserved.
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Hosted on Free Cloud CDN via <span className="text-purple-600 dark:text-purple-400 font-medium">ImageKit.io</span>
            </p>
          </div>
        </div>

        {/* Center: Tech tags */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
          <span>React</span>
          <span>•</span>
          <span>Tailwind</span>
          <span>•</span>
          <span>ImageKit CDN</span>
        </div>

        {/* Right: Scroll to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to Top</span>
        </button>
      </div>
    </footer>
  );
};
