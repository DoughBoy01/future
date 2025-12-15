import { useEffect, useState } from 'react';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Plus, Edit, Trash2, MessageSquare, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CampFormModal } from '../../components/camps/CampFormModal';
import { ReviewManagementModal } from '../../components/reviews/ReviewManagementModal';
import { importExportService } from '../../services/importExportService';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import type { Database } from '../../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];

interface CampWithAvailability extends Camp {
  enrolled_count: number;
  available_places: number;
  availability_status: 'available' | 'limited' | 'full';
}

/**
 * Organizer Camps View - Shows all camps for the organizer's organization
 * Organizers can see draft, pending_review, published, requires_changes, and rejected camps
 */
export function OrganizerCampsView() {
  const { profile } = useAuth();
  const [camps, setCamps] = useState<CampWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | undefined>();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampForReview, setSelectedCampForReview] = useState<Camp | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadCamps();
  }, [profile?.organisation_id]);

  async function loadCamps() {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.organisation_id) {
        setError('No organization assigned. Please contact support.');
        setCamps([]);
        setLoading(false);
        return;
      }

      // Fetch camps for organizer's organization
      let query = supabase
        .from('camps')
        .select('*')
        .eq('organisation_id', profile.organisation_id)
        .order('created_at', { ascending: false });

      const { data: campsData, error: campsError } = await query;

      if (campsError) throw campsError;

      // Calculate enrollment and availability for each camp
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

          return {
            ...camp,
            enrolled_count: enrolled,
            available_places: available,
            availability_status: availabilityStatus,
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

  const handleManageReviews = (camp: Camp) => {
    setSelectedCampForReview(camp);
    setIsReviewModalOpen(true);
  };

  const handleEdit = (camp: Camp) => {
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
      render: (camp) => camp.price ? formatCurrency(camp.price) : 'Free',
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

        return (
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
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
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(camp);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit camp"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleManageReviews(camp);
            }}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Manage reviews"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(camp);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete camp"
          >
            <Trash2 className="w-4 h-4" />
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
            <h2 className="text-2xl font-bold text-gray-900">My Camps</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and track your camp listings
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              disabled={isExporting || camps.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export all camps to CSV"
            >
              <Download className="w-5 h-5" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
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
    </>
  );
}
