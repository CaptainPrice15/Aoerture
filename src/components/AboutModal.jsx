import React from 'react';
import { X, Camera, Mail, Instagram, Twitter, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { photographer } = siteConfig;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden flex flex-col z-10 my-4 sm:my-8 transition-colors duration-300">
        {/* Header background banner */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-purple-800/30 dark:from-purple-900/60 dark:via-indigo-900/40 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800/80 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 dark:bg-black/40 dark:hover:bg-black/70 text-zinc-800 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-0 relative overflow-y-auto flex-1">
          {/* Avatar */}
          <div className="-mt-10 sm:-mt-14 mb-3 sm:mb-4 flex items-end justify-between">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-950 shadow-xl bg-zinc-100 dark:bg-zinc-900 shrink-0">
              <img
                src={photographer.avatar}
                alt={photographer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <a
                href={photographer.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 border border-zinc-200 dark:border-zinc-800 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${photographer.social.email}`}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-colors"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Name & Title */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            {photographer.name}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono font-medium">
              Pro
            </span>
          </h2>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-mono mt-0.5">{photographer.handle}</p>

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            {photographer.bio}
          </p>

          {/* Gear Bag Section */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mb-4">
              <Camera className="w-4 h-4 text-purple-500" />
              <span>Tech & Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photographer.gearList.map((group) => (
                <div key={group.category} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/70">
                  <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-2 font-mono">
                    {group.category}
                  </h4>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Print & Licensing Info */}
          <div className="mt-6 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-purple-900 dark:text-purple-200">Licensing & Fine Art Prints</p>
              <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                All photographs are available for commercial editorial licensing and limited-edition archival museum prints. Inquire directly via email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
