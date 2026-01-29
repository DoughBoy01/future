import { useEffect, useState } from 'react';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Plus, Edit, Trash2, MessageSquare, Download, AlertCircle, ArrowRight, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CampFormModal } from '../../components/camps/CampFormModal';
import { ReviewManagementModal } from '../../components/reviews/ReviewManagementModal';
import { importExportService } from '../../services/importExportService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { getEffectiveCommissionRate } from '../../services/commissionRateService';
import { toggleCampPublishStatus, canTogglePublishStatus } from '../../services/campStatusService';
import type { Database } from '../../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];

interface CampWithAvailability extends Camp {
  enrolled_count: number;
  available_places: number;
  availability_status: 'available' | 'limited' | 'full';
  effective_commission_rate?: number;
}

/**
 * Organizer Camps View - Shows only camps created by the organizer
 * Organizers can see their own draft, pending_review, published, requires_changes, and rejected camps
 */
export function OrganizerCampsView() {
  const { profile, user, organization } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState<CampWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | undefined>();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampForReview, setSelectedCampForReview] = useState<Camp | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [togglingCampId, setTogglingCampId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadCamps();
  }, [profile?.organisation_id]);

  async function loadCamps() {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('User not authenticated. Please log in.');
        setCamps([]);
        setLoading(false);
        return;
      }

      // Fetch only camps created by this organizer
      let query = supabase
        .from('camps')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      const { data: campsData, error: campsError } = await query;

      if (campsError) throw campsError;

      // Calculate enrollment, availability, and commission rate for each camp
      const campsWithAvailability = await Promise.all(
        (campsData || []).map(async (camp) => {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('camp_id', camp.id)
            .eq('status', 'confirmed');

          const enrolled = count || 0;
          const capacity = camp.capacity || 0;
          const available = Math.max(0, capacity - enrolled);

          let availabilityStatus: 'available' | 'limited' | 'full';
          if (available === 0) {
            availabilityStatus = 'full';
          } else if (available <= capacity * 0.2) {
            availabilityStatus = 'limited';
          } else {
            availabilityStatus = 'available';
          }

          // Fetch effective commission rate for this camp
          let commissionRate: number | undefined;
          try {
            commissionRate = await getEffectiveCommissionRate(camp.id);
          } catch (error) {
            console.error(`Failed to get commission rate for camp ${camp.id}:`, error);
            commissionRate = 0.15; // Default to 15% if fetch fails
          }

          return {
            ...camp,
            enrolled_count: enrolled,
            available_places: available,
            availability_status: availabilityStatus,
            effective_commission_rate: commissionRate,
          };
        })
      );

      setCamps(campsWithAvailability);
    } catch (err) {
      console.error('Error loading camps:', err);
      setError('Failed to load camps. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await importExportService.exportCampsToCSV(camps);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export camps. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (camp: Camp) => {
    // Security check: Verify camp was created by this user
    if (camp.created_by !== user?.id) {
      alert('You can only delete camps you created.');
      console.error('Unauthorized delete attempt:', {
        campCreatedBy: camp.created_by,
        currentUserId: user?.id,
      });
      return;
    }

    // Additional check: Only allow deleting draft camps
    if (camp.status !== 'draft') {
      alert('Only draft camps can be deleted. Please contact support to remove published camps.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${camp.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('camps')
        .delete()
        .eq('id', camp.id);

      if (error) throw error;

      await loadCamps();
      alert('Camp deleted successfully');
    } catch (error) {
      console.error('Error deleting camp:', error);
      alert('Failed to delete camp. It may have existing registrations.');
    }
  };

  const handleTogglePublishStatus = async (camp: CampWithAvailability) => {
    // Security check: Verify camp was created by this user
    if (camp.created_by !== user?.id) {
      alert('You can only toggle publish status for camps you created.');
      console.error('Unauthorized toggle attempt:', {
        campCreatedBy: camp.created_by,
        currentUserId: user?.id,
      });
      return;
    }

    // Validate status is toggleable
    if (!canTogglePublishStatus(camp.status)) {
      alert(`Cannot toggle camp in "${camp.status}" status. Only published or unpublished camps can be toggled.`);
      return;
    }

    // Check if unpublishing with confirmed bookings
    if (camp.status === 'published' && camp.enrolled_count > 0) {
      const confirmMessage = `This camp has ${camp.enrolled_count} confirmed booking(s).\n\nUnpublishing will hide the camp from parents but existing bookings remain active.\n\nAre you sure you want to unpublish "${camp.name}"?`;

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    // Optimistic update indicator
    setTogglingCampId(camp.id);
    setError(null);

    try {
      const result = await toggleCampPublishStatus(camp.id);

      if (!result.success) {
        setError(result.message);
        setNotification({
          type: 'error',
          message: result.message,
        });
        return;
      }

      // Success notification
      const action = result.new_status === 'published' ? 'published' : 'unpublished';
      const message = result.confirmed_bookings_count > 0
        ? `Camp ${action}. ${result.confirmed_bookings_count} confirmed booking(s) remain active.`
        : `Camp ${action} successfully.`;

      setNotification({
        type: 'success',
        message: message,
      });

      // Reload camps to reflect changes
      await loadCamps();
    } catch (err: any) {
      console.error('Error toggling publish status:', err);
      setError('Failed to toggle camp status. Please try again.');
      setNotification({
        type: 'error',
        message: 'Failed to toggle camp status. Please try again.',
      });
    } finally {
      setTogglingCampId(null);

      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleManageReviews = (camp: Camp) => {
    // Security check: Verify camp was created by this user
    if (camp.created_by !== user?.id) {
      alert('You can only manage reviews for camps you created.');
      console.error('Unauthorized review access attempt:', {
        campCreatedBy: camp.created_by,
        currentUserId: user?.id,
      });
      return;
    }

    setSelectedCampForReview(camp);
    setIsReviewModalOpen(true);
  };

  const handleEdit = (camp: Camp) => {
    // Security check: Verify camp was created by this user
    if (camp.created_by !== user?.id) {
      alert('You can only edit camps you created.');
      console.error('Unauthorized edit attempt:', {
        campCreatedBy: camp.created_by,
        currentUserId: user?.id,
      });
      return;
    }

    setSelectedCamp(camp);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCamp(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCamp(undefined);
  };

  const handleSuccess = () => {
    loadCamps();
    setIsModalOpen(false);
    setSelectedCamp(undefined);
  };

  const columns: Column<CampWithAvailability>[] = [
    {
      key: 'name',
      label: 'Camp Name',
      sortable: true,
      render: (camp) => (
        <div>
          <p className="font-medium text-gray-900">{camp.name}</p>
          <p className="text-xs text-gray-500 capitalize">{camp.category || 'Uncategorized'}</p>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (camp) => camp.start_date ? new Date(camp.start_date).toLocaleDateString() : 'Not set',
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (camp) => camp.end_date ? new Date(camp.end_date).toLocaleDateString() : 'Not set',
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (camp) => camp.price ? formatCurrency(camp.price, camp.currency || 'USD') : 'Free',
    },
    {
      key: 'commission',
      label: 'Platform Fee',
      sortable: true,
      render: (camp) => {
        const rate = camp.effective_commission_rate ?? 0.15;
        const isCustomRate = camp.commission_rate !== null;
        const isOrgDefault = !isCustomRate && rate !== 0.15; // If not custom and not 15%, it's org default

        return (
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {(rate * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {isCustomRate ? (
                <span className="text-amber-600">Custom rate</span>
              ) : isOrgDefault ? (
                <span className="text-blue-600">Org default</span>
              ) : (
                <span className="text-gray-600">System default</span>
              )}
            </p>
            {camp.price && (
              <p className="text-xs text-gray-500 mt-0.5">
                -{formatCurrency(camp.price * rate, camp.currency || 'USD')}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (camp) => (
        <div className="text-sm">
          <p className="font-medium">{camp.enrolled_count} / {camp.capacity || 0}</p>
          <p className={`text-xs ${
            camp.availability_status === 'full' ? 'text-red-600' :
            camp.availability_status === 'limited' ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {camp.available_places} available
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (camp) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
          pending_review: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
          requires_changes: { color: 'bg-orange-100 text-orange-700', label: 'Requires Changes' },
          published: { color: 'bg-green-100 text-green-700', label: 'Published' },
          unpublished: { color: 'bg-gray-100 text-gray-700', label: 'Unpublished' },
          rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
          approved: { color: 'bg-blue-100 text-blue-700', label: 'Approved' },
          archived: { color: 'bg-gray-100 text-gray-600', label: 'Archived' },
          full: { color: 'bg-purple-100 text-purple-700', label: 'Full' },
          cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
          completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
        };

        const config = statusConfig[camp.status] || statusConfig.draft;
        const isToggleable = canTogglePublishStatus(camp.status);
        const isToggling = togglingCampId === camp.id;

        return (
          <div>
            {isToggleable ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePublishStatus(camp);
                }}
                disabled={isToggling}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${config.color} ${
                  isToggling
                    ? 'opacity-50 cursor-wait'
                    : 'hover:scale-105 hover:shadow-md cursor-pointer'
                }`}
                title={
                  isToggling
                    ? 'Updating status...'
                    : camp.status === 'published'
                    ? 'Click to unpublish camp'
                    : 'Click to publish camp'
                }
              >
                {isToggling ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {config.label}
                  </span>
                ) : (
                  config.label
                )}
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            )}

            {/* Show admin feedback if changes requested or rejected */}
            {camp.status === 'requires_changes' && camp.changes_requested && (
              <p className="text-xs text-orange-700 mt-1">
                Changes needed: {camp.changes_requested}
              </p>
            )}
            {camp.status === 'rejected' && camp.rejection_reason && (
              <p className="text-xs text-red-700 mt-1">
                Reason: {camp.rejection_reason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (camp) => (
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(camp);
            }}
            className="p-2.5 sm:p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit camp"
          >
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleManageReviews(camp);
            }}
            className="p-2.5 sm:p-3 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Manage reviews"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(camp);
            }}
            className="p-2.5 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete camp"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    total: camps.length,
    published: camps.filter(c => c.status === 'published').length,
    pending: camps.filter(c => c.status === 'pending_review').length,
    draft: camps.filter(c => c.status === 'draft').length,
    requiresChanges: camps.filter(c => c.status === 'requires_changes').length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Camps</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track your camp listings
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleExportCSV}
              disabled={isExporting || camps.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              title="Export all camps to CSV"
            >
              <Download className="w-5 h-5" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              Create New Camp
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Stripe Connection Warning Banner */}
        {camps.length > 0 && !organization?.stripe_account_id && (
          <div className="bg-gradient-to-r from-pink-50 to-amber-50 border-2 border-pink-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Connect Stripe to Publish Your Camps
                </h3>
                <p className="text-gray-700 mb-4">
                  You have {camps.length} camp{camps.length > 1 ? 's' : ''} ready, but you need to connect your Stripe account before they can go live and start accepting bookings. This ensures you can receive payments from parents.
                </p>
                <button
                  onClick={() => navigate('/organizer/settings/payments')}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
                >
                  Connect Stripe Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Camps</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Published</p>
            <p className="text-3xl font-bold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Drafts</p>
            <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Needs Changes</p>
            <p className="text-3xl font-bold text-orange-600">{stats.requiresChanges}</p>
          </div>
        </div>

        <DataTable
          data={camps}
          columns={columns}
          searchable
          searchPlaceholder="Search camps..."
          emptyMessage="No camps found. Create your first camp to get started."
        />
      </div>

      {isModalOpen && (
        <CampFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          camp={selectedCamp}
          schoolId={profile?.organisation_id || ''}
        />
      )}

      {isReviewModalOpen && selectedCampForReview && (
        <ReviewManagementModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setEditingReview(null);
            setSelectedCampForReview(null);
          }}
          onSuccess={() => {
            loadCamps();
            setIsReviewModalOpen(false);
            setEditingReview(null);
            setSelectedCampForReview(null);
          }}
          review={editingReview}
          campId={selectedCampForReview.id}
          campName={selectedCampForReview.name}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 animate-slide-in ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : notification.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === 'success' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {notification.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            {notification.type === 'warning' && (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  notification.type === 'success'
                    ? 'text-green-900'
                    : notification.type === 'error'
                    ? 'text-red-900'
                    : 'text-amber-900'
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`flex-shrink-0 ${
                notification.type === 'success'
                  ? 'text-green-400 hover:text-green-600'
                  : notification.type === 'error'
                  ? 'text-red-400 hover:text-red-600'
                  : 'text-amber-400 hover:text-amber-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
