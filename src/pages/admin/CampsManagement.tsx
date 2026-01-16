import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Plus, Edit, Trash2, Users, CheckCircle, AlertCircle, MessageSquare, Download, XCircle, FileEdit, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CampFormModal } from '../../components/camps/CampFormModal';
import { CampBookingsModal } from '../../components/camps/CampBookingsModal';
import { CampRowDetails } from '../../components/camps/CampRowDetails';
import { ReviewManagementModal } from '../../components/reviews/ReviewManagementModal';
import { importExportService } from '../../services/importExportService';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];

interface CampWithAvailability extends Camp {
  enrolled_count: number;
  available_places: number;
  availability_status: 'available' | 'limited' | 'full';
  content_completeness?: number;
  content_quality?: 'excellent' | 'good' | 'basic' | 'incomplete';
  review_count?: number;
  average_rating?: number;
}

function calculateContentCompleteness(camp: Camp): { completeness: number; quality: 'excellent' | 'good' | 'basic' | 'incomplete' } {
  let score = 0;
  const maxScore = 12;

  if (camp.description && camp.description.length > 100) score += 1;
  if (camp.featured_image_url) score += 1;
  if ((camp as any).video_url) score += 1;
  if ((camp as any).highlights && Array.isArray((camp as any).highlights) && (camp as any).highlights.length > 0) score += 1;
  if ((camp as any).amenities && Array.isArray((camp as any).amenities) && (camp as any).amenities.length > 0) score += 1;
  if ((camp as any).faqs && Array.isArray((camp as any).faqs) && (camp as any).faqs.length > 0) score += 1;
  if ((camp as any).cancellation_policy) score += 1;
  if ((camp as any).refund_policy) score += 1;
  if ((camp as any).safety_protocols) score += 1;
  if ((camp as any).insurance_info) score += 1;
  if (camp.what_to_bring) score += 1;
  if (camp.requirements) score += 1;

  const percentage = Math.round((score / maxScore) * 100);

  let quality: 'excellent' | 'good' | 'basic' | 'incomplete';
  if (percentage >= 90) quality = 'excellent';
  else if (percentage >= 70) quality = 'good';
  else if (percentage >= 50) quality = 'basic';
  else quality = 'incomplete';

  return { completeness: percentage, quality };
}

// Exported content component (can be wrapped with different layouts)
export function CampsManagementContent() {
  const { profile } = useAuth();
  const [camps, setCamps] = useState<CampWithAvailability[]>([]);
  const [organisations, setOrganisations] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | undefined>(undefined);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampForReview, setSelectedCampForReview] = useState<{ id: string; name: string } | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [selectedCampForBookings, setSelectedCampForBookings] = useState<{ id: string; name: string; organisation_name?: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOrganisation, setFilterOrganisation] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');

  useEffect(() => {
    loadOrganisations().then(() => loadCamps());
  }, []);

  async function loadOrganisations() {
    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('id, name');

      if (error) throw error;

      const orgMap = new Map<string, string>();
      (data || []).forEach(org => {
        orgMap.set(org.id, org.name);
      });
      setOrganisations(orgMap);
    } catch (error) {
      console.error('Error loading organisations:', error);
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Check if filters are active
      const hasFilters =
        filterStatus !== 'all' ||
        filterOrganisation !== 'all' ||
        filterAvailability !== 'all' ||
        filterQuality !== 'all' ||
        filterCategory !== 'all' ||
        filterFeatured !== 'all';

      // Use filtered camps if filters are active, otherwise fetch all
      let dataToExport: any[];

      if (hasFilters && camps.length > 0) {
        // Apply filters to loaded camps
        dataToExport = camps.filter((camp) => {
          if (filterStatus !== 'all' && camp.status !== filterStatus) return false;
          if (filterOrganisation !== 'all' && camp.organisation_id !== filterOrganisation) return false;
          if (filterAvailability !== 'all' && camp.availability_status !== filterAvailability) return false;
          if (filterQuality !== 'all' && camp.content_quality !== filterQuality) return false;
          if (filterCategory !== 'all' && camp.category !== filterCategory) return false;
          if (filterFeatured !== 'all') {
            const isFeatured = camp.featured === true;
            if (filterFeatured === 'featured' && !isFeatured) return false;
            if (filterFeatured === 'not_featured' && isFeatured) return false;
          }
          return true;
        });
      } else {
        // No filters - fetch all camps
        let query = supabase
          .from('camps')
          .select('*')
          .order('created_at', { ascending: false });

        // Filter camps for camp organizers (only their organization's camps)
        if (profile?.role === 'camp_organizer' && profile?.organisation_id) {
          query = query.eq('organisation_id', profile.organisation_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        dataToExport = data || [];
      }

      if (!dataToExport || dataToExport.length === 0) {
        alert('No camps to export');
        return;
      }

      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(camp => {
        return Object.values(camp).map(value => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      });

      const csv = '\uFEFF' + [headers, ...rows].join('\n');
      const filename = hasFilters
        ? `camps_filtered_export_${new Date().toISOString().split('T')[0]}.csv`
        : `camps_export_${new Date().toISOString().split('T')[0]}.csv`;

      importExportService.downloadFile(csv, filename, 'text/csv');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export camps');
    } finally {
      setIsExporting(false);
    }
  };

  async function loadCamps() {
    try {
      setLoading(true);
      setError(null);

      console.log('[CampsManagement] ===== DEBUGGING =====');
      console.log('[CampsManagement] Profile:', profile);
      console.log('[CampsManagement] Role:', profile?.role);
      console.log('[CampsManagement] Organisation ID:', profile?.organisation_id);
      console.log('[CampsManagement] Is camp_organizer?', profile?.role === 'camp_organizer');
      console.log('[CampsManagement] Has org ID?', !!profile?.organisation_id);

      // Build query based on user role
      let query = supabase
        .from('camps')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter camps for camp organizers (only their organization's camps)
      if (profile?.role === 'camp_organizer' && profile?.organisation_id) {
        console.log('[CampsManagement] ✅ FILTERING camps by organisation_id:', profile.organisation_id);
        query = query.eq('organisation_id', profile.organisation_id);
      } else {
        console.log('[CampsManagement] ⚠️ NOT FILTERING - showing all camps');
        console.log('[CampsManagement] Reason: role is', profile?.role, 'org_id is', profile?.organisation_id);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('[CampsManagement] Query error:', queryError);
        setError(`Failed to load camps: ${queryError.message}`);
        return;
      }

      console.log('[CampsManagement] Loaded camps count:', data?.length || 0);

      const campsWithAvailability: CampWithAvailability[] = await Promise.all(
        (data || []).map(async (camp) => {
          const { completeness, quality } = calculateContentCompleteness(camp);

          const { data: feedbackData } = await supabase
            .from('feedback')
            .select('overall_rating')
            .eq('camp_id', camp.id);

          const reviewCount = feedbackData?.length || 0;
          const averageRating = reviewCount > 0
            ? feedbackData!.reduce((sum, f) => sum + f.overall_rating, 0) / reviewCount
            : 0;

          return {
            ...camp,
            enrolled_count: (camp as any).enrolled_count || 0,
            available_places: camp.capacity - ((camp as any).enrolled_count || 0),
            availability_status:
              camp.capacity - ((camp as any).enrolled_count || 0) <= 0 ? 'full' :
              camp.capacity - ((camp as any).enrolled_count || 0) <= 5 ? 'limited' : 'available',
            content_completeness: completeness,
            content_quality: quality,
            review_count: reviewCount,
            average_rating: averageRating
          };
        })
      );

      setCamps(campsWithAvailability);
    } catch (err) {
      console.error('[CampsManagement] Unexpected error:', err);
      setError('An unexpected error occurred while loading camps');
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<CampWithAvailability>[] = [
    {
      key: 'name',
      label: 'Camp Name',
      sortable: true,
      render: (camp) => {
        const orgName = camp.organisation_id
          ? organisations.get(camp.organisation_id) || 'Unknown Organization'
          : 'No Organization';

        return (
          <div>
            <p className="font-medium text-gray-900">{camp.name}</p>
            <p className="text-xs text-gray-500">{orgName}</p>
          </div>
        );
      },
    },
    {
      key: 'start_date',
      label: 'Dates',
      sortable: true,
      render: (camp) => (
        <div className="text-sm text-gray-900">
          {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Availability',
      sortable: true,
      render: (camp) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {camp.available_places} / {camp.capacity}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {camp.availability_status === 'full' ? (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                Full
              </span>
            ) : camp.availability_status === 'limited' ? (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                Limited
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                Available
              </span>
            )}
          </div>
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
          published: { color: 'bg-blue-100 text-blue-700', label: 'Published' },
          pending_review: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
          requires_changes: { color: 'bg-orange-100 text-orange-700', label: 'Requires Changes' },
          approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
          unpublished: { color: 'bg-gray-100 text-gray-700', label: 'Unpublished' },
          archived: { color: 'bg-gray-100 text-gray-600', label: 'Archived' },
          rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
          full: { color: 'bg-purple-100 text-purple-700', label: 'Full' },
          cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
          completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
        };

        const config = statusConfig[camp.status] || statusConfig.draft;

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (camp) => (
        <div className="flex gap-2">
          {/* Approval Actions for pending_review camps */}
          {camp.status === 'pending_review' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveCamp(camp);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Approve and publish"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequestChanges(camp);
                }}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Request changes"
              >
                <FileEdit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectCamp(camp);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject camp"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Standard Actions */}
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
              handleViewBookings(camp);
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="View bookings"
            aria-label={`View bookings for ${camp.name}`}
          >
            <Users className="w-4 h-4" />
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
  };

  const handleManageReviews = (camp: Camp) => {
    setSelectedCampForReview({ id: camp.id, name: camp.name });
    setEditingReview(null);
    setIsReviewModalOpen(true);
  };

  const handleViewBookings = (camp: Camp) => {
    setSelectedCampForBookings({
      id: camp.id,
      name: camp.name,
      organisation_name: organisations.get(camp.organisation_id)
    });
    setIsBookingsModalOpen(true);
  };

  const handleDelete = async (camp: Camp) => {
    if (!confirm(`Are you sure you want to delete "${camp.name}"?`)) return;

    try {
      const { error } = await supabase.from('camps').delete().eq('id', camp.id);
      if (error) throw error;
      setCamps(camps.filter((c) => c.id !== camp.id));
    } catch (error) {
      console.error('Error deleting camp:', error);
      alert('Failed to delete camp');
    }
  };

  const handleApproveCamp = async (camp: Camp) => {
    if (!confirm(`Approve and publish "${camp.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('camps')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', camp.id);

      if (error) throw error;

      // Reload camps to refresh the list
      await loadCamps();
      alert(`"${camp.name}" has been published!`);
    } catch (error) {
      console.error('Error approving camp:', error);
      alert('Failed to approve camp');
    }
  };

  const handleRequestChanges = async (camp: Camp) => {
    const changes = prompt(`What changes are needed for "${camp.name}"?`);
    if (!changes) return;

    try {
      const { error } = await supabase
        .from('camps')
        .update({
          status: 'requires_changes',
          changes_requested: changes
        })
        .eq('id', camp.id);

      if (error) throw error;

      await loadCamps();
      alert('Camp organizer has been notified of required changes');
    } catch (error) {
      console.error('Error requesting changes:', error);
      alert('Failed to request changes');
    }
  };

  const handleRejectCamp = async (camp: Camp) => {
    const reason = prompt(`Reason for rejecting "${camp.name}"?`);
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('camps')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', camp.id);

      if (error) throw error;

      await loadCamps();
      alert('Camp has been rejected');
    } catch (error) {
      console.error('Error rejecting camp:', error);
      alert('Failed to reject camp');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus('all');
    setFilterOrganisation('all');
    setFilterAvailability('all');
    setFilterQuality('all');
    setFilterCategory('all');
    setFilterFeatured('all');
  };

  // Check if any filters are active
  const hasActiveFilters =
    filterStatus !== 'all' ||
    filterOrganisation !== 'all' ||
    filterAvailability !== 'all' ||
    filterQuality !== 'all' ||
    filterCategory !== 'all' ||
    filterFeatured !== 'all';

  // Expanded row render function for camp details
  const expandedRowRender = (camp: CampWithAvailability) => {
    return (
      <CampRowDetails
        camp={camp}
        organisation_name={camp.organisation_id ? organisations.get(camp.organisation_id) : undefined}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Apply filters to camps
  const filteredCamps = camps.filter((camp) => {
    // Status filter
    if (filterStatus !== 'all' && camp.status !== filterStatus) return false;

    // Organisation filter
    if (filterOrganisation !== 'all' && camp.organisation_id !== filterOrganisation) return false;

    // Availability filter
    if (filterAvailability !== 'all' && camp.availability_status !== filterAvailability) return false;

    // Content quality filter
    if (filterQuality !== 'all' && camp.content_quality !== filterQuality) return false;

    // Category filter
    if (filterCategory !== 'all' && camp.category !== filterCategory) return false;

    // Featured filter
    if (filterFeatured !== 'all') {
      const isFeatured = camp.featured === true;
      if (filterFeatured === 'featured' && !isFeatured) return false;
      if (filterFeatured === 'not_featured' && isFeatured) return false;
    }

    return true;
  });

  const stats = {
    total: filteredCamps.length,
    published: filteredCamps.filter(c => c.status === 'published').length,
    pending: filteredCamps.filter(c => c.status === 'pending_review').length,
    draft: filteredCamps.filter(c => c.status === 'draft').length,
  };

  return (
    <>
      <div className="space-y-6">
        {/* DEBUG INFO - Remove this after testing */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <p className="text-sm font-mono">
            <strong>DEBUG:</strong> Role: {profile?.role || 'none'} | Org ID: {profile?.organisation_id || 'none'}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            {profile?.role === 'camp_organizer' && profile?.organisation_id
              ? '✅ Filtering camps by your organization'
              : '⚠️ Showing ALL camps (you are not a camp_organizer or missing org_id)'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Camps Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all camps on the platform
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
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <p className="text-red-600 text-sm mt-2">
              If you believe you should have access to camps, please check your permissions or contact support.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Filter Label */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            {/* Filter Controls Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="requires_changes">Requires Changes</option>
                  <option value="rejected">Rejected</option>
                  <option value="full">Full</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Organisation Filter */}
              <div>
                <label htmlFor="org-filter" className="sr-only">Filter by organisation</label>
                <select
                  id="org-filter"
                  value={filterOrganisation}
                  onChange={(e) => setFilterOrganisation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Organisations</option>
                  {Array.from(organisations.entries())
                    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                    .map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label htmlFor="availability-filter" className="sr-only">Filter by availability</label>
                <select
                  id="availability-filter"
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available (5+ spots)</option>
                  <option value="limited">Limited (1-5 spots)</option>
                  <option value="full">Full</option>
                </select>
              </div>

              {/* Content Quality Filter */}
              <div>
                <label htmlFor="quality-filter" className="sr-only">Filter by content quality</label>
                <select
                  id="quality-filter"
                  value={filterQuality}
                  onChange={(e) => setFilterQuality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Quality Levels</option>
                  <option value="excellent">Excellent (90-100%)</option>
                  <option value="good">Good (70-89%)</option>
                  <option value="basic">Basic (50-69%)</option>
                  <option value="incomplete">Incomplete (&lt;50%)</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select
                  id="category-filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Categories</option>
                  <option value="sports">Sports</option>
                  <option value="arts">Arts</option>
                  <option value="stem">STEM</option>
                  <option value="language">Language</option>
                  <option value="adventure">Adventure</option>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              {/* Featured Filter */}
              <div>
                <label htmlFor="featured-filter" className="sr-only">Filter by featured status</label>
                <select
                  id="featured-filter"
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Camps</option>
                  <option value="featured">Featured Only</option>
                  <option value="not_featured">Not Featured</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filter Count */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredCamps.length}</span> of{' '}
                <span className="font-semibold">{camps.length}</span> camps
              </p>
            </div>
          )}
        </div>

        <DataTable
          data={filteredCamps}
          columns={columns}
          searchable
          searchPlaceholder="Search camps..."
          emptyMessage="No camps found. Create your first camp to get started."
          expandable={true}
          expandedRowRender={expandedRowRender}
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

      {isBookingsModalOpen && selectedCampForBookings && (
        <CampBookingsModal
          isOpen={isBookingsModalOpen}
          onClose={() => {
            setIsBookingsModalOpen(false);
            setSelectedCampForBookings(null);
          }}
          camp={selectedCampForBookings}
        />
      )}
    </>
  );
}

// Admin version with DashboardLayout wrapper
export function CampsManagement() {
  return (
    <DashboardLayout>
      <CampsManagementContent />
    </DashboardLayout>
  );
}
