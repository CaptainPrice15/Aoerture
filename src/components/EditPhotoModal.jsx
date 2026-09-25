import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getThumbnailUrl } from '../utils/imagekit';

export const EditPhotoModal = ({ isOpen, onClose, photo, onSave, categories = [], folders = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [folder, setFolder] = useState('');
  const [location, setLocation] = useState('');
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [camera, setCamera] = useState('');
  const [lens, setLens] = useState('');
  const [aperture, setAperture] = useState('');
  const [shutterSpeed, setShutterSpeed] = useState('');
  const [iso, setIso] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (photo && isOpen) {
      setTitle(photo.title || '');
      setDescription(photo.description || '');
      setCategory(photo.category || 'Pics');
      setFolder(photo.folder || '');
      setLocation(photo.location || '');
      setFeatured(!!photo.featured);
      setTags(Array.isArray(photo.tags) ? photo.tags.join(', ') : '');
      setCamera(photo.exif?.camera || '');
      setLens(photo.exif?.lens || '');
      setAperture(photo.exif?.aperture || '');
      setShutterSpeed(photo.exif?.shutterSpeed || '');
      setIso(photo.exif?.iso || '');
    }
  }, [photo, isOpen]);

  if (!isOpen || !photo) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedPhoto = {
      ...photo,
      title: title.trim() || photo.title,
      description: description.trim(),
      category: category.trim() || photo.category,
      folder: folder.trim() || photo.folder,
      folderPath: folder.trim() ? (folder.startsWith('/') ? folder : `/${folder}`) : photo.folderPath,
      location: location.trim(),
      featured,
      tags: parsedTags,
      exif: {
        ...(photo.exif || {}),
        camera: camera.trim(),
        lens: lens.trim(),
        aperture: aperture.trim(),
        shutterSpeed: shutterSpeed.trim(),
        iso: iso.trim()
      }
    };

    onSave(updatedPhoto);
    setIsSaving(false);
    onClose();
  };

  const thumbUrl = getThumbnailUrl(photo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden text-zinc-900 dark:text-zinc-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Edit Media Details
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Admin controls • Updates metadata in memory and local storage
            </p>
          </div>
        </div>

        {/* Media Preview Snippet */}
        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-3 mb-4 shrink-0">
          <img
            src={thumbUrl}
            alt={photo.title}
            className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
              {photo.title}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate block">
              ID: {photo.id}
            </span>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Mountains"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
                Folder / Album
              </label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="e.g. Kedarnath"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kedarnath, Uttarakhand"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="himalayas, temple, spiritual"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* EXIF Details */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Camera & Shot Details (EXIF)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Camera</label>
                <input
                  type="text"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  placeholder="Sony A7 IV"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Lens</label>
                <input
                  type="text"
                  value={lens}
                  onChange={(e) => setLens(e.target.value)}
                  placeholder="FE 24-70mm GM II"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Aperture</label>
                <input
                  type="text"
                  value={aperture}
                  onChange={(e) => setAperture(e.target.value)}
                  placeholder="f/2.8"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Shutter Speed</label>
                <input
                  type="text"
                  value={shutterSpeed}
                  onChange={(e) => setShutterSpeed(e.target.value)}
                  placeholder="1/1000s"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 block">
                  Featured Shot
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block">
                  Highlighted in showcase and sort priority
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
