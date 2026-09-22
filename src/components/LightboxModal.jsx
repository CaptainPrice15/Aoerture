import React, { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Video from 'yet-another-react-lightbox/plugins/video';
import { getFullUrl, getThumbnailUrl, isVideoSource } from '../utils/imagekit';

export const LightboxModal = ({ photos, currentIndex, isOpen, onClose, onIndexChange, onOpenExif }) => {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  // Prepare slide objects for Yet Another React Lightbox
  const slides = photos.map((photo) => {
    const isVideo = photo.mediaType === 'video' || isVideoSource(photo.src);
    const exifSummary = photo.exif
      ? `${photo.exif.camera} • ${photo.exif.focalLength} • ${photo.exif.aperture} • ${photo.exif.shutterSpeed} • ISO ${photo.exif.iso}`
      : '';

    if (isVideo) {
      const mediaUrl = getFullUrl(photo);
      return {
        type: 'video',
        title: photo.title,
        description: `${photo.location || photo.category} ${exifSummary ? ` | ${exifSummary}` : ''}`,
        poster: getThumbnailUrl(photo),
        width: photo.width || 1920,
        height: photo.height || 1080,
        sources: [
          {
            src: mediaUrl,
            type: photo.mime || (photo.src?.endsWith('.webm') ? 'video/webm' : 'video/mp4')
          }
        ],
        download: {
          url: mediaUrl,
          filename: `${photo.id}.mp4`
        }
      };
    }

    return {
      src: getFullUrl(photo),
      title: photo.title,
      description: `${photo.location || photo.category} ${exifSummary ? ` | ${exifSummary}` : ''}`,
      thumbnail: getThumbnailUrl(photo),
      download: {
        url: getFullUrl(photo),
        filename: `${photo.id}.jpg`
      }
    };
  });

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      index={currentIndex}
      slides={slides}
      plugins={[Zoom, Fullscreen, Thumbnails, Captions, Video]}
      video={{
        autoPlay: true,
        controls: true,
        playsInline: true,
      }}
      on={{
        view: ({ index }) => onIndexChange && onIndexChange(index)
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 1.5,
      }}
      thumbnails={{
        position: 'bottom',
        width: isMobile ? 56 : 100,
        height: isMobile ? 38 : 66,
        gap: isMobile ? 6 : 12,
        borderRadius: 6,
        showToggle: true,
      }}
      captions={{
        showToggle: true,
        descriptionMaxLines: isMobile ? 1 : 2,
      }}
      carousel={{
        finite: false,
        preload: 2,
      }}
      styles={{
        container: { backgroundColor: 'rgba(5, 5, 8, 0.96)' },
        thumbnailsContainer: { backgroundColor: 'rgba(10, 10, 15, 0.95)' }
      }}
    />
  );
};
