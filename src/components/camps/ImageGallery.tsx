import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  campName: string;
}

export function ImageGallery({ images, campName }: ImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <p className="text-white text-lg">No images available</p>
      </div>
    );
  }

  const mainImage = images[0];
  const sideImages = images.slice(1, 9);
  const hasMoreImages = images.length > 9;

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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto md:h-[600px]">
        <div
          className="col-span-2 md:row-span-2 cursor-pointer group relative overflow-hidden rounded-lg md:rounded-l-2xl"
          onClick={() => {
            setCurrentIndex(0);
            setIsLightboxOpen(true);
          }}
        >
          <img
            src={mainImage}
            alt={`${campName} - Main view`}
            className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </div>

        {sideImages.slice(0, 8).map((image, index) => (
          <div
            key={index}
            className="cursor-pointer group relative overflow-hidden rounded-lg"
            onClick={() => {
              setCurrentIndex(index + 1);
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={image}
              alt={`${campName} - View ${index + 2}`}
              className="w-full h-32 md:h-[147px] object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            {index === 7 && hasMoreImages && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <button className="bg-white text-gray-900 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm">
                  <Grid3x3 className="w-4 h-4" />
                  +{images.length - 9} more
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setCurrentIndex(0);
          setIsLightboxOpen(true);
        }}
        className="mt-4 md:hidden w-full py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <Grid3x3 className="w-5 h-5" />
        View all {images.length} photos
      </button>

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
