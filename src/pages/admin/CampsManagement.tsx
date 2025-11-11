import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Plus, Edit, Trash2, ExternalLink, Users, TrendingUp, CheckCircle, AlertCircle, Star, MessageSquare, Download, Upload } from 'lucide-react';
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

export function CampsManagement() {
  const { profile } = useAuth();
  const [camps, setCamps] = useState<CampWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | undefined>(undefined);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCampForReview, setSelectedCampForReview] = useState<{ id: string; name: string } | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadCamps();
  }, []);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('camps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No camps to export');
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(camp => {
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
      const filename = `camps_export_${new Date().toISOString().split('T')[0]}.csv`;

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
      const { data, error } = await supabase
        .from('camps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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
    } catch (error) {
      console.error('Error loading camps:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<CampWithAvailability>[] = [
    {
      key: 'name',
      label: 'Camp Name',
      sortable: true,
      render: (camp) => (
        <div>
          <p className="font-medium text-gray-900">{camp.name}</p>
          <p className="text-xs text-gray-500 capitalize">{camp.category}</p>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Dates',
      sortable: true,
      render: (camp) => (
        <div className="text-sm">
          <p className="text-gray-900">{new Date(camp.start_date).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">to {new Date(camp.end_date).toLocaleDateString()}</p>
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
      key: 'enrolled_count',
      label: 'Enrolled',
      sortable: true,
      render: (camp) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900">{camp.enrolled_count}</span>
        </div>
      ),
    },
    {
      key: 'content_completeness',
      label: 'Content Quality',
      sortable: true,
      render: (camp) => {
        const quality = camp.content_quality || 'incomplete';
        const completeness = camp.content_completeness || 0;

        const qualityConfig = {
          excellent: { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', label: 'Excellent', icon: CheckCircle },
          good: { color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Good', icon: CheckCircle },
          basic: { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Basic', icon: AlertCircle },
          incomplete: { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', label: 'Incomplete', icon: AlertCircle },
        };

        const config = qualityConfig[quality];
        const Icon = config.icon;

        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${config.color}`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-900 min-w-[35px]">
                {completeness}%
              </span>
            </div>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 ${config.bgColor} rounded text-xs font-medium ${config.textColor}`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </div>
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (camp) => (
        <div>
          <p className="font-medium text-gray-900">
            {formatCurrency(camp.price, camp.currency)}
          </p>
          {(camp as any).commission_rate && (
            <p className="text-xs text-green-600 font-medium">
              {((camp as any).commission_rate * 100).toFixed(1)}% commission
            </p>
          )}
          {(camp as any).payment_link && (
            <a
              href={(camp as any).payment_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Payment <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'review_count',
      label: 'Reviews',
      sortable: true,
      render: (camp) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-gray-900">
              {camp.review_count || 0}
            </span>
          </div>
          {camp.review_count! > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">
                {camp.average_rating!.toFixed(1)} avg
              </span>
            </div>
          )}
          {camp.review_count === 0 && (
            <span className="text-xs text-gray-400">No reviews</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (camp) => {
        const statusColors = {
          draft: 'bg-gray-100 text-gray-700',
          published: 'bg-green-100 text-green-700',
          full: 'bg-yellow-100 text-yellow-700',
          cancelled: 'bg-red-100 text-red-700',
          completed: 'bg-blue-100 text-blue-700',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[camp.status]
            }`}
          >
            {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
          </span>
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: camps.length,
    published: camps.filter(c => c.status === 'published').length,
    draft: camps.filter(c => c.status === 'draft').length,
    enrolled: camps.reduce((sum, c) => sum + c.enrolled_count, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Camps Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage your camp programs
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
            <p className="text-sm text-gray-600 mb-1">Drafts</p>
            <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Enrolled</p>
            <p className="text-3xl font-bold text-blue-600">{stats.enrolled}</p>
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
    </DashboardLayout>
  );
}
