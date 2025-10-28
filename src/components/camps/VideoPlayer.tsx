import { useState, useEffect } from 'react';
import { Play, AlertCircle, Loader, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  thumbnail?: string;
  autoplay?: boolean;
  className?: string;
}

type VideoType = 'youtube' | 'vimeo' | 'direct' | 'unknown';

export function VideoPlayer({
  url,
  title,
  thumbnail,
  autoplay = false,
  className = ''
}: VideoPlayerProps) {
  const [videoType, setVideoType] = useState<VideoType>('unknown');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    detectVideoType(url);
  }, [url]);

  const detectVideoType = (videoUrl: string): void => {
    try {
      if (!videoUrl || videoUrl.trim() === '') {
        setHasError(true);
        setErrorMessage('No video URL provided');
        setIsLoading(false);
        return;
      }

      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        setVideoType('youtube');
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
          setEmbedUrl(`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`);
          setIsLoading(false);
          setHasError(false);
          setErrorMessage('');
        } else {
          setHasError(true);
          setErrorMessage('Invalid YouTube URL format');
          setIsLoading(false);
        }
      } else if (videoUrl.includes('vimeo.com')) {
        setVideoType('vimeo');
        const videoId = extractVimeoId(videoUrl);
        if (videoId) {
          setEmbedUrl(`https://player.vimeo.com/video/${videoId}?title=0&byline=0${autoplay ? '&autoplay=1' : ''}`);
          setIsLoading(false);
          setHasError(false);
          setErrorMessage('');
        } else {
          setHasError(true);
          setErrorMessage('Invalid Vimeo URL format');
          setIsLoading(false);
        }
      } else if (videoUrl.startsWith('http') || videoUrl.startsWith('/')) {
        setVideoType('direct');
        setEmbedUrl(videoUrl);
        setIsLoading(false);
        setHasError(false);
        setErrorMessage('');
      } else {
        setHasError(true);
        setErrorMessage('Invalid video URL format');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error detecting video type:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/,
      /youtube\.com\/embed\/([^&\s?]+)/,
      /youtube-nocookie\.com\/embed\/([^&\s?]+)/,
      /youtube\.com\/v\/([^&\s?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const extractVimeoId = (url: string): string | null => {
    const pattern = /vimeo\.com\/(?:.*\/)?(\d+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    detectVideoType(url);
  };

  const handleIframeError = () => {
    console.error('Video iframe failed to load:', embedUrl);
    setHasError(true);
    setErrorMessage('Failed to connect to video service. Please check your internet connection or try again later.');
  };

  if (isLoading) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="w-12 h-12 text-white animate-spin" />
        </div>
        <div className="pb-[56.25%]"></div>
      </div>
    );
  }

  if (hasError || !embedUrl) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-white font-medium mb-2">Unable to load video</p>
          <p className="text-gray-400 text-sm mb-4">{errorMessage || 'Please check the video URL'}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
        <div className="pb-[56.25%]"></div>
      </div>
    );
  }

  if (videoType === 'direct') {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <video
          controls
          autoPlay={autoplay}
          poster={thumbnail}
          className="w-full h-full"
          onError={() => setHasError(true)}
        >
          <source src={embedUrl} type="video/mp4" />
          <source src={embedUrl} type="video/webm" />
          <source src={embedUrl} type="video/quicktime" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (!isPlaying && thumbnail) {
    return (
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer group ${className}`}
        onClick={handlePlayClick}
      >
        <img
          src={thumbnail}
          alt={title || 'Video thumbnail'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
            <Play className="w-10 h-10 text-white ml-1 fill-white" />
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <p className="text-white font-medium">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="relative pb-[56.25%]">
        <iframe
          src={embedUrl}
          title={title || 'Video player'}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={handleIframeError}
          loading="lazy"
        />
      </div>
    </div>
  );
}
