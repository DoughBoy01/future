import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Grid3x3, Play } from 'lucide-react';

interface VideoItem {
  url: string;
  title?: string;
  thumbnail?: string;
  type?: 'youtube' | 'vimeo' | 'direct';
}

interface ImageGalleryProps {
  images: string[];
  videos?: VideoItem[];
  campName: string;
  onVideoClick?: (videoIndex: number) => void;
}

export function ImageGallery({ images, videos = [], campName, onVideoClick }: ImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center rounded-2xl">
        <p className="text-white text-lg">No images available</p>
      </div>
    );
  }

  const totalMedia = images.length + videos.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsLightboxOpen(false);
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  const renderMediaItem = (index: number, className: string, isLast: boolean = false) => {
    const isVideo = index >= images.length;
    const videoIndex = index - images.length;
    const video = videos[videoIndex];

    if (isVideo && video) {
      return (
        <div
          key={`video-${videoIndex}`}
          className={`${className} cursor-pointer group relative overflow-hidden`}
          onClick={() => onVideoClick?.(videoIndex)}
        >
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title || `${campName} - Video ${videoIndex + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-70" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
              <Play className="w-6 h-6 text-gray-900 ml-0.5 fill-gray-900" />
            </div>
          </div>
          {isLast && totalMedia > 5 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                Show all {totalMedia} photos & videos
              </button>
            </div>
          )}
        </div>
      );
    }

    const imageIndex = index;
    return (
      <div
        key={`image-${imageIndex}`}
        className={`${className} cursor-pointer group relative overflow-hidden`}
        onClick={() => {
          setCurrentIndex(imageIndex);
          setIsLightboxOpen(true);
        }}
      >
        <img
          src={images[imageIndex]}
          alt={`${campName} - View ${imageIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        {isLast && totalMedia > 5 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Show all {totalMedia} photos & videos
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Airbnb-style collage grid - Mobile: Single column, Desktop: Sophisticated grid */}
      <div className="relative">
        {/* Mobile Layout - Stack vertically */}
        <div className="md:hidden flex flex-col gap-2">
          {[...Array(Math.min(3, totalMedia))].map((_, i) => (
            <div key={i}>
              {renderMediaItem(i, 'rounded-lg h-64', i === 2)}
            </div>
          ))}
        </div>

        {/* Desktop Layout - Airbnb-style grid */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
          {/* Main large image - left side */}
          {totalMedia > 0 && renderMediaItem(0, 'col-span-2 row-span-2 rounded-l-2xl')}

          {/* Top right image */}
          {totalMedia > 1 && renderMediaItem(1, 'col-span-1 row-span-1 rounded-tr-2xl')}

          {/* Second top right image */}
          {totalMedia > 2 && renderMediaItem(2, 'col-span-1 row-span-1')}

          {/* Bottom left of right side */}
          {totalMedia > 3 && renderMediaItem(3, 'col-span-1 row-span-1')}

          {/* Bottom right - last visible with "show all" button */}
          {totalMedia > 4 && renderMediaItem(4, 'col-span-1 row-span-1 rounded-br-2xl', true)}
        </div>

        {/* Show all button overlay on mobile */}
        {totalMedia > 3 && (
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsLightboxOpen(true);
            }}
            className="md:hidden absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Grid3x3 className="w-4 h-4" />
            Show all {totalMedia}
          </button>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors z-10"
            aria-label="Close gallery"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center px-4 md:px-16 py-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`${campName} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white scale-110'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
