import React, { useState, useEffect } from 'react';
import {
  Camera,
  Aperture,
  Sun,
  Moon,
  Cloud,
  Plus,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  UserPlus,
  LogIn,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Instagram,
  Twitter,
  Mail
} from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
  theme,
  toggleTheme,
  onOpenAbout,
  onOpenCloudGuide,
  onOpenAddMedia,
  onOpenLogin,
  totalPhotos
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-zinc-950/85 border-b border-slate-200/80 dark:border-zinc-800/60 shadow-[0_1px_12px_rgba(0,0,0,0.03)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand / Logo */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 p-0.5 shadow-md shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all shrink-0">
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center transition-colors">
                <Aperture className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">{siteConfig.photographer.name}</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 font-mono font-semibold shrink-0 hidden xs:inline-flex">
                  {totalPhotos} Works
                </span>
              </span>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block truncate">
                {siteConfig.photographer.title}
              </p>
            </div>
          </a>

          {/* Desktop Action Buttons (Visible sm: and up) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Add Media Button */}
            <button
              onClick={onOpenAddMedia}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 shadow-md shadow-purple-600/25 transition-all touch-manipulation cursor-pointer"
              title="Add Picture or Video"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Media</span>
            </button>

            {/* Cloud Storage Guide Modal Trigger */}
            <button
              onClick={onOpenCloudGuide}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/80 dark:border-purple-800/50 shadow-xs active:scale-95 transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer"
              title="ImageKit.io Cloud Setup Guide"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ImageKit CDN</span>
            </button>

            {/* About / Gear Modal Trigger */}
            <button
              onClick={onOpenAbout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer"
              title="About & Gear"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>About</span>
              <span className="hidden lg:inline">& Gear</span>
            </button>

            {/* Auth State Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                {user?.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 shadow-xs"
                    title={user?.email || 'Registered User'}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[100px] truncate">{user?.name || 'Member'}</span>
                  </span>
                )}
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/40 shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenLogin && onOpenLogin('signin')}
                  title="Sign In"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-zinc-900 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 border border-slate-200/90 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenLogin && onOpenLogin('signup')}
                  title="Sign Up"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/80 dark:border-purple-800/50 shadow-xs active:scale-95 transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="p-2 sm:p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/90 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform -rotate-12 hover:rotate-0 duration-300" />
              )}
            </button>
          </div>

          {/* Mobile Action Buttons (Visible only below sm: <640px) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            {/* Quick Add Media Button */}
            <button
              onClick={onOpenAddMedia}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 active:scale-95 shadow-md shadow-purple-600/25 transition-all touch-manipulation cursor-pointer"
              title="Add Media"
              aria-label="Add Picture or Video"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Add</span>
            </button>

            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className={`p-2 rounded-xl border transition-all active:scale-95 touch-manipulation cursor-pointer relative ${
                isMobileMenuOpen
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 border-slate-200/90 dark:border-zinc-800 shadow-xs'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              {/* Active dot if authenticated */}
              {isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 sm:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[340px] bg-white dark:bg-zinc-950 border-l border-slate-200/90 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out sm:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4">
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Aperture className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {siteConfig.photographer.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {siteConfig.photographer.title}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 transition-all active:scale-95 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Account / Authentication Section */}
          {isAuthenticated ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200/70 dark:border-purple-800/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {user?.name || 'Member'}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {user?.email || 'member@gallery.app'}
                    </p>
                  </div>
                </div>
                {user?.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 shrink-0">
                    <User className="w-3 h-3" />
                    Member
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-800/40 transition-all active:scale-98 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-2.5">
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Account & Favorites
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Sign in to like photos and customize your collection.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLogin && onOpenLogin('signin');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-zinc-700 border border-slate-200/90 dark:border-zinc-700 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLogin && onOpenLogin('signup');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm shadow-purple-600/25 transition-all active:scale-98 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Action: Add Media Banner */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenAddMedia();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 text-left active:scale-98 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Add Media</p>
                <p className="text-[11px] text-purple-100 opacity-90">Upload photo or video</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* App Navigation Rows */}
          <div className="flex flex-col gap-2">
            {/* About & Gear Trigger */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 hover:bg-purple-50/60 dark:hover:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-800/80 text-left transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">About & Gear</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Photographer bio & equipment</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Cloud CDN Guide Trigger */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCloudGuide();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 hover:bg-purple-50/60 dark:hover:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-800/80 text-left transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">ImageKit CDN Guide</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Cloud setup & media streaming</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Theme Selector Segmented Row */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Theme</span>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 capitalize">
                {theme} Mode
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-800/80">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-950 text-white shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-600" />
              {siteConfig.photographer.location}
            </span>
            <span className="font-mono">{totalPhotos} Curated Works</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            {siteConfig.photographer.social?.instagram && (
              <a
                href={siteConfig.photographer.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {siteConfig.photographer.social?.twitter && (
              <a
                href={siteConfig.photographer.social.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {siteConfig.photographer.social?.email && (
              <a
                href={`mailto:${siteConfig.photographer.social.email}`}
                aria-label="Email"
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-purple-600 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
