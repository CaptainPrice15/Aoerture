/**
 * Vercel Serverless Function: GET /api/photos
 * Securely communicates with ImageKit Media Library API using IMAGEKIT_PRIVATE_KEY
 */
export default async function handler(req, res) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.VITE_IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    return res.status(200).json({
      configured: false,
      message: 'No IMAGEKIT_PRIVATE_KEY configured in environment variables',
      photos: [],
      folders: [
        { name: 'Pics', path: '/Pics' },
        { name: 'Darjeeling', path: '/Darjeeling' },
        { name: 'Sikkim', path: '/Sikkim' }
      ]
    });
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');
    const response = await fetch('https://api.imagekit.io/v1/files?limit=1000', {
      headers: {
        Authorization: authHeader
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: errText,
        configured: true,
        photos: []
      });
    }

    const files = await response.json();
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
            /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(f.name);

          return isVideo || isImage;
        })
      : [];

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
      const category = (folderName !== 'Root Library' ? folderName : '') || (isVideo ? 'Videos' : 'Pics');

      const meta = file.embeddedMetadata || {};
      const cameraModel = [meta.Make, meta.Model].filter(Boolean).join(' ');
      const shotDate = meta.DateTimeOriginal
        ? meta.DateTimeOriginal.slice(0, 10)
        : (file.createdAt ? file.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10));

      let title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const imgMatch = file.name.match(/^IMG(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/i);
      const vidMatch = file.name.match(/^VID(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/i);
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

    // Fetch media library folders from ImageKit API
    let ikFolders = [];
    try {
      const foldersRes = await fetch('https://api.imagekit.io/v1/files?path=%2F&type=folder', {
        headers: { Authorization: authHeader }
      });
      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        if (Array.isArray(foldersData)) {
          ikFolders = foldersData.map((f) => ({
            name: f.name,
            path: f.folderPath || (f.name.startsWith('/') ? f.name : `/${f.name}`)
          }));
        }
      }
    } catch (fErr) {
      console.error('Error fetching folders from ImageKit:', fErr);
    }

    // Merge API folders with folders found in file paths
    const foldersMap = new Map();
    // Default known folders
    ['Pics', 'Darjeeling', 'Sikkim'].forEach((name) => {
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
    // If there are photos at root, add Root Library folder
    if (mappedMedia.some((p) => p.folderPath === '/')) {
      foldersMap.set('/', { name: 'Root Library', path: '/' });
    }

    return res.status(200).json({
      configured: true,
      photos: mappedMedia,
      folders: Array.from(foldersMap.values())
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      configured: true,
      photos: [],
      folders: [
        { name: 'Pics', path: '/Pics' },
        { name: 'Darjeeling', path: '/Darjeeling' },
        { name: 'Sikkim', path: '/Sikkim' }
      ]
    });
  }
}
