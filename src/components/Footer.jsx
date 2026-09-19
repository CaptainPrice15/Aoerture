import React from 'react';
import { ArrowUp, Aperture, Cloud, Heart } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-zinc-800/60 bg-zinc-950/80 dark:bg-zinc-950/80 bg-white/80 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Brand & copyright */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Aperture className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              © {new Date().getFullYear()} {siteConfig.photographer.name}. All rights reserved.
            </p>
            <p className="text-[11px] text-zinc-500">
              Hosted on Free Cloud CDN via <span className="text-purple-400 font-medium">ImageKit.io</span>
            </p>
          </div>
        </div>

        {/* Center: Tech tags */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span>React</span>
          <span>•</span>
          <span>Tailwind</span>
          <span>•</span>
          <span>ImageKit CDN</span>
        </div>

        {/* Right: Scroll to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to Top</span>
        </button>
      </div>
    </footer>
  );
};
