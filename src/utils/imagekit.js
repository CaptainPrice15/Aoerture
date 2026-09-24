import { siteConfig } from '../data/siteConfig';

/**
 * ImageKit transformation helper
 * Documentation: https://docs.imagekit.io/features/image-transformations
 */

const getEndpoint = () => {
  const endpoint = siteConfig.imagekit.urlEndpoint.replace(/\/+$/, '');
  return endpoint;
};

/**
 * Builds an optimized ImageKit or external CDN URL with query transformations
 *
 * @param {string} source - ImageKit relative path (e.g. "/photos/sunset.jpg") or absolute URL
 * @param {object} options - Transformation options { width, height, quality, blur, crop }
 * @returns {string} Fully formed image URL
 */
/**
 * Checks if a file path or URL points to a video format
 */
export const isVideoSource = (source) => {
  if (!source) return false;
  const clean = source.split('?')[0].toLowerCase();
  return /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(clean);
};

/**
 * Builds an optimized ImageKit or external CDN URL with query transformations
 *
 * @param {string} source - ImageKit relative path (e.g. "/photos/sunset.jpg") or absolute URL
 * @param {object} options - Transformation options { width, height, quality, blur, crop, asThumbnail }
 * @returns {string} Fully formed image/video URL
 */
export const buildOptimizedUrl = (
  source,
  { width, height, quality = 80, blur = 0, crop, asThumbnail = false } = {}
) => {
  if (!source) return '';

  const endpoint = getEndpoint();

  // If this is an ImageKit-hosted asset
  const isImageKit = source.startsWith('/') || source.includes('ik.imagekit.io');

  if (isImageKit) {
    let rawPath = source.startsWith('http')
      ? source.replace(/^https?:\/\/ik\.imagekit\.io\/[^/]+/, '')
      : source.startsWith('/') ? source : `/${source}`;

    // Separate clean path from any query parameters (e.g. ?updatedAt=...)
    const [cleanPath, queryPart] = rawPath.split('?');
    const isVideo = isVideoSource(cleanPath);

    // If it's a video and thumbnail is requested, append /ik-thumbnail.jpg
    const finalPath = isVideo && asThumbnail
      ? `${cleanPath}/ik-thumbnail.jpg`
      : cleanPath;

    const transforms = [];
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (crop) transforms.push(`cm-${crop}`);
    if (quality) transforms.push(`q-${quality}`);
    if (blur > 0) transforms.push(`bl-${blur}`);
    
    // For images or video thumbnails, deliver auto-WebP/AVIF
    if (!isVideo || asThumbnail) {
      transforms.push('f-auto');
    }

    const searchParams = new URLSearchParams(queryPart || '');
    if (transforms.length > 0) {
      searchParams.set('tr', transforms.join(','));
    }

    const queryString = searchParams.toString();
    return `${endpoint}${finalPath}${queryString ? `?${queryString}` : ''}`;
  }

  // If this is an Unsplash fallback image for previewing out-of-the-box
  if (source.includes('images.unsplash.com')) {
    const url = new URL(source);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    if (blur > 0) url.searchParams.set('blur', blur.toString());
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  // Fallback direct URL
  return source;
};

/**
 * Helper to get standard thumbnail for masonry grid
 */
export const getThumbnailUrl = (photo) => {
  if (photo.thumbnail) return photo.thumbnail;
  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  return buildOptimizedUrl(photo.src, {
    width: 800,
    quality: 82,
    asThumbnail: isVideo,
  });
};

/**
 * Helper to get tiny Low Quality Image Placeholder (LQIP) for instant blur-up
 */
export const getLqipUrl = (photo) => {
  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  return buildOptimizedUrl(photo.src, {
    width: 30,
    quality: 20,
    blur: 25,
    asThumbnail: isVideo,
  });
};

/**
 * Helper to get high-resolution media URL (image or full video)
 */
export const getFullUrl = (photo) => {
  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  if (isVideo) {
    return buildOptimizedUrl(photo.src);
  }
  return buildOptimizedUrl(photo.src, {
    width: 2560,
    quality: 92,
  });
};

/**
 * Generates a clean, user-friendly filename for downloading
 */
export const getDownloadFilename = (photo) => {
  if (!photo) return 'photo.jpg';
  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  
  let ext = isVideo ? 'mp4' : 'jpg';
  if (photo.src) {
    const cleanSrc = photo.src.split('?')[0];
    const match = cleanSrc.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      const parsedExt = match[1].toLowerCase();
      // If HEIC, convert to jpg for universal compatibility
      ext = parsedExt === 'heic' ? 'jpg' : parsedExt;
    }
  } else if (photo.mime) {
    const sub = photo.mime.split('/')[1]?.toLowerCase();
    if (sub) {
      ext = sub === 'heic' ? 'jpg' : sub.replace('jpeg', 'jpg');
    }
  }

  const baseTitle = photo.title || photo.id || 'download';
  // Replace invalid filesystem characters: \ / : * ? " < > |
  const cleanTitle = baseTitle.replace(/[/\\?%*:|"<>]/g, '_').trim();
  
  if (cleanTitle.toLowerCase().endsWith(`.${ext}`)) {
    return cleanTitle;
  }
  return `${cleanTitle}.${ext}`;
};

/**
 * Gets high-resolution download URL with ik-attachment parameter for direct downloading
 */
export const getDownloadUrl = (photo) => {
  if (!photo || !photo.src) return '';
  const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
  const rawUrl = isVideo
    ? buildOptimizedUrl(photo.src)
    : buildOptimizedUrl(photo.src, { quality: 95 });

  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('imagekit.io')) {
      url.searchParams.set('ik-attachment', 'true');
    }
    return url.toString();
  } catch (e) {
    if (rawUrl.includes('imagekit.io')) {
      const sep = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${sep}ik-attachment=true`;
    }
    return rawUrl;
  }
};

/**
 * Downloads a photo or video with seamless blob creation and fallback
 */
export const downloadMedia = async (photo) => {
  if (!photo) return false;
  const filename = getDownloadFilename(photo);
  const downloadUrl = getDownloadUrl(photo);
  const fullUrl = getFullUrl(photo);

  try {
    // Attempt blob download for direct in-browser download with custom filename
    const response = await fetch(fullUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
    return true;
  } catch (err) {
    console.warn('Direct blob download failed, falling back to download attachment link:', err);
    // Fallback: trigger download using ImageKit ik-attachment parameter
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
};

