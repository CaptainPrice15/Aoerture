import React from 'react';
import { MapPin, Instagram, Twitter, Mail } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const HeroSection = () => {
  const { photographer } = siteConfig;

  return (
    <section className="relative overflow-hidden pt-8 pb-6 sm:pt-12 sm:pb-8 border-b border-slate-200/80 dark:border-zinc-800/40 transition-colors duration-300">
      {/* Decorative ambient radial blurs for both Light & Dark */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-purple-400/20 via-pink-400/15 to-transparent dark:from-purple-600/10 dark:via-pink-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-bl from-indigo-400/15 via-purple-300/10 to-transparent dark:from-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Location & Status Badge */}
          <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-purple-200/80 dark:border-zinc-800 text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-3.5 sm:mb-4 shadow-xs">
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

          {/* Heading + Social Media Icons side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.2] sm:leading-[1.15]">
              Visual Moments Captured Through{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 drop-shadow-xs">
                Light & Shadow
              </span>
              .
            </h1>

            {/* Social Links placed alongside the tagline */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <a
                href={photographer.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="p-2.5 sm:p-3 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white/90 dark:bg-zinc-900/90 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href={photographer.social.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                title="X / Twitter"
                className="p-2.5 sm:p-3 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white/90 dark:bg-zinc-900/90 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href={`mailto:${photographer.social.email}`}
                aria-label="Email"
                title="Email"
                className="p-2.5 sm:p-3 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white/90 dark:bg-zinc-900/90 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
