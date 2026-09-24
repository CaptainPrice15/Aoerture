import React, { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Download from 'yet-another-react-lightbox/plugins/download';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Video from 'yet-another-react-lightbox/plugins/video';
import { getFullUrl, getThumbnailUrl, isVideoSource, getDownloadUrl, getDownloadFilename, downloadMedia } from '../utils/imagekit';
import { useAuth } from '../context/AuthContext';

export const LightboxModal = ({ photos, currentIndex, isOpen, onClose, onIndexChange, onOpenExif }) => {
  const { isAuthenticated } = useAuth();
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
    const filename = getDownloadFilename(photo);
    const downloadUrl = getDownloadUrl(photo);

    if (isVideo) {
      const mediaUrl = getFullUrl(photo);
      const videoSlide = {
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
        ]
      };

      if (isAuthenticated) {
        videoSlide.download = {
          url: downloadUrl || mediaUrl,
          filename: filename
        };
      }

      return videoSlide;
    }

    const imageSlide = {
      src: getFullUrl(photo),
      title: photo.title,
      description: `${photo.location || photo.category} ${exifSummary ? ` | ${exifSummary}` : ''}`,
      thumbnail: getThumbnailUrl(photo)
    };

    if (isAuthenticated) {
      imageSlide.download = {
        url: downloadUrl || getFullUrl(photo),
        filename: filename
      };
    }

    return imageSlide;
  });

  const activePlugins = isAuthenticated
    ? [Zoom, Fullscreen, Download, Thumbnails, Captions, Video]
    : [Zoom, Fullscreen, Thumbnails, Captions, Video];

  return (
    <div
      onContextMenu={(e) => {
        if (!isAuthenticated) {
          e.preventDefault();
        }
      }}
      className={!isAuthenticated ? 'protected-media' : ''}
    >
      <Lightbox
        open={isOpen}
        close={onClose}
        index={currentIndex}
        slides={slides}
        plugins={activePlugins}
        download={
          isAuthenticated
            ? {
                download: ({ slide }) => {
                  const photo = photos.find((p) => {
                    const dUrl = typeof slide.download === 'object' ? slide.download.url : slide.download;
                    return (
                      slide.src === getFullUrl(p) ||
                      dUrl === getDownloadUrl(p) ||
                      slide.title === p.title
                    );
                  });
                  if (photo) {
                    downloadMedia(photo);
                  } else if (slide.download) {
                    const url = typeof slide.download === 'object' ? slide.download.url : slide.download;
                    const filename = typeof slide.download === 'object' ? slide.download.filename : undefined;
                    const a = document.createElement('a');
                    a.href = url;
                    if (filename) a.download = filename;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                }
              }
            : undefined
        }
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
    </div>
  );
};
