import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Users, DollarSign, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import {
  getAllPromotionalOffers,
  createPromotionalOffer,
  updatePromotionalOffer,
  deletePromotionalOffer,
  getOfferStatistics,
  type PromotionalOffer,
  type OfferStatistics,
} from '../../services/promotionalOfferService';

interface OfferFormData {
  name: string;
  description: string;
  offer_type: 'percentage_discount' | 'free_bookings' | 'trial_period';
  discount_rate: number | null;
  free_booking_limit: number | null;
  trial_period_months: number | null;
  trial_discount_rate: number | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  auto_apply_to_signups: boolean;
  display_text: string;
}

export default function PromotionalOffersManagement() {
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PromotionalOffer | null>(null);
  const [offerStats, setOfferStats] = useState<Record<string, OfferStatistics>>({});
  const [formData, setFormData] = useState<OfferFormData>({
    name: '',
    description: '',
    offer_type: 'free_bookings',
    discount_rate: null,
    free_booking_limit: 5,
    trial_period_months: null,
    trial_discount_rate: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    active: true,
    auto_apply_to_signups: true,
    display_text: '',
  });

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      setLoading(true);
      const data = await getAllPromotionalOffers();
      setOffers(data);

      // Load statistics for each offer
      const stats: Record<string, OfferStatistics> = {};
      for (const offer of data) {
        const offerStats = await getOfferStatistics(offer.id);
        stats[offer.id] = offerStats;
      }
      setOfferStats(stats);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingOffer(null);
    setFormData({
      name: '',
      description: '',
      offer_type: 'free_bookings',
      discount_rate: null,
      free_booking_limit: 5,
      trial_period_months: null,
      trial_discount_rate: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      active: true,
      auto_apply_to_signups: true,
      display_text: '',
    });
    setIsModalOpen(true);
  }

  function handleEdit(offer: PromotionalOffer) {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description || '',
      offer_type: offer.offer_type,
      discount_rate: offer.discount_rate,
      free_booking_limit: offer.free_booking_limit,
      trial_period_months: offer.trial_period_months,
      trial_discount_rate: offer.trial_discount_rate,
      start_date: offer.start_date.split('T')[0],
      end_date: offer.end_date ? offer.end_date.split('T')[0] : null,
      active: offer.active,
      auto_apply_to_signups: offer.auto_apply_to_signups,
      display_text: offer.display_text || '',
    });
    setIsModalOpen(true);
  }

  async function handleDelete(offer: PromotionalOffer) {
    if (!confirm(`Are you sure you want to delete "${offer.name}"?`)) return;

    try {
      await deletePromotionalOffer(offer.id);
      await loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer. It may be in use by organizations.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingOffer) {
        await updatePromotionalOffer(editingOffer.id, formData);
      } else {
        await createPromotionalOffer(formData);
      }
      setIsModalOpen(false);
      await loadOffers();
    } catch (error: any) {
      console.error('Error saving offer:', error);
      alert(error.message || 'Failed to save offer');
    }
  }

  async function toggleActive(offer: PromotionalOffer) {
    try {
      await updatePromotionalOffer(offer.id, { active: !offer.active });
      await loadOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  }

  const columns: Column<PromotionalOffer>[] = [
    {
      key: 'name',
      label: 'Offer Name',
      sortable: true,
      render: (offer) => (
        <div>
          <p className="font-medium text-gray-900">{offer.name}</p>
          <p className="text-xs text-gray-500">{offer.description}</p>
        </div>
      ),
    },
    {
      key: 'offer_type',
      label: 'Type',
      sortable: true,
      render: (offer) => {
        const typeLabels = {
          percentage_discount: 'Percentage Discount',
          free_bookings: 'Free Bookings',
          trial_period: 'Trial Period',
        };
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {typeLabels[offer.offer_type]}
          </span>
        );
      },
    },
    {
      key: 'display_text',
      label: 'Display Text',
      render: (offer) => (
        <span className="text-sm text-gray-700">{offer.display_text || '-'}</span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (offer) => {
        const now = new Date();
        const startDate = new Date(offer.start_date);
        const endDate = offer.end_date ? new Date(offer.end_date) : null;
        const isActive = offer.active && now >= startDate && (!endDate || now <= endDate);

        return (
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            {offer.auto_apply_to_signups && isActive && (
              <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                Auto-apply
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'stats',
      label: 'Usage',
      render: (offer) => {
        const stats = offerStats[offer.id];
        if (!stats) return <span className="text-gray-400">Loading...</span>;

        return (
          <div className="text-sm">
            <p className="font-medium text-gray-900">{stats.organizations_enrolled} orgs</p>
            <p className="text-xs text-gray-600">{stats.total_bookings} bookings</p>
          </div>
        );
      },
    },
    {
      key: 'dates',
      label: 'Period',
      render: (offer) => (
        <div className="text-xs text-gray-600">
          <p>Start: {new Date(offer.start_date).toLocaleDateString()}</p>
          {offer.end_date && (
            <p>End: {new Date(offer.end_date).toLocaleDateString()}</p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (offer) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleActive(offer);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={offer.active ? 'Deactivate' : 'Activate'}
          >
            {offer.active ? (
              <ToggleRight className="w-4 h-4 text-green-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(offer);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(offer);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalOrganizations = Object.values(offerStats).reduce((sum, stats) => sum + stats.organizations_enrolled, 0);
  const totalBookings = Object.values(offerStats).reduce((sum, stats) => sum + stats.total_bookings, 0);
  const totalSavings = Object.values(offerStats).reduce((sum, stats) => sum + stats.total_commission_savings, 0);
  const activeOffers = offers.filter(o => o.active).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotional Offers</h1>
            <p className="mt-1 text-gray-600">
              Manage promotional commission offers for camp owners
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Offer
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-pink-600" />
              <p className="text-sm text-gray-600">Active Offers</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeOffers}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <p className="text-sm text-gray-600">Enrolled Orgs</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalOrganizations}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-amber-600" />
              <p className="text-sm text-gray-600">Total Savings</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${totalSavings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Offers Table */}
        <DataTable
          data={offers}
          columns={columns}
          searchable
          searchPlaceholder="Search offers..."
          emptyMessage="No promotional offers found. Create your first offer to get started."
        />

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., Launch Offer 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="Internal description of the offer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Text *
                    </label>
                    <input
                      type="text"
                      value={formData.display_text}
                      onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g., First 5 bookings commission-free!"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be shown on the landing page and during signup
                    </p>
                  </div>

                  {/* Offer Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Type *
                    </label>
                    <select
                      value={formData.offer_type}
                      onChange={(e) => setFormData({ ...formData, offer_type: e.target.value as any })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="free_bookings">Free Bookings</option>
                      <option value="percentage_discount">Percentage Discount</option>
                      <option value="trial_period">Trial Period</option>
                    </select>
                  </div>

                  {/* Conditional Fields Based on Offer Type */}
                  {formData.offer_type === 'free_bookings' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Free Bookings *
                      </label>
                      <input
                        type="number"
                        value={formData.free_booking_limit || ''}
                        onChange={(e) => setFormData({ ...formData, free_booking_limit: parseInt(e.target.value) })}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="5"
                      />
                    </div>
                  )}

                  {formData.offer_type === 'percentage_discount' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Rate (as decimal) *
                      </label>
                      <input
                        type="number"
                        value={formData.discount_rate || ''}
                        onChange={(e) => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) })}
                        required
                        step="0.01"
                        min="0"
                        max="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="0.10 for 10%"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter 0.10 for 10% commission (instead of standard 15%)
                      </p>
                    </div>
                  )}

                  {formData.offer_type === 'trial_period' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trial Period (months) *
                        </label>
                        <input
                          type="number"
                          value={formData.trial_period_months || ''}
                          onChange={(e) => setFormData({ ...formData, trial_period_months: parseInt(e.target.value) })}
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trial Discount Rate *
                        </label>
                        <input
                          type="number"
                          value={formData.trial_discount_rate || ''}
                          onChange={(e) => setFormData({ ...formData, trial_discount_rate: parseFloat(e.target.value) })}
                          required
                          step="0.01"
                          min="0"
                          max="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          placeholder="0.10"
                        />
                      </div>
                    </>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 text-pink-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.auto_apply_to_signups}
                        onChange={(e) => setFormData({ ...formData, auto_apply_to_signups: e.target.checked })}
                        className="w-5 h-5 text-pink-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Auto-apply to new signups
                      </span>
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-pink-600 shadow-lg"
                  >
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
