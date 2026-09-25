import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Image as ImageIcon, Video, Check, Sparkles, AlertCircle, Eye, Upload, FileCode } from 'lucide-react';
import { buildOptimizedUrl, isVideoSource } from '../utils/imagekit';

export const AddMediaModal = ({ isOpen, onClose, onAddMedia, categories = [], folders = [] }) => {
  const [sourceType, setSourceType] = useState('upload'); // 'upload' or 'url'
  const [mediaType, setMediaType] = useState('photo');
  const [srcInput, setSrcInput] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pics');
  const [selectedFolder, setSelectedFolder] = useState('/Pics');
  const [customCategory, setCustomCategory] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3/2');
  const [location, setLocation] = useState('Local & Cloud Showcase');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

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

  // Process dropped or selected file
  const handleFileProcess = (file) => {
    if (!file) return;

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isImg && !isVid) {
      alert('Please upload an image or video file.');
      return;
    }

    setMediaType(isVid ? 'video' : 'photo');
    if (isVid) {
      setAspectRatio('16/9');
      if (category === 'Pics') setCategory('Videos');
    }

    setUploadedFileName(file.name);

    // Auto-generate clean title
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setTitle(cleanTitle);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setFileDataUrl(result);
        setSrcInput(result);

        // Auto-detect aspect ratio for images
        if (isImg) {
          const img = new Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            if (ratio > 1.6) setAspectRatio('16/9');
            else if (ratio >= 1.3 && ratio <= 1.6) setAspectRatio('3/2');
            else if (ratio >= 0.95 && ratio <= 1.05) setAspectRatio('1/1');
            else if (ratio >= 0.75 && ratio < 0.95) setAspectRatio('4/5');
            else if (ratio < 0.75) setAspectRatio('2/3');
          };
          img.src = result;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Normalize source path
  const getNormalizedSrc = () => {
    if (sourceType === 'upload' && fileDataUrl) {
      return fileDataUrl;
    }
    let clean = srcInput.trim();
    if (!clean) return '';
    if (clean.startsWith('http') || clean.startsWith('data:')) {
      return clean;
    }
    if (!clean.startsWith('/')) {
      const folderPrefix = selectedFolder === '/' ? '' : selectedFolder;
      clean = `${folderPrefix}/${clean}`;
    }
    return clean;
  };

  const normalizedSrc = getNormalizedSrc();
  const previewUrl = normalizedSrc.startsWith('data:')
    ? normalizedSrc
    : normalizedSrc
    ? buildOptimizedUrl(normalizedSrc, { asThumbnail: mediaType === 'video' })
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!normalizedSrc) return;

    setIsSubmitting(true);
    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'Gallery') : category;
    const isVid = mediaType === 'video' || isVideoSource(normalizedSrc);
    const folderName = selectedFolder === '/' ? 'Root Library' : selectedFolder.replace(/^\/+/, '');

    const newPhoto = {
      id: `custom-${Date.now()}`,
      title: title.trim() || (isVid ? 'New Video' : 'New Photo'),
      category: finalCategory,
      folder: folderName,
      folderPath: selectedFolder,
      mediaType: isVid ? 'video' : 'photo',
      location: location.trim() || 'Showcase Collection',
      date: new Date().toISOString().slice(0, 10),
      aspectRatio: aspectRatio,
      featured: false,
      description: description.trim() || (isVid ? `Original video: ${title}` : `Original photo: ${title}`),
      tags: [isVid ? 'video' : 'photo', finalCategory.toLowerCase(), folderName.toLowerCase()].filter(Boolean),
      src: normalizedSrc,
      exif: {
        camera: isVid ? 'Video Capture' : 'Digital Camera',
        lens: isVid ? '1080p HD' : 'Standard Prime',
        focalLength: 'Native',
        aperture: isVid ? 'MP4' : 'Auto',
        shutterSpeed: isVid ? 'Streaming' : '1/500s',
        iso: 'Auto'
      }
    };

    try {
      if (!normalizedSrc.startsWith('data:')) {
        // Try saving to local dev server file if not data url
        fetch('/api/add-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPhoto)
        }).catch(() => {});
      }

      onAddMedia(newPhoto);

      setSuccessMsg(`"${newPhoto.title}" added to gallery successfully!`);
      setTimeout(() => {
        setSuccessMsg('');
        setSrcInput('');
        setFileDataUrl('');
        setUploadedFileName('');
        setTitle('');
        setDescription('');
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl text-zinc-900 dark:text-zinc-100 shadow-2xl overflow-hidden flex flex-col z-10 my-4 sm:my-8 transition-colors duration-300">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Add Picture or Video</h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">Upload directly or link an ImageKit cloud file</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
          {/* Source Type Selector */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setSourceType('upload')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                sourceType === 'upload'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Direct File Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                sourceType === 'url'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>ImageKit URL / Path</span>
            </button>
          </div>

          {/* DRAG AND DROP UPLOAD ZONE */}
          {sourceType === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 scale-[0.99]'
                    : fileDataUrl
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-zinc-300 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 bg-zinc-50/50 dark:bg-zinc-900/40'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {uploadedFileName ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Selected: {uploadedFileName}
                      </span>
                    ) : (
                      'Drag & drop photo or video here'
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    or click to browse from your device (JPG, PNG, WebP, MP4)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                ImageKit Path or File URL <span className="text-purple-600 dark:text-purple-400">*</span>
              </label>
              <input
                type="text"
                required={sourceType === 'url'}
                value={srcInput}
                onChange={(e) => {
                  setSrcInput(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="e.g. /Pics/sunset.jpg or myvideo.mp4"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-sm sm:text-xs"
              />
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Enter relative path (e.g. <code className="font-mono">/Pics/photo.png</code>) or full ImageKit URL.
              </p>
            </div>
          )}

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

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mountain Twilight"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {categories
                  .filter((c) => c !== 'All' && c !== 'Folders')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                <option value="Custom">+ Custom Category...</option>
              </select>
            </div>
          </div>

          {category === 'Custom' && (
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Custom Category Name
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Wildlife or Street"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Folder & Aspect Ratio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Folder / Album Location
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="/">/ (Root Library)</option>
                {folders.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.name} ({f.path})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="3/2">3:2 (Standard Landscape)</option>
                <option value="2/3">2:3 (Portrait)</option>
                <option value="4/5">4:5 (Vertical)</option>
                <option value="16/9">16:9 (Widescreen / Video)</option>
                <option value="1/1">1:1 (Square)</option>
              </select>
            </div>
          </div>

          {/* Location & Description */}
          <div>
            <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              Location / Tagline
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Darjeeling, West Bengal"
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Behind the scenes story or technical details..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Live Preview Card */}
          {previewUrl && (
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="block font-semibold text-[11px] mb-2 text-zinc-600 dark:text-zinc-400">
                Live Preview
              </span>
              <div className="relative aspect-[3/2] max-h-48 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    src={normalizedSrc}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={() => setPreviewError(true)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Feedback & Submit Button */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

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
              disabled={isSubmitting || !normalizedSrc}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add to Showcase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
