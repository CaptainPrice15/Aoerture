import { getAdminSession } from './adminSession.js';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4.2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm']);

const readBody = async (req) => {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return req.body;
    return JSON.stringify(req.body || {});
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) throw Object.assign(new Error('Upload request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

export const handleMediaUpload = async (req) => {
  if (req.method !== 'POST') return { status: 405, body: { error: 'Method not allowed.' }, allow: 'POST' };
  if (!getAdminSession(req)) return { status: 401, body: { error: 'Administrator sign-in is required to upload media.' } };

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return { status: 503, body: { error: 'ImageKit upload is not configured on the server.' } };

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (error) {
    return { status: error.status || 400, body: { error: error.status ? error.message : 'Invalid upload request.' } };
  }

  const { photo, fileDataUrl } = payload || {};
  if (!photo || typeof photo !== 'object' || typeof fileDataUrl !== 'string') {
    return { status: 400, body: { error: 'A photo record and selected media file are required.' } };
  }

  const match = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(fileDataUrl);
  if (!match || !ALLOWED_TYPES.has(match[1].toLowerCase())) {
    return { status: 415, body: { error: 'Use a JPG, PNG, WebP, GIF, AVIF, MP4, or WebM file.' } };
  }

  const fileBuffer = Buffer.from(match[2], 'base64');
  if (!fileBuffer.length || fileBuffer.length > MAX_FILE_BYTES) {
    return { status: 413, body: { error: 'Media files must be 3 MB or smaller.' } };
  }

  const mime = match[1].toLowerCase();
  const extension = mime.split('/')[1].replace('jpeg', 'jpg');
  const baseName = String(photo.title || 'gallery-upload').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80) || 'gallery-upload';
  const fileName = `${baseName}.${extension}`;
  const folder = typeof photo.folderPath === 'string' && /^\/[a-z0-9 _/-]*$/i.test(photo.folderPath) ? photo.folderPath : '/Pics';

  try {
    const form = new FormData();
    form.append('file', new Blob([fileBuffer], { type: mime }), fileName);
    form.append('fileName', fileName);
    form.append('folder', folder);
    form.append('useUniqueFileName', 'true');
    form.append('tags', ['gallery', photo.category, photo.folder].filter(Boolean).join(','));

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}` },
      body: form
    });
    const result = await response.json();
    if (!response.ok) return { status: 502, body: { error: result.message || 'ImageKit rejected the upload.' } };

    return {
      status: 201,
      body: {
        photo: {
          ...photo,
          id: result.fileId,
          src: result.filePath,
          thumbnail: result.thumbnailUrl,
          mime: result.fileType === 'non-image' ? mime : (result.mime || mime),
          mediaType: mime.startsWith('video/') ? 'video' : 'photo',
          width: result.width || photo.width,
          height: result.height || photo.height
        }
      }
    };
  } catch {
    return { status: 502, body: { error: 'Could not reach ImageKit. Please try again.' } };
  }
};
