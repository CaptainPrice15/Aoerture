import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'imagekit-api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/photos') {
              const privateKey = env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY || env.VITE_IMAGEKIT_PRIVATE_KEY;
              if (!privateKey) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ configured: false, photos: [] }));
                return;
              }
              try {
                const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');
                const response = await fetch('https://api.imagekit.io/v1/files?limit=100', {
                  headers: { Authorization: authHeader }
                });
                if (!response.ok) {
                  const errText = await response.text();
                  res.statusCode = response.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: errText, configured: true, photos: [] }));
                  return;
                }
                const files = await response.json();
                const imageFiles = Array.isArray(files)
                  ? files.filter((f) => f.type === 'file' || (f.mime && f.mime.startsWith('image/')) || /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name))
                  : [];

                const filteredImages = imageFiles.filter((f) => f.name !== 'default-image.jpg');

                const mappedPhotos = filteredImages.map((file, idx) => ({
                  id: file.fileId || `ik-${idx}`,
                  title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                  category: file.filePath?.includes('/Pics') ? 'Pics' : 'Gallery',
                  location: 'ImageKit Media Library',
                  date: file.createdAt ? file.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
                  aspectRatio: file.width && file.height
                    ? (file.width === file.height ? '1/1' : file.width > file.height ? '3/2' : '4/5')
                    : '3/2',
                  featured: idx === 0,
                  description: `Original photo streamed from your ImageKit cloud folder: ${file.name}`,
                  tags: file.tags && file.tags.length > 0 ? file.tags : ['imagekit', 'cloud'],
                  src: file.filePath || `/${file.name}`,
                  exif: {
                    camera: 'ImageKit Media Library',
                    lens: `${file.width || 'Auto'} × ${file.height || 'Auto'}`,
                    focalLength: 'Native',
                    aperture: 'Auto',
                    shutterSpeed: 'Cloud CDN',
                    iso: `${Math.round((file.size || 0) / 1024)} KB`
                  }
                }));

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ configured: true, photos: mappedPhotos }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message, configured: true, photos: [] }));
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
    }
  };
});
