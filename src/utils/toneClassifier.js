export const TONE_IDS = ['warm', 'emerald', 'blue', 'purple', 'mono'];
const IMAGE_SAMPLE_SIZE = 32;
const TONE_PIXEL_RATIO = 0.12;
const MONOCHROME_PIXEL_RATIO = 0.8;
const toneCache = new Map();

export function getExplicitToneMatches(photo, tone) {
  if (!TONE_IDS.includes(tone)) return false;

  const tags = Array.isArray(photo?.tags)
    ? photo.tags
    : typeof photo?.tags === 'string'
      ? photo.tags.split(/[;,]/)
      : [];

  return tags.some((tag) => {
    const normalized = String(tag).trim().toLowerCase().replace(/^tone:/, '');
    return normalized === tone || (tone === 'mono' && normalized === 'monochrome');
  });
}

export function classifyTonePixels(pixelData) {
  const counts = { warm: 0, emerald: 0, blue: 0, purple: 0, mono: 0 };
  let opaquePixelCount = 0;

  for (let index = 0; index + 3 < pixelData.length; index += 4) {
    const [red, green, blue, alpha] = pixelData.slice(index, index + 4);
    if (alpha < 128) continue;
    opaquePixelCount += 1;

    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const saturation = max === 0 ? 0 : delta / max;

    if (saturation <= 0.12) {
      counts.mono += 1;
      continue;
    }

    let hue;
    if (delta === 0) hue = 0;
    else if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
    if (hue < 0) hue += 360;

    if (hue < 65 || hue >= 345) counts.warm += 1;
    else if (hue < 170) counts.emerald += 1;
    else if (hue < 255) counts.blue += 1;
    else counts.purple += 1;
  }

  if (opaquePixelCount === 0) return [];

  const matches = TONE_IDS.filter((tone) => {
    const threshold = tone === 'mono' ? MONOCHROME_PIXEL_RATIO : TONE_PIXEL_RATIO;
    return counts[tone] / opaquePixelCount >= threshold;
  });
  return matches;
}

function sampleImagePixels(url) {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      reject(new Error('Image sampling is only available in a browser.'));
      return;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = IMAGE_SAMPLE_SIZE;
        canvas.height = IMAGE_SAMPLE_SIZE;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Canvas sampling is unavailable.');

        context.drawImage(image, 0, 0, IMAGE_SAMPLE_SIZE, IMAGE_SAMPLE_SIZE);
        resolve(context.getImageData(0, 0, IMAGE_SAMPLE_SIZE, IMAGE_SAMPLE_SIZE).data);
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error('Thumbnail could not be loaded.'));
    image.src = url;
  });
}

async function classifyPhoto(photo, url) {
  if (!url) return TONE_IDS.filter((tone) => getExplicitToneMatches(photo, tone));

  try {
    return classifyTonePixels(await sampleImagePixels(url));
  } catch {
    return TONE_IDS.filter((tone) => getExplicitToneMatches(photo, tone));
  }
}

export function getPhotoTones(photo, sampleUrl = photo?.thumbnail || photo?.src || '') {
  const cacheKey = `${photo?.id || ''}|${photo?.src || ''}|${photo?.thumbnail || ''}|${photo?.updatedAt || ''}|${sampleUrl}`;
  if (!toneCache.has(cacheKey)) toneCache.set(cacheKey, classifyPhoto(photo || {}, sampleUrl));
  return toneCache.get(cacheKey);
}

export async function classifyPhotosForTone(photos, tone, { concurrency = 4, onProgress, getSampleUrl } = {}) {
  const matches = new Set();
  let nextIndex = 0;
  let completed = 0;
  const workerCount = Math.min(Math.max(1, concurrency), photos.length);

  const worker = async () => {
    while (nextIndex < photos.length) {
      const index = nextIndex;
      nextIndex += 1;
      const photo = photos[index];
      const tones = await getPhotoTones(photo, getSampleUrl?.(photo));
      if (tones.includes(tone)) matches.add(photo.id);
      completed += 1;
      onProgress?.(completed, photos.length);
    }
  };

  await Promise.all(Array.from({ length: workerCount }, worker));
  return matches;
}
