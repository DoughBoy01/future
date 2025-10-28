import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Plus, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { validateVideoUrl, getVideoThumbnail } from '../../utils/videoValidation';

interface ImageData {
  url: string;
  caption?: string;
  alt_text?: string;
  display_order: number;
}

interface VideoData {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  type: 'youtube' | 'vimeo' | 'direct';
  display_order: number;
}

interface MediaUploadManagerProps {
  images: ImageData[];
  videos: VideoData[];
  onImagesChange: (images: ImageData[]) => void;
  onVideosChange: (videos: VideoData[]) => void;
  maxImages?: number;
  maxVideos?: number;
}

export function MediaUploadManager({
  images,
  videos,
  onImagesChange,
  onVideosChange,
  maxImages = 10,
  maxVideos = 5
}: MediaUploadManagerProps) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoDescInput, setVideoDescInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum of ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingImages(true);
    setError(null);

    try {
      const uploadedImages: ImageData[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          console.warn('Skipping non-image file:', file.name);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `camps/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('camp-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('camp-images')
          .getPublicUrl(data.path);

        uploadedImages.push({
          url: publicUrl,
          caption: '',
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          display_order: images.length + uploadedImages.length
        });
      }

      onImagesChange([...images, ...uploadedImages]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
      console.error('Image upload error:', err);
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videos.length >= maxVideos) {
      setError(`Maximum of ${maxVideos} videos allowed`);
      return;
    }

    setUploadingVideo(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `camps/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('camp-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('camp-videos')
        .getPublicUrl(data.path);

      const newVideo: VideoData = {
        url: publicUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        type: 'direct',
        display_order: videos.length
      };

      onVideosChange([...videos, newVideo]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
      console.error('Video upload error:', err);
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;

    if (videos.length >= maxVideos) {
      setError(`Maximum of ${maxVideos} videos allowed`);
      return;
    }

    const validation = validateVideoUrl(videoUrlInput.trim());
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Invalid video URL');
      return;
    }

    const thumbnail = getVideoThumbnail(videoUrlInput.trim());

    const newVideo: VideoData = {
      url: videoUrlInput.trim(),
      title: videoTitleInput.trim() || 'Camp Video',
      description: videoDescInput.trim(),
      thumbnail: thumbnail || undefined,
      type: validation.videoType as 'youtube' | 'vimeo' | 'direct',
      display_order: videos.length
    };

    onVideosChange([...videos, newVideo]);
    setVideoUrlInput('');
    setVideoTitleInput('');
    setVideoDescInput('');
    setShowVideoUrlInput(false);
    setError(null);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages.map((img, i) => ({ ...img, display_order: i })));
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos.map((vid, i) => ({ ...vid, display_order: i })));
  };

  const updateImageCaption = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], caption };
    onImagesChange(newImages);
  };

  const updateVideoTitle = (index: number, title: string) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], title };
    onVideosChange(newVideos);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Camp Images ({images.length}/{maxImages})
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={image.alt_text || `Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => updateImageCaption(index, e.target.value)}
                placeholder="Add caption..."
                className="mt-2 w-full text-xs px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          ))}

          {images.length < maxImages && (
            <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
              {uploadingImages ? (
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600">Upload Images</span>
                </>
              )}
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Upload up to {maxImages} high-quality images. Recommended size: 1920x1080px. Formats: JPG, PNG, WebP
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Camp Videos ({videos.length}/{maxVideos})
        </label>

        <div className="space-y-4 mb-4">
          {videos.map((video, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg">
              <Video className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={video.title || ''}
                  onChange={(e) => updateVideoTitle(index, e.target.value)}
                  placeholder="Video title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                />
                <p className="text-xs text-gray-600 truncate">{video.url}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {video.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {videos.length < maxVideos && (
          <div className="flex gap-2">
            <label className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                className="hidden"
              />
              {uploadingVideo ? (
                <Loader className="w-5 h-5 text-blue-600 animate-spin mr-2" />
              ) : (
                <Upload className="w-5 h-5 text-gray-600 mr-2" />
              )}
              <span className="text-sm text-gray-700">Upload Video File</span>
            </label>

            <button
              type="button"
              onClick={() => setShowVideoUrlInput(!showVideoUrlInput)}
              className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {showVideoUrlInput && (
          <div className="mt-4 p-4 border border-gray-300 rounded-lg space-y-3">
            <input
              type="url"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="Video URL (YouTube, Vimeo, or direct link)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={videoTitleInput}
              onChange={(e) => setVideoTitleInput(e.target.value)}
              placeholder="Video title (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              value={videoDescInput}
              onChange={(e) => setVideoDescInput(e.target.value)}
              placeholder="Video description (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddVideoUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Video
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVideoUrlInput(false);
                  setVideoUrlInput('');
                  setVideoTitleInput('');
                  setVideoDescInput('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Upload video files or add YouTube/Vimeo URLs. Max file size: 100MB. Formats: MP4, WebM, MOV
        </p>
      </div>
    </div>
  );
}
