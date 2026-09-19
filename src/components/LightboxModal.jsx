import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import { getFullUrl, getThumbnailUrl } from '../utils/imagekit';

export const LightboxModal = ({ photos, currentIndex, isOpen, onClose, onIndexChange, onOpenExif }) => {
  if (!isOpen) return null;

  // Prepare slide objects for Yet Another React Lightbox
  const slides = photos.map((photo) => {
    const exifSummary = photo.exif
      ? `${photo.exif.camera} • ${photo.exif.focalLength} • ${photo.exif.aperture} • ${photo.exif.shutterSpeed} • ISO ${photo.exif.iso}`
      : '';

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
      plugins={[Zoom, Fullscreen, Thumbnails, Captions]}
      on={{
        view: ({ index }) => onIndexChange && onIndexChange(index)
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 1.5,
      }}
      thumbnails={{
        position: 'bottom',
        width: 100,
        height: 66,
        gap: 12,
        borderRadius: 8,
      }}
      captions={{
        showToggle: true,
        descriptionMaxLines: 2,
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
