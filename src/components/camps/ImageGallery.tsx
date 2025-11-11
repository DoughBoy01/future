import { useState, useRef, useEffect } from 'react';
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
  const [isGridViewOpen, setIsGridViewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center rounded-2xl">
        <p className="text-white text-lg">No images available</p>
      </div>
    );
  }

  const totalMedia = images.length + videos.length;

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const slideWidth = scrollContainerRef.current.offsetWidth;
        const newSlide = Math.round(scrollLeft / slideWidth);
        setMobileSlide(newSlide);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - next slide
      setMobileSlide((prev) => Math.min(prev + 1, totalMedia - 1));
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right - previous slide
      setMobileSlide((prev) => Math.max(prev - 1, 0));
    }
  };

  const goToMobileSlide = (index: number) => {
    setMobileSlide(index);
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
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
            <div
              className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsGridViewOpen(true);
              }}
            >
              <button className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-airbnb-pink-600 hover:to-airbnb-pink-700 hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Show all {totalMedia}
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
          <div
            className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsGridViewOpen(true);
            }}
          >
            <button className="bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-airbnb-pink-600 hover:to-airbnb-pink-700 hover:scale-105 transition-all shadow-xl flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Show all {totalMedia}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Airbnb-style collage grid - Mobile: Swipeable carousel, Desktop: Sophisticated grid */}
      <div className="relative">
        {/* Mobile Layout - Swipeable Carousel */}
        <div className="md:hidden relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {[...Array(totalMedia)].map((_, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 snap-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                {renderMediaItem(i, 'rounded-lg h-72 w-full', false)}
              </div>
            ))}
          </div>

          {/* Swipe Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {[...Array(totalMedia)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToMobileSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 ${
                  i === mobileSlide
                    ? 'w-8 h-2 bg-white rounded-full'
                    : 'w-2 h-2 bg-white/60 rounded-full hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full z-10">
            {mobileSlide + 1} / {totalMedia}
          </div>
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

      {/* Grid View Modal - Show All Photos & Videos */}
      {isGridViewOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-y-auto"
          onClick={() => setIsGridViewOpen(false)}
        >
          <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="sticky top-0 bg-black bg-opacity-90 backdrop-blur-md z-10 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{campName}</h2>
                  <p className="text-gray-400 text-sm md:text-base">
                    {images.length} {images.length === 1 ? 'photo' : 'photos'}
                    {videos.length > 0 && ` • ${videos.length} ${videos.length === 1 ? 'video' : 'videos'}`}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGridViewOpen(false);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 md:p-3 transition-colors"
                  aria-label="Close gallery"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Images */}
              {images.map((image, index) => (
                <div
                  key={`grid-image-${index}`}
                  className="aspect-square cursor-pointer group relative overflow-hidden rounded-lg md:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsGridViewOpen(false);
                    setIsLightboxOpen(true);
                  }}
                >
                  <img
                    src={image}
                    alt={`${campName} - Photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 text-white font-medium text-sm">
                      Photo {index + 1}
                    </div>
                  </div>
                  {/* Pink border on hover */}
                  <div className="absolute inset-0 border-2 border-airbnb-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg md:rounded-xl" />
                </div>
              ))}

              {/* Videos */}
              {videos.map((video, videoIndex) => (
                <div
                  key={`grid-video-${videoIndex}`}
                  className="aspect-square cursor-pointer group relative overflow-hidden rounded-lg md:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGridViewOpen(false);
                    onVideoClick?.(videoIndex);
                  }}
                >
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title || `Video ${videoIndex + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-airbnb-pink-500 to-airbnb-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      <Play className="w-7 h-7 md:w-9 md:h-9 text-white ml-1 fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white font-medium text-sm bg-black bg-opacity-50 px-2 py-1 rounded-md">
                    {video.title || `Video ${videoIndex + 1}`}
                  </div>
                  {/* Pink border on hover */}
                  <div className="absolute inset-0 border-2 border-airbnb-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg md:rounded-xl" />
                </div>
              ))}
            </div>

            {/* Bottom padding for mobile */}
            <div className="h-20" />
          </div>
        </div>
      )}
    </>
  );
}
