import React from 'react';
import { Camera, Aperture, Sun, Moon, Cloud, Plus, Lock, LogOut, ShieldCheck, User, UserPlus, LogIn } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ theme, toggleTheme, onOpenAbout, onOpenCloudGuide, onOpenAddMedia, onOpenLogin, totalPhotos }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200 dark:border-zinc-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all shrink-0">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center transition-colors">
              <Aperture className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">{siteConfig.photographer.name}</span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono font-medium shrink-0">
                {totalPhotos} Works
              </span>
            </span>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block truncate">
              {siteConfig.photographer.title}
            </p>
          </div>
        </a>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Add Media Button */}
          <button
            onClick={onOpenAddMedia}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/20 transition-all touch-manipulation"
            title="Add Picture or Video"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Media</span>
            <span className="sm:hidden text-[11px]">Add</span>
          </button>

          {/* Cloud Storage Guide Modal Trigger */}
          <button
            onClick={onOpenCloudGuide}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 active:scale-95 transition-all touch-manipulation flex items-center gap-1.5"
            title="ImageKit.io Cloud Setup Guide"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ImageKit CDN</span>
          </button>

          {/* About / Gear Modal Trigger */}
          <button
            onClick={onOpenAbout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all touch-manipulation flex items-center gap-1.5"
            title="About & Gear"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">About</span>
            <span className="hidden lg:inline">& Gear</span>
          </button>

          {/* Auth State Buttons: Sign In & Sign Up when guest, User/Admin Badge & Logout when authenticated */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm"
                  title={user?.email || 'Registered User'}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || 'Member'}</span>
                </span>
              )}
              <button
                onClick={logout}
                title="Log out"
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/40 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => onOpenLogin && onOpenLogin('signin')}
                title="Sign In"
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
              <button
                onClick={() => onOpenLogin && onOpenLogin('signup')}
                title="Sign Up"
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 active:scale-95 transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Sign Up</span>
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="p-2 sm:p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all touch-manipulation"
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
