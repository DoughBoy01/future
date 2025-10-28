import { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

interface VideoItem {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  type?: 'youtube' | 'vimeo' | 'direct';
}

interface VideoGalleryProps {
  videos: VideoItem[];
  campName: string;
}

export function VideoGallery({ videos, campName }: VideoGalleryProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!videos || videos.length === 0) {
    return null;
  }

  const openVideoModal = (index: number) => {
    setSelectedVideoIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideoIndex(null);
  };

  const goToPrevious = () => {
    if (selectedVideoIndex !== null) {
      setSelectedVideoIndex((selectedVideoIndex - 1 + videos.length) % videos.length);
    }
  };

  const goToNext = () => {
    if (selectedVideoIndex !== null) {
      setSelectedVideoIndex((selectedVideoIndex + 1) % videos.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {videos.length === 1 ? 'Camp Video' : 'Camp Videos'}
          </h2>
        </div>

        {videos.length === 1 ? (
          <div className="w-full">
            <VideoPlayer
              url={videos[0].url}
              title={videos[0].title}
              thumbnail={videos[0].thumbnail}
              className="w-full"
            />
            {videos[0].title && (
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{videos[0].title}</h3>
            )}
            {videos[0].description && (
              <p className="mt-2 text-gray-600">{videos[0].description}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => openVideoModal(index)}
              >
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title || `${campName} video ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                      <Play className="w-8 h-8 text-white ml-1 fill-white" />
                    </div>
                  </div>
                </div>
                {video.title && (
                  <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                )}
                {video.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{video.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedVideoIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors z-10"
            aria-label="Close video"
          >
            <X className="w-8 h-8" />
          </button>

          {videos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition-colors z-10"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition-colors z-10"
                aria-label="Next video"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {selectedVideoIndex + 1} / {videos.length}
          </div>

          <div
            className="relative w-full max-w-6xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoPlayer
              url={videos[selectedVideoIndex].url}
              title={videos[selectedVideoIndex].title}
              thumbnail={videos[selectedVideoIndex].thumbnail}
              autoplay={true}
              className="w-full shadow-2xl"
            />
            {(videos[selectedVideoIndex].title || videos[selectedVideoIndex].description) && (
              <div className="mt-4 text-white">
                {videos[selectedVideoIndex].title && (
                  <h3 className="text-xl font-bold mb-2">{videos[selectedVideoIndex].title}</h3>
                )}
                {videos[selectedVideoIndex].description && (
                  <p className="text-gray-300">{videos[selectedVideoIndex].description}</p>
                )}
              </div>
            )}
          </div>

          {videos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVideoIndex(index);
                  }}
                  className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedVideoIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
