import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Star, ThumbsUp, CheckCircle, MapPin, MessageSquare, X, Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { ReviewManagementModal } from '../../components/reviews/ReviewManagementModal';
import { CampSelectionModal } from '../../components/reviews/CampSelectionModal';
import { supabase } from '../../lib/supabase';
import { type Database } from '../../lib/database.types';

type Feedback = Database['public']['Tables']['feedback']['Row'];

interface FeedbackWithDetails extends Feedback {
  camp_name?: string;
  parent_name?: string;
  child_name?: string;
}

interface FeedbackDetailModalProps {
  feedback: FeedbackWithDetails | null;
  onClose: () => void;
  onResponseSubmit: (feedbackId: string, response: string) => Promise<void>;
}

function FeedbackDetailModal({ feedback, onClose, onResponseSubmit }: FeedbackDetailModalProps) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  if (!feedback) return null;

  const handleSubmit = async () => {
    if (!response.trim()) return;

    setLoading(true);
    try {
      await onResponseSubmit(feedback.id, response);
      onClose();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Feedback Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-6 max-h-[calc(100vh-300px)] overflow-y-auto space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{feedback.parent_name || 'Parent'}</p>
                  {feedback.parent_location && (
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {feedback.parent_location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < feedback.overall_rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {feedback.verified_booking && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  <CheckCircle className="w-3 h-3" />
                  Verified Booking
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Camp Details</h4>
              <p className="text-sm text-gray-700">{feedback.camp_name || 'Unknown Camp'}</p>
              {feedback.child_name && (
                <p className="text-xs text-gray-600 mt-1">Child: {feedback.child_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {feedback.staff_rating !== null && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Staff</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < feedback.staff_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {feedback.activities_rating !== null && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Activities</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < feedback.activities_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {feedback.facilities_rating !== null && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Facilities</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < feedback.facilities_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {feedback.value_rating !== null && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Value</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < feedback.value_rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {feedback.comments && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Review</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.comments}</p>
              </div>
            )}

            {feedback.would_recommend && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">Would recommend this camp to others</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                <span>{feedback.helpful_count || 0} found helpful</span>
              </div>
              <span>•</span>
              <span>Submitted {new Date(feedback.submitted_at).toLocaleDateString()}</span>
            </div>

            {feedback.response_from_host && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">Response from Host</p>
                    {feedback.response_date && (
                      <p className="text-xs text-blue-700">
                        {new Date(feedback.response_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{feedback.response_from_host}</p>
              </div>
            )}

            {!feedback.response_from_host && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respond to this review
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Thank you for your feedback..."
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {!feedback.response_from_host && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !response.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Response'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedbackManagement() {
  const [feedback, setFeedback] = useState<FeedbackWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithDetails | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCampSelectionOpen, setIsCampSelectionOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [selectedCampForReview, setSelectedCampForReview] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      if (feedbackData) {
        const feedbackWithDetails = await Promise.all(
          feedbackData.map(async (fb) => {
            const [campResult, parentResult, childResult] = await Promise.all([
              supabase.from('camps').select('name').eq('id', fb.camp_id).maybeSingle(),
              supabase.from('profiles').select('first_name, last_name').eq('id', fb.parent_id).maybeSingle(),
              supabase.from('children').select('first_name, last_name').eq('id', fb.child_id).maybeSingle(),
            ]);

            return {
              ...fb,
              camp_name: campResult.data?.name,
              parent_name: parentResult.data
                ? `${parentResult.data.first_name} ${parentResult.data.last_name}`
                : undefined,
              child_name: childResult.data
                ? `${childResult.data.first_name} ${childResult.data.last_name}`
                : undefined,
            };
          })
        );

        setFeedback(feedbackWithDetails);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResponseSubmit(feedbackId: string, responseText: string) {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          response_from_host: responseText,
          response_date: new Date().toISOString(),
        })
        .eq('id', feedbackId);

      if (error) throw error;

      await loadFeedback();
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  const filteredFeedback = feedback.filter((fb) => {
    if (filterRating !== null && fb.overall_rating !== filterRating) return false;
    if (filterVerified !== null && fb.verified_booking !== filterVerified) return false;
    return true;
  });

  const handleToggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ visible: !currentVisibility })
        .eq('id', reviewId);

      if (error) throw error;
      await loadFeedback();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleEditReview = (fb: FeedbackWithDetails) => {
    setEditingReview(fb);
    setSelectedCampForReview({ id: fb.camp_id, name: fb.camp_name || 'Unknown Camp' });
    setIsReviewModalOpen(true);
  };

  const columns: Column<FeedbackWithDetails>[] = [
    {
      key: 'camp_name',
      label: 'Camp',
      sortable: true,
      render: (fb) => (
        <div>
          <p className="font-medium text-gray-900">{fb.camp_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{fb.child_name || 'Child'}</p>
        </div>
      ),
    },
    {
      key: 'parent_name',
      label: 'Parent',
      sortable: true,
      render: (fb) => (
        <div>
          <p className="text-sm text-gray-900">{fb.parent_name || 'Parent'}</p>
          {fb.parent_location && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {fb.parent_location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'overall_rating',
      label: 'Rating',
      sortable: true,
      render: (fb) => (
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < fb.overall_rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">{fb.overall_rating}/5</p>
        </div>
      ),
    },
    {
      key: 'verified_booking',
      label: 'Status',
      sortable: true,
      render: (fb) => (
        <div className="space-y-1">
          {fb.verified_booking && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          {fb.response_from_host && (
            <span className="block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
              Responded
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'helpful_count',
      label: 'Helpful',
      sortable: true,
      render: (fb) => (
        <div className="flex items-center gap-1 text-sm text-gray-900">
          <ThumbsUp className="w-4 h-4 text-gray-400" />
          {fb.helpful_count || 0}
        </div>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Date',
      sortable: true,
      render: (fb) => (
        <p className="text-sm text-gray-900">{new Date(fb.submitted_at).toLocaleDateString()}</p>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (fb) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditReview(fb);
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit review"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVisibility(fb.id, fb.visible ?? true);
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title={fb.visible ? 'Hide review' : 'Show review'}
          >
            {fb.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, fb) => sum + fb.overall_rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  const verifiedCount = feedback.filter(fb => fb.verified_booking).length;
  const respondedCount = feedback.filter(fb => fb.response_from_host).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
            <p className="text-gray-600 mt-1">Manage and respond to parent reviews</p>
          </div>
          <button
            onClick={() => {
              setEditingReview(null);
              setSelectedCampForReview(null);
              setIsCampSelectionOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-gray-900">{respondedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex gap-4">
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={filterVerified === null ? '' : filterVerified.toString()}
              onChange={(e) => setFilterVerified(e.target.value ? e.target.value === 'true' : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Reviews</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredFeedback}
          columns={columns}
          onRowClick={(fb) => setSelectedFeedback(fb)}
        />
      </div>

      <FeedbackDetailModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onResponseSubmit={handleResponseSubmit}
      />

      <CampSelectionModal
        isOpen={isCampSelectionOpen}
        onClose={() => setIsCampSelectionOpen(false)}
        onSelectCamp={(camp) => {
          setSelectedCampForReview(camp);
          setIsCampSelectionOpen(false);
          setIsReviewModalOpen(true);
        }}
      />

      {isReviewModalOpen && selectedCampForReview && (
        <ReviewManagementModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setEditingReview(null);
            setSelectedCampForReview(null);
          }}
          onSuccess={() => {
            loadFeedback();
            setIsReviewModalOpen(false);
            setEditingReview(null);
            setSelectedCampForReview(null);
          }}
          review={editingReview}
          campId={selectedCampForReview.id}
          campName={selectedCampForReview.name}
        />
      )}
    </DashboardLayout>
  );
}
