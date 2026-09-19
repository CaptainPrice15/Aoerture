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
export const buildOptimizedUrl = (source, { width, height, quality = 80, blur = 0, crop } = {}) => {
  if (!source) return '';

  const endpoint = getEndpoint();

  // If this is an ImageKit-hosted image
  const isImageKit = source.startsWith('/') || source.includes('ik.imagekit.io');

  if (isImageKit) {
    let rawPath = source.startsWith('http')
      ? source.replace(/^https?:\/\/ik\.imagekit\.io\/[^/]+/, '')
      : source.startsWith('/') ? source : `/${source}`;

    // Separate clean path from any query parameters (e.g. ?updatedAt=...)
    const [cleanPath, queryPart] = rawPath.split('?');

    const transforms = [];
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    if (crop) transforms.push(`cm-${crop}`);
    if (quality) transforms.push(`q-${quality}`);
    if (blur > 0) transforms.push(`bl-${blur}`);
    transforms.push('f-auto'); // Auto-deliver WebP or AVIF based on browser

    const searchParams = new URLSearchParams(queryPart || '');
    if (transforms.length > 0) {
      searchParams.set('tr', transforms.join(','));
    }

    const queryString = searchParams.toString();
    return `${endpoint}${cleanPath}${queryString ? `?${queryString}` : ''}`;
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
  return buildOptimizedUrl(photo.src, {
    width: 800,
    quality: 82,
  });
};

/**
 * Helper to get tiny Low Quality Image Placeholder (LQIP) for instant blur-up
 */
export const getLqipUrl = (photo) => {
  return buildOptimizedUrl(photo.src, {
    width: 30,
    quality: 20,
    blur: 25,
  });
};

/**
 * Helper to get high-resolution image for Lightbox zoom inspection
 */
export const getFullUrl = (photo) => {
  return buildOptimizedUrl(photo.src, {
    width: 2560,
    quality: 92,
  });
};
