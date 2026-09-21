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
      photos: []
    });
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');
    const response = await fetch('https://api.imagekit.io/v1/files?limit=100', {
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
    const imageFiles = Array.isArray(files)
      ? files.filter((f) => f.type === 'file' || (f.mime && f.mime.startsWith('image/')) || /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name))
      : [];

    // Filter out ImageKit's default stock asset if present
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

    return res.status(200).json({
      configured: true,
      photos: mappedPhotos
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      configured: true,
      photos: []
    });
  }
}
