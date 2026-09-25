import React from 'react';
import { MapPin, Sparkles, Instagram, Twitter, Mail } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const HeroSection = ({ totalPhotos }) => {
  const { photographer } = siteConfig;
  const displayPhotosCount = totalPhotos !== undefined ? totalPhotos : photographer.stats.photosCount;

  return (
    <section className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-slate-200/80 dark:border-zinc-800/40 transition-colors duration-300">
      {/* Decorative ambient radial blurs for both Light & Dark */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-purple-400/20 via-pink-400/15 to-transparent dark:from-purple-600/10 dark:via-pink-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-bl from-indigo-400/15 via-purple-300/10 to-transparent dark:from-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Location & Status Badge */}
          <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-purple-200/80 dark:border-zinc-800 text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-4 sm:mb-5 shadow-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Based in {photographer.location}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 hidden xs:inline" />
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-purple-700 dark:text-purple-400 font-semibold">Available for Commissions</span>
            </div>
          </div>

          {/* High-Contrast Vibrant Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.2] sm:leading-[1.15]">
            Visual Moments Captured Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 drop-shadow-xs">
              Light & Shadow
            </span>
            .
          </h1>

          {/* Bio text */}
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            {photographer.bio}
          </p>

          {/* Stats Bar */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-8">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-6 text-center sm:text-left">
              <div className="p-2.5 sm:p-0 rounded-2xl bg-white/70 dark:bg-transparent border border-slate-200/60 dark:border-transparent sm:border-0 shadow-xs sm:shadow-none">
                <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                  {displayPhotosCount}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Curated Frames
                </p>
              </div>
              <div className="p-2.5 sm:p-0 rounded-2xl bg-white/70 dark:bg-transparent border border-slate-200/60 dark:border-transparent sm:border-0 shadow-xs sm:shadow-none">
                <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                  {photographer.stats.locationsCount}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Documented
                </p>
              </div>
              <div className="p-2.5 sm:p-0 rounded-2xl bg-white/70 dark:bg-transparent border border-slate-200/60 dark:border-transparent sm:border-0 shadow-xs sm:shadow-none">
                <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                  {photographer.stats.experience}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Behind Lens
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
              <a
                href={photographer.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={photographer.social.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${photographer.social.email}`}
                aria-label="Email"
                className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation"
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
