import React, { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink, MessageCircle, Twitter, Facebook, Image as ImageIcon } from 'lucide-react';
import { getThumbnailUrl, getFullUrl } from '../utils/imagekit';

export const ShareModal = ({ isOpen, onClose, photo }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImageLink, setCopiedImageLink] = useState(false);

  if (!isOpen || !photo) return null;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?photo=${encodeURIComponent(photo.id)}`
    : '';
  const mediaUrl = getFullUrl(photo);
  const thumbUrl = getThumbnailUrl(photo);
  const shareText = `Check out "${photo.title}" on Aperture Photography!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleCopyImageLink = async () => {
    try {
      await navigator.clipboard.writeText(mediaUrl);
      setCopiedImageLink(true);
      setTimeout(() => setCopiedImageLink(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    },
    {
      name: 'Pinterest',
      icon: ExternalLink,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(thumbUrl)}&description=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-sm">
          <Share2 className="w-6 h-6" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Share Work
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Share this photograph or media directly with friends or across social media.
        </p>

        {/* Media Preview Card */}
        <div className="mt-5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3">
          <img
            src={thumbUrl}
            alt={photo.title}
            className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
              {photo.title}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {photo.location || photo.category}
            </p>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold ${opt.color} shadow-sm active:scale-95 transition-all text-center gap-1.5`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{opt.name}</span>
              </a>
            );
          })}
        </div>

        {/* Copy Link Input */}
        <div className="mt-5">
          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Direct Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 font-mono truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 active:scale-95 text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Copy Direct CDN Image Link */}
        <div className="mt-3">
          <button
            onClick={handleCopyImageLink}
            className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>{copiedImageLink ? 'Image URL Copied!' : 'Copy Direct Image CDN URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
