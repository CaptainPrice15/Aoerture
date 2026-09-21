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
