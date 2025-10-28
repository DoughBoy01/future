import { useState, useEffect } from 'react';
import { X, Star, Save, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id?: string;
  camp_id: string;
  parent_name: string;
  parent_email?: string;
  parent_location?: string;
  overall_rating: number;
  staff_rating?: number;
  activities_rating?: number;
  facilities_rating?: number;
  value_rating?: number;
  comments?: string;
  would_recommend: boolean;
  verified_booking: boolean;
  photos?: string[];
  featured: boolean;
  visible: boolean;
  response_from_host?: string;
  response_date?: string;
  submitted_at?: string;
}

interface ReviewManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  review?: Review;
  campId: string;
  campName: string;
}

export function ReviewManagementModal({
  isOpen,
  onClose,
  onSuccess,
  review,
  campId,
  campName
}: ReviewManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Review>({
    camp_id: campId,
    parent_name: '',
    parent_email: '',
    parent_location: '',
    overall_rating: 5,
    staff_rating: 5,
    activities_rating: 5,
    facilities_rating: 5,
    value_rating: 5,
    comments: '',
    would_recommend: true,
    verified_booking: true,
    featured: false,
    visible: true,
    response_from_host: '',
  });

  useEffect(() => {
    if (review) {
      setFormData({
        ...review,
        staff_rating: review.staff_rating || 5,
        activities_rating: review.activities_rating || 5,
        facilities_rating: review.facilities_rating || 5,
        value_rating: review.value_rating || 5,
      });
    } else {
      setFormData(prev => ({ ...prev, camp_id: campId }));
    }
  }, [review, campId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reviewData = {
        camp_id: formData.camp_id,
        parent_name: formData.parent_name,
        parent_email: formData.parent_email || null,
        parent_location: formData.parent_location || null,
        overall_rating: formData.overall_rating,
        staff_rating: formData.staff_rating,
        activities_rating: formData.activities_rating,
        facilities_rating: formData.facilities_rating,
        value_rating: formData.value_rating,
        comments: formData.comments || null,
        would_recommend: formData.would_recommend,
        verified_booking: formData.verified_booking,
        featured: formData.featured,
        visible: formData.visible,
        response_from_host: formData.response_from_host || null,
        response_date: formData.response_from_host ? new Date().toISOString() : null,
        submitted_at: formData.submitted_at || new Date().toISOString(),
      };

      if (review?.id) {
        const { error: updateError } = await supabase
          .from('feedback')
          .update(reviewData)
          .eq('id', review.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('feedback')
          .insert([reviewData]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save review');
      console.error('Error saving review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!review?.id || !confirm('Are you sure you want to delete this review?')) return;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('feedback')
        .delete()
        .eq('id', review.id);

      if (deleteError) throw deleteError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
      console.error('Error deleting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = (value: number, onChange: (value: number) => void, label: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {review ? 'Edit Review' : 'Add New Review'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">For: {campName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">Review saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Name *
              </label>
              <input
                type="text"
                required
                value={formData.parent_name}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.parent_email}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.parent_location}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_location: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderStarInput(formData.overall_rating, (val) => setFormData(prev => ({ ...prev, overall_rating: val })), 'Overall Rating *')}
              {renderStarInput(formData.staff_rating || 5, (val) => setFormData(prev => ({ ...prev, staff_rating: val })), 'Staff')}
              {renderStarInput(formData.activities_rating || 5, (val) => setFormData(prev => ({ ...prev, activities_rating: val })), 'Activities')}
              {renderStarInput(formData.facilities_rating || 5, (val) => setFormData(prev => ({ ...prev, facilities_rating: val })), 'Facilities')}
              {renderStarInput(formData.value_rating || 5, (val) => setFormData(prev => ({ ...prev, value_rating: val })), 'Value')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host Response
            </label>
            <textarea
              value={formData.response_from_host}
              onChange={(e) => setFormData(prev => ({ ...prev, response_from_host: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Response from the camp organizer..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.would_recommend}
                onChange={(e) => setFormData(prev => ({ ...prev, would_recommend: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Would Recommend</span>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.verified_booking}
                onChange={(e) => setFormData(prev => ({ ...prev, verified_booking: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Verified Booking</span>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Review</span>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                {formData.visible ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                <span className="text-sm font-medium text-gray-700">Visible to Public</span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {review && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                Delete Review
              </button>
            )}

            <div className={`flex gap-3 ${!review ? 'ml-auto' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
