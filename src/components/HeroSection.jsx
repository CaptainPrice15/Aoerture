import React from 'react';
import { MapPin, Sparkles, Instagram, Twitter, Github, Mail, SlidersHorizontal } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const HeroSection = ({ totalPhotos, onScrollToGallery }) => {
  const { photographer } = siteConfig;
  const displayPhotosCount = totalPhotos !== undefined ? totalPhotos : photographer.stats.photosCount;

  return (
    <section className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-zinc-200 dark:border-zinc-800/40 transition-colors duration-300">
      {/* Subtle background ambient radial light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Location Badge */}
          <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-4 sm:mb-5 max-w-full">
            <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Based in {photographer.location}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 hidden xs:inline" />
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Available for Commissions</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.2] sm:leading-[1.15]">
            Visual Moments Captured Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Light & Shadow</span>.
          </h1>

          {/* Bio text */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
            {photographer.bio}
          </p>

          {/* Stats Bar */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-8">
            {/* 3-Col Stats Grid on Mobile, Flex with Dividers on Desktop */}
            <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800/80 sm:divide-x-0 sm:flex sm:items-center sm:gap-8 text-center sm:text-left">
              <div className="px-2 sm:px-0">
                <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white">{displayPhotosCount}</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">Curated Frames</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
              <div className="px-2 sm:px-0">
                <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white">{photographer.stats.locationsCount}</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">Documented</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
              <div className="px-2 sm:px-0">
                <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white">{photographer.stats.experience}</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">Behind Lens</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
              <a
                href={photographer.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all touch-manipulation"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={photographer.social.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all touch-manipulation"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${photographer.social.email}`}
                aria-label="Email"
                className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all touch-manipulation"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
