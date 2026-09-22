import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Video, Check, Sparkles, AlertCircle, Eye } from 'lucide-react';
import { buildOptimizedUrl, isVideoSource } from '../utils/imagekit';

export const AddMediaModal = ({ isOpen, onClose, onAddMedia, categories = [] }) => {
  const [mediaType, setMediaType] = useState('photo');
  const [srcInput, setSrcInput] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pics');
  const [selectedFolder, setSelectedFolder] = useState('/Pics');
  const [customCategory, setCustomCategory] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3/2');
  const [location, setLocation] = useState('ImageKit /Pics Cloud');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Auto-fill title and media type when path is typed/pasted
  useEffect(() => {
    if (!srcInput) return;

    const isVid = isVideoSource(srcInput);
    if (isVid) {
      setMediaType('video');
      setAspectRatio('16/9');
      if (category === 'Pics') setCategory('Videos');
    }

    // Extract filename for title
    const filename = srcInput.split('/').pop()?.split('?')[0];
    if (filename && (!title || title === 'Untitled')) {
      const cleanTitle = decodeURIComponent(filename)
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanTitle);
    }
  }, [srcInput]);

  if (!isOpen) return null;

  // Normalize source path
  const getNormalizedSrc = () => {
    let clean = srcInput.trim();
    if (!clean) return '';
    if (clean.startsWith('http')) {
      return clean;
    }
    if (!clean.startsWith('/')) {
      const folderPrefix = selectedFolder === '/' ? '' : selectedFolder;
      clean = `${folderPrefix}/${clean}`;
    }
    return clean;
  };

  const normalizedSrc = getNormalizedSrc();
  const previewUrl = normalizedSrc ? buildOptimizedUrl(normalizedSrc, { asThumbnail: mediaType === 'video' }) : '';
  const fullMediaUrl = normalizedSrc ? buildOptimizedUrl(normalizedSrc) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!srcInput.trim()) return;

    setIsSubmitting(true);
    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Gallery') : category;
    const cleanSrc = getNormalizedSrc();
    const isVid = mediaType === 'video' || isVideoSource(cleanSrc);
    const folderName = selectedFolder === '/' ? 'Root Library' : selectedFolder.replace(/^\/+/, '');

    const newPhoto = {
      id: `custom-${Date.now()}`,
      title: title.trim() || (isVid ? 'New Video' : 'New Photo'),
      category: finalCategory,
      folder: folderName,
      folderPath: selectedFolder,
      mediaType: isVid ? 'video' : 'photo',
      location: location.trim() || `ImageKit ${selectedFolder} Cloud`,
      date: new Date().toISOString().slice(0, 10),
      aspectRatio: aspectRatio,
      featured: false,
      description: description.trim() || (isVid ? `Original video streamed from ImageKit: ${title}` : `Original photo streamed from ImageKit: ${title}`),
      tags: [isVid ? 'video' : 'photo', 'imagekit', finalCategory.toLowerCase(), folderName.toLowerCase()].filter(Boolean),
      src: cleanSrc,
      exif: {
        camera: isVid ? 'ImageKit Video CDN' : 'Cloud Uploaded Photo',
        lens: isVid ? '1080p HD' : 'ImageKit Media Library',
        focalLength: 'Native',
        aperture: isVid ? 'MP4' : 'Auto',
        shutterSpeed: isVid ? 'Streaming CDN' : 'Instant',
        iso: '20GB Free CDN'
      }
    };

    try {
      // 1. Try to save to local server file (Vite dev server)
      fetch('/api/add-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      }).catch(() => {
        // Silently continue if API endpoint not supported
      });

      // 2. Add to active React state
      onAddMedia(newPhoto);

      setSuccessMsg(`"${newPhoto.title}" added to gallery successfully!`);
      setTimeout(() => {
        setSuccessMsg('');
        setSrcInput('');
        setTitle('');
        setDescription('');
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden z-10 my-8 transition-colors duration-300">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Add Picture or Video</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Add an uploaded ImageKit file directly to your showcase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Media Type Toggle */}
          <div>
            <label className="block font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Media Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMediaType('photo');
                  if (aspectRatio === '16/9') setAspectRatio('3/2');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-medium transition-all ${
                  mediaType === 'photo'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo (JPG, PNG, WebP)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setAspectRatio('16/9');
                  if (category === 'Pics') setCategory('Videos');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-medium transition-all ${
                  mediaType === 'video'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video (MP4, MOV, WebM)</span>
              </button>
            </div>
          </div>

          {/* File Path or URL Input */}
          <div>
            <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              ImageKit Path or File Name <span className="text-purple-600 dark:text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={srcInput}
              onChange={(e) => {
                setSrcInput(e.target.value);
                setPreviewError(false);
              }}
              placeholder="e.g. /Pics/sunset.jpg or myvideo.mp4"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-xs"
            />
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Enter relative path (e.g. <code className="font-mono">/Pics/photo.png</code>) or full ImageKit URL.
            </p>
          </div>

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mountain Dawn"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs cursor-pointer"
              >
                <option value="Pics">Pics</option>
                <option value="Videos">Videos</option>
                <option value="Gallery">Gallery</option>
                <option value="Custom">+ New Category...</option>
              </select>
            </div>
          </div>

          {/* Cloud Folder Destination */}
          <div>
            <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              Cloud Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs cursor-pointer font-mono"
            >
              <option value="/Pics">/Pics</option>
              <option value="/Darjeeling">/Darjeeling</option>
              <option value="/Sikkim">/Sikkim</option>
              <option value="/">/ (Root Library)</option>
            </select>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Select which cloud folder this item is organized into.
            </p>
          </div>

          {/* Custom Category if selected */}
          {category === 'Custom' && (
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Architecture or Drone"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
              />
            </div>
          )}

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block font-semibold mb-1.5 text-zinc-700 dark:text-zinc-300">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '3:2 Landscape', val: '3/2' },
                { label: '16:9 Video/Cinema', val: '16/9' },
                { label: '1:1 Square', val: '1/1' },
                { label: '4:5 Portrait', val: '4/5' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAspectRatio(opt.val)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-mono text-[11px] transition-all ${
                    aspectRatio === opt.val
                      ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          {normalizedSrc && (
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 mb-2 text-zinc-500 dark:text-zinc-400 font-semibold text-[11px]">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black/10 dark:bg-black/30 aspect-video flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    src={fullMediaUrl}
                    poster={previewUrl}
                    controls
                    className="w-full h-full object-contain"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={() => setPreviewError(true)}
                  />
                )}

                {previewError && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
                    <AlertCircle className="w-5 h-5 text-amber-400 mb-1" />
                    <p className="text-zinc-200 text-xs">Could not load preview</p>
                    <p className="text-zinc-400 text-[10px] mt-0.5 max-w-xs">
                      Double check that the file is uploaded to ImageKit with this exact name.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !srcInput.trim()}
              className="px-5 py-2 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add to Gallery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
