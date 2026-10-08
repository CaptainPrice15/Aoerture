import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
  adminAuthIsConfigured,
  createAdminToken,
  getAdminSession,
  setAdminCookie,
  clearAdminCookie,
  verifyAdminPassword
} from './server/adminSession.js';
import { handleMediaUpload } from './server/uploadMedia.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.ADMIN_PASSWORD) process.env.ADMIN_PASSWORD ||= env.ADMIN_PASSWORD;
  if (env.SESSION_SECRET) process.env.SESSION_SECRET ||= env.SESSION_SECRET;
  if (env.IMAGEKIT_PRIVATE_KEY) process.env.IMAGEKIT_PRIVATE_KEY ||= env.IMAGEKIT_PRIVATE_KEY;

  return {
    plugins: [
      react(),
      {
        name: 'imagekit-api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.split('?')[0] === '/api/auth') {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store');
              if (req.method === 'GET') {
                res.end(JSON.stringify({ authenticated: getAdminSession(req) }));
                return;
              }
              if (req.method === 'DELETE') {
                clearAdminCookie(req, res);
                res.end(JSON.stringify({ authenticated: false }));
                return;
              }
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Allow', 'GET, POST, DELETE');
                res.end(JSON.stringify({ error: 'Method not allowed.' }));
                return;
              }
              if (!adminAuthIsConfigured()) {
                res.statusCode = 503;
                res.end(JSON.stringify({ error: 'Set ADMIN_PASSWORD and a SESSION_SECRET of at least 32 characters.' }));
                return;
              }
              let body = '';
              let bodyTooLarge = false;
              req.on('data', (chunk) => {
                body += chunk;
                if (body.length > 8192) bodyTooLarge = true;
              });
              req.on('end', () => {
                if (bodyTooLarge) {
                  res.statusCode = 413;
                  res.end(JSON.stringify({ error: 'Request body is too large.' }));
                  return;
                }
                try {
                  const { password } = JSON.parse(body || '{}');
                  if (!verifyAdminPassword(password)) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Invalid administrator password.' }));
                    return;
                  }
                  setAdminCookie(req, res, createAdminToken());
                  res.end(JSON.stringify({ authenticated: true, user: { id: 'admin', name: 'Admin', email: 'admin', role: 'admin' } }));
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid request body.' }));
                }
              });
              return;
            }

            if (req.url?.split('?')[0] === '/api/add-photo') {
              const result = await handleMediaUpload(req);
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store');
              if (result.allow) res.setHeader('Allow', result.allow);
              res.end(JSON.stringify(result.body));
              return;
            }

            if (req.url?.split('?')[0] === '/api/photos' && req.method === 'GET') {
              const privateKey = env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY;
              const defaultFolders = [
                { name: 'Pics', path: '/Pics' },
                { name: 'Darjeeling', path: '/Darjeeling' },
                { name: 'Sikkim', path: '/Sikkim' },
                { name: 'Kedarnath', path: '/Kedarnath' },
                { name: 'Badrinath', path: '/Badrinath' },
                { name: 'Haridwar', path: '/Haridwar' },
                { name: 'Tunganath', path: '/Tunganath' }
              ];

              if (!privateKey) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  configured: false,
                  photos: [],
                  folders: defaultFolders
                }));
                return;
              }
              try {
                const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');
                const [foldersRes, filesRes] = await Promise.all([
                  fetch('https://api.imagekit.io/v1/files?path=%2F&type=folder', {
                    headers: { Authorization: authHeader }
                  }).catch(() => null),
                  fetch('https://api.imagekit.io/v1/files?limit=1000', {
                    headers: { Authorization: authHeader }
                  })
                ]);

                let ikFolders = [];
                if (foldersRes && foldersRes.ok) {
                  try {
                    const foldersData = await foldersRes.json();
                    if (Array.isArray(foldersData)) {
                      ikFolders = foldersData.map((f) => ({
                        name: f.name,
                        path: f.folderPath || (f.name.startsWith('/') ? f.name : `/${f.name}`)
                      }));
                    }
                  } catch (fErr) {
                    console.error('Error parsing folders from ImageKit:', fErr);
                  }
                }

                if (!filesRes.ok) {
                  const errText = await filesRes.text();
                  res.statusCode = filesRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: errText, configured: true, photos: [], folders: defaultFolders }));
                  return;
                }

                const files = await filesRes.json();
                const mediaFiles = Array.isArray(files)
                  ? files.filter((f) => {
                      if (f.type === 'folder') return false;
                      if (f.name === 'default-image.jpg') return false;

                      const isVideo =
                        (f.mime && f.mime.startsWith('video/')) ||
                        (f.fileType === 'non-image' && /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(f.name)) ||
                        /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(f.name);

                      const isImage =
                        (f.mime && f.mime.startsWith('image/')) ||
                        f.fileType === 'image' ||
                        /\.(jpe?g|png|webp|avif|gif|svg|heic|heif)$/i.test(f.name);

                      return isVideo || isImage;
                    })
                  : [];

                const baseNames = ['Pics', 'Darjeeling', 'Sikkim', 'Kedarnath', 'Badrinath', 'Haridwar', 'Tunganath'];
                const allFolderNames = Array.from(new Set([...ikFolders.map((f) => f.name), ...baseNames]));

                const mappedMedia = mediaFiles.map((file, idx) => {
                  const isVideo =
                    (file.mime && file.mime.startsWith('video/')) ||
                    /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);

                  // Extract top folder name dynamically if present (e.g. /Pics/img.jpg -> "Pics")
                  let folderName = 'Root Library';
                  let folderPath = '/';
                  if (file.filePath) {
                    const parts = file.filePath.split('/').filter(Boolean);
                    if (parts.length > 1) {
                      folderName = parts[0];
                      folderPath = `/${parts[0]}`;
                    }
                  }

                  // Check tags for any known folder name (case-insensitive)
                  if (folderPath === '/' && Array.isArray(file.tags)) {
                    for (const f of allFolderNames) {
                      if (file.tags.some((t) => t.toLowerCase() === f.toLowerCase())) {
                        folderName = f;
                        folderPath = `/${f}`;
                        break;
                      }
                    }
                  }

                  // Check filename for any known folder name (case-insensitive)
                  if (folderPath === '/') {
                    const nameLower = (file.name || '').toLowerCase();
                    for (const f of allFolderNames) {
                      if (f.toLowerCase() !== 'pics' && nameLower.includes(f.toLowerCase())) {
                        folderName = f;
                        folderPath = `/${f}`;
                        break;
                      }
                    }
                  }

                  // Known upload batches
                  if (folderPath === '/') {
                    const created = file.createdAt || '';
                    if (created.startsWith('2026-10-02')) {
                      folderName = 'Tunganath';
                      folderPath = '/Tunganath';
                    } else if (created.startsWith('2026-09-22T15:3')) {
                      folderName = 'Kedarnath';
                      folderPath = '/Kedarnath';
                    } else if (created.startsWith('2026-09-22T15:4')) {
                      folderName = 'Badrinath';
                      folderPath = '/Badrinath';
                    } else if (created.startsWith('2026-09-22T15:5')) {
                      folderName = 'Haridwar';
                      folderPath = '/Haridwar';
                    }
                  }

                  // Fallback based on verified trip dates
                  if (folderPath === '/') {
                    const dateMatch = file.name.match(/^(?:IMG|VID)[_]?(\d{8})[_]?(\d{6})?/i);
                    const metaDate = file.embeddedMetadata?.DateTimeOriginal?.replace(/[-:T ]/g, '') || '';
                    const dateKey = metaDate.slice(0, 8) || (dateMatch ? dateMatch[1] : '');
                    const timeKey = metaDate.slice(8, 14) || (dateMatch && dateMatch[2] ? dateMatch[2] : '');

                    if (dateKey >= '20231028' && dateKey <= '20231030') {
                      folderName = 'Darjeeling';
                      folderPath = '/Darjeeling';
                    } else if (dateKey >= '20231031' && dateKey <= '20231103') {
                      folderName = 'Sikkim';
                      folderPath = '/Sikkim';
                    } else if (dateKey === '20250523') {
                      folderName = 'Haridwar';
                      folderPath = '/Haridwar';
                    } else if (dateKey >= '20250524' && dateKey <= '20250526') {
                      folderName = 'Kedarnath';
                      folderPath = '/Kedarnath';
                    } else if (dateKey === '20250527') {
                      if (timeKey && timeKey >= '180000') {
                        folderName = 'Badrinath';
                        folderPath = '/Badrinath';
                      } else {
                        folderName = 'Kedarnath';
                        folderPath = '/Kedarnath';
                      }
                    } else if (dateKey >= '20250528' && dateKey <= '20250529') {
                      folderName = 'Badrinath';
                      folderPath = '/Badrinath';
                    } else if (dateKey === '20250530' || dateKey === '20260502') {
                      folderName = 'Haridwar';
                      folderPath = '/Haridwar';
                    } else if (dateKey >= '20260503' && dateKey <= '20260504') {
                      folderName = 'Tunganath';
                      folderPath = '/Tunganath';
                    } else if (dateKey === '20260505') {
                      if (timeKey && timeKey >= '180000') {
                        folderName = 'Haridwar';
                        folderPath = '/Haridwar';
                      } else {
                        folderName = 'Tunganath';
                        folderPath = '/Tunganath';
                      }
                    } else if (dateKey === '20260506') {
                      folderName = 'Haridwar';
                      folderPath = '/Haridwar';
                    } else if (dateKey >= '20260507') {
                      folderName = 'Tunganath';
                      folderPath = '/Tunganath';
                    }
                  }

                  const category = (folderName !== 'Root Library' ? folderName : '') || (isVideo ? 'Videos' : 'Pics');

                  const meta = file.embeddedMetadata || {};
                  const cameraModel = [meta.Make, meta.Model].filter(Boolean).join(' ').replace(/realme\s+realme/i, 'realme');

                  let shotDate = meta.DateTimeOriginal
                    ? meta.DateTimeOriginal.slice(0, 10)
                    : (file.createdAt ? file.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10));

                  const fileDateMatch = file.name.match(/^(?:IMG|VID)[_]?(\d{4})(\d{2})(\d{2})/i);
                  if (fileDateMatch && (!meta.DateTimeOriginal || shotDate.startsWith('2026-09') || shotDate.startsWith('2026-10'))) {
                    shotDate = `${fileDateMatch[1]}-${fileDateMatch[2]}-${fileDateMatch[3]}`;
                  }

                  let title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                  const imgMatch = file.name.match(/^(?:IMG)[_]?(\d{4})(\d{2})(\d{2})[_]?(\d{2})(\d{2})/i);
                  const vidMatch = file.name.match(/^(?:VID)[_]?(\d{4})(\d{2})(\d{2})[_]?(\d{2})(\d{2})/i);
                  if (imgMatch) {
                    title = `Frame ${imgMatch[1]}-${imgMatch[2]}-${imgMatch[3]} ${imgMatch[4]}:${imgMatch[5]}`;
                  } else if (vidMatch) {
                    title = `Reel ${vidMatch[1]}-${vidMatch[2]}-${vidMatch[3]} ${vidMatch[4]}:${vidMatch[5]}`;
                  }

                  return {
                    id: file.fileId || `ik-${idx}`,
                    title: title,
                    category: category,
                    folder: folderName,
                    folderPath: folderPath,
                    mediaType: isVideo ? 'video' : 'photo',
                    mime: file.mime || (isVideo ? 'video/mp4' : 'image/jpeg'),
                    location: folderName ? `ImageKit /${folderName}` : (isVideo ? 'ImageKit Video Stream' : 'ImageKit Media Library'),
                    date: shotDate,
                    aspectRatio: file.width && file.height
                      ? (file.width === file.height ? '1/1' : file.width > file.height ? (isVideo ? '16/9' : '3/2') : '4/5')
                      : (isVideo ? '16/9' : '3/2'),
                    width: file.width || (isVideo ? 1920 : 1200),
                    height: file.height || (isVideo ? 1080 : 800),
                    featured: idx === 0,
                    description: isVideo
                      ? `Original video streamed directly from your ImageKit cloud: ${file.name}`
                      : `Original photo streamed from your ImageKit cloud folder: ${file.name}`,
                    tags: file.tags && file.tags.length > 0
                      ? file.tags
                      : [folderName ? folderName.toLowerCase() : '', isVideo ? 'video' : 'photo', cameraModel ? cameraModel.toLowerCase() : '', 'imagekit'].filter(Boolean),
                    src: file.filePath || `/${file.name}`,
                    thumbnail: file.thumbnailUrl || undefined,
                    exif: {
                      camera: isVideo ? 'ImageKit Cloud Video' : (cameraModel || 'Mobile Camera'),
                      lens: `${file.width || (isVideo ? 1920 : 'Auto')} × ${file.height || (isVideo ? 1080 : 'Auto')}`,
                      focalLength: meta.FocalLength || (isVideo ? 'High Definition' : 'Native'),
                      aperture: meta.FNumber ? `f/${meta.FNumber}` : (meta.ApertureValue ? `f/${meta.ApertureValue}` : (isVideo ? (file.format || 'H.264 / MP4') : 'Auto')),
                      shutterSpeed: meta.ExposureTime ? `${meta.ExposureTime}s` : (isVideo ? 'Streaming CDN' : 'Cloud CDN'),
                      iso: meta.ISO ? `${meta.ISO}` : `${Math.round((file.size || 0) / 1024)} KB`
                    }
                  };
                });

                // Merge API folders with folders found in file paths and defaults
                const foldersMap = new Map();
                baseNames.forEach((name) => {
                  foldersMap.set(`/${name}`, { name, path: `/${name}` });
                });
                ikFolders.forEach((f) => {
                  foldersMap.set(f.path, f);
                });
                mappedMedia.forEach((p) => {
                  if (p.folderPath && p.folderPath !== '/') {
                    if (!foldersMap.has(p.folderPath)) {
                      foldersMap.set(p.folderPath, {
                        name: p.folder || p.folderPath.replace(/^\/+/, ''),
                        path: p.folderPath
                      });
                    }
                  }
                });
                if (mappedMedia.some((p) => p.folderPath === '/')) {
                  foldersMap.set('/', { name: 'Root Library', path: '/' });
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  configured: true,
                  photos: mappedMedia,
                  folders: Array.from(foldersMap.values())
                }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: err.message,
                  configured: true,
                  photos: [],
                  folders: defaultFolders
                }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('yet-another-react-lightbox')) {
                return 'vendor-lightbox';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  };
});
