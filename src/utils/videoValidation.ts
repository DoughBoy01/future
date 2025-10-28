export interface VideoValidationResult {
  isValid: boolean;
  videoType: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  videoId?: string;
  embedUrl?: string;
  errorMessage?: string;
}

export function extractYouTubeId(url: string): string | null {
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
}

export function extractVimeoId(url: string): string | null {
  const pattern = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

export function validateVideoUrl(url: string): VideoValidationResult {
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      videoType: 'unknown',
      errorMessage: 'Video URL is required',
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
    const videoId = extractYouTubeId(trimmedUrl);
    if (videoId) {
      return {
        isValid: true,
        videoType: 'youtube',
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      };
    } else {
      return {
        isValid: false,
        videoType: 'youtube',
        errorMessage: 'Invalid YouTube URL format. Please use a standard YouTube video URL.',
      };
    }
  }

  if (trimmedUrl.includes('vimeo.com')) {
    const videoId = extractVimeoId(trimmedUrl);
    if (videoId) {
      return {
        isValid: true,
        videoType: 'vimeo',
        videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}?title=0&byline=0`,
      };
    } else {
      return {
        isValid: false,
        videoType: 'vimeo',
        errorMessage: 'Invalid Vimeo URL format. Please use a standard Vimeo video URL.',
      };
    }
  }

  if (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('/')) {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.ogg'];
    const hasVideoExtension = videoExtensions.some(ext =>
      trimmedUrl.toLowerCase().includes(ext)
    );

    if (hasVideoExtension || trimmedUrl.includes('supabase.co/storage')) {
      return {
        isValid: true,
        videoType: 'direct',
        embedUrl: trimmedUrl,
      };
    } else {
      return {
        isValid: false,
        videoType: 'direct',
        errorMessage: 'URL does not appear to be a valid video file. Supported formats: MP4, WebM, MOV, AVI, OGG',
      };
    }
  }

  return {
    isValid: false,
    videoType: 'unknown',
    errorMessage: 'Invalid video URL. Please provide a YouTube, Vimeo, or direct video file URL.',
  };
}

export function isValidYouTubeUrl(url: string): boolean {
  return validateVideoUrl(url).videoType === 'youtube' && validateVideoUrl(url).isValid;
}

export function isValidVimeoUrl(url: string): boolean {
  return validateVideoUrl(url).videoType === 'vimeo' && validateVideoUrl(url).isValid;
}

export function normalizeVideoUrl(url: string): string {
  const validation = validateVideoUrl(url);
  if (validation.isValid && validation.embedUrl) {
    return validation.embedUrl;
  }
  return url;
}

export function getVideoThumbnail(url: string): string | null {
  const validation = validateVideoUrl(url);

  if (validation.videoType === 'youtube' && validation.videoId) {
    return `https://img.youtube.com/vi/${validation.videoId}/maxresdefault.jpg`;
  }

  return null;
}
