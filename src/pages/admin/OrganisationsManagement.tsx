import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { School, Plus, Edit2, Eye, DollarSign, TrendingUp, Users, Calendar, CheckCircle, Clock, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { OrganisationFormModal } from '../../components/organisations/OrganisationFormModal';

interface Organisation {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  contact_email: string;
  contact_phone: string | null;
  active: boolean;
  timezone: string;
  created_at: string;
  billing_contact_name: string | null;
  billing_contact_email: string | null;
  tax_id: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  about?: string | null;
  verified?: boolean;
  response_rate?: number;
  response_time_hours?: number;
  total_camps_hosted?: number;
  established_year?: number | null;
  signup_method?: string | null;
  signup_completed_at?: string | null;
  promotional_offer_id?: string | null;
  offer_enrolled_at?: string | null;
  offer_bookings_count?: number;
  offer_expires_at?: string | null;
  stripe_account_id?: string | null;
  stripe_account_status?: string | null;
  onboarding_status?: string | null;
  onboarding_completed_at?: string | null;
}

interface Camp {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  capacity: number;
  price: number;
  category: string;
  age_min: number;
  age_max: number;
}

interface OrganisationStats {
  total_camps: number;
  active_camps: number;
  total_registrations: number;
  total_revenue: number;
  total_commission: number;
  pending_commission: number;
  camps: Camp[];
}

export function OrganisationsManagement() {
  const { profile } = useAuth();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [stats, setStats] = useState<Record<string, OrganisationStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | undefined>(undefined);

  // New filters
  const [signupMethodFilter, setSignupMethodFilter] = useState<string>('all');
  const [promoOfferFilter, setPromoOfferFilter] = useState<string>('all');
  const [stripeStatusFilter, setStripeStatusFilter] = useState<string>('all');
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrganisations();
  }, []);

  async function loadOrganisations() {
    try {
      const { data: orgsData, error: orgsError } = await supabase
        .from('organisations')
        .select('*')
        .order('name');

      if (orgsError) throw orgsError;

      if (orgsData) {
        setOrganisations(orgsData);
        await loadStatsForOrganisations(orgsData.map(o => o.id));
      }
    } catch (error) {
      console.error('Error loading organisations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStatsForOrganisations(orgIds: string[]) {
    try {
      const statsMap: Record<string, OrganisationStats> = {};

      for (const orgId of orgIds) {
        const [campsResult, regsResult, commissionResult] = await Promise.all([
          supabase
            .from('camps')
            .select('id, name, status, start_date, end_date, capacity, price, category, age_min, age_max', { count: 'exact' })
            .eq('organisation_id', orgId)
            .order('start_date', { ascending: false }),
          supabase
            .from('bookings')
            .select('amount_paid, camp_id')
            .eq('payment_status', 'paid'),
          supabase
            .from('commission_records')
            .select('commission_amount, payment_status')
            .eq('organisation_id', orgId),
        ]);

        const orgCampIds = campsResult.data?.map(c => c.id) || [];
        const orgRegistrations = regsResult.data?.filter(r => orgCampIds.includes(r.camp_id)) || [];

        const totalRevenue = orgRegistrations.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0);
        const totalCommission = commissionResult.data?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
        const pendingCommission = commissionResult.data?.filter(c => c.payment_status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

        statsMap[orgId] = {
          total_camps: campsResult.count || 0,
          active_camps: campsResult.data?.filter(c => c.status === 'published').length || 0,
          total_registrations: orgRegistrations.length,
          total_revenue: totalRevenue,
          total_commission: totalCommission,
          pending_commission: pendingCommission,
          camps: campsResult.data || [],
        };
      }

      setStats(statsMap);
    } catch (error) {
      console.error('Error loading organisation stats:', error);
    }
  }

  const filteredOrganisations = organisations.filter(org => {
    // Text search
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contact_email.toLowerCase().includes(searchTerm.toLowerCase());

    // Signup method filter
    const matchesSignupMethod = signupMethodFilter === 'all' ||
      (signupMethodFilter === 'self_service' && org.signup_method === 'self_service') ||
      (signupMethodFilter === 'invite' && org.signup_method === 'invite');

    // Promotional offer filter
    const matchesPromoOffer = promoOfferFilter === 'all' ||
      (promoOfferFilter === 'active' && org.promotional_offer_id) ||
      (promoOfferFilter === 'none' && !org.promotional_offer_id);

    // Stripe status filter
    const matchesStripeStatus = stripeStatusFilter === 'all' ||
      (stripeStatusFilter === 'connected' && org.stripe_account_id) ||
      (stripeStatusFilter === 'not_connected' && !org.stripe_account_id);

    // Onboarding status filter
    const matchesOnboardingStatus = onboardingStatusFilter === 'all' ||
      org.onboarding_status === onboardingStatusFilter;

    return matchesSearch && matchesSignupMethod && matchesPromoOffer && matchesStripeStatus && matchesOnboardingStatus;
  });

  const handleViewDetails = (org: Organisation) => {
    setSelectedOrg(org);
    setShowDetails(true);
  };

  const handleCreate = () => {
    setEditingOrg(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (org: Organisation) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOrg(undefined);
  };

  const handleSuccess = () => {
    loadOrganisations();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
            <p className="text-gray-600 mt-1">
              Manage partner schools and organisations
            </p>
          </div>
          {profile?.role === 'super_admin' && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Organisation
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <input
            type="text"
            placeholder="Search organisations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Signup Method</label>
              <select
                value={signupMethodFilter}
                onChange={(e) => setSignupMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Methods</option>
                <option value="self_service">Self-Service</option>
                <option value="invite">Invite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Promotional Offer</label>
              <select
                value={promoOfferFilter}
                onChange={(e) => setPromoOfferFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Has Active Offer</option>
                <option value="none">No Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stripe Status</label>
              <select
                value={stripeStatusFilter}
                onChange={(e) => setStripeStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="connected">Connected</option>
                <option value="not_connected">Not Connected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Onboarding Status</label>
              <select
                value={onboardingStatusFilter}
                onChange={(e) => setOnboardingStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="pending_application">Pending Application</option>
                <option value="active">Active</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredOrganisations.map((org) => {
            const orgStats = stats[org.id] || {
              total_camps: 0,
              active_camps: 0,
              total_registrations: 0,
              total_revenue: 0,
              total_commission: 0,
              pending_commission: 0,
              camps: [],
            };

            return (
              <div
                key={org.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <School className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {org.name}
                        </h3>
                        {org.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            org.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {org.active ? 'Active' : 'Inactive'}
                        </span>
                        {org.signup_method === 'self_service' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            Self-Service
                          </span>
                        )}
                        {org.promotional_offer_id && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            Promo Offer
                          </span>
                        )}
                        {org.stripe_account_id && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Stripe ✓
                          </span>
                        )}
                        {org.established_year && (
                          <span className="text-xs text-gray-500">
                            Est. {org.established_year}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Contact:</span>
                          <a href={`mailto:${org.contact_email}`} className="text-blue-600 hover:underline">
                            {org.contact_email}
                          </a>
                          {org.contact_phone && (
                            <span className="text-gray-400">|</span>
                          )}
                          {org.contact_phone}
                        </p>
                        {org.website && (
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Website:</span>
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {org.website}
                            </a>
                          </p>
                        )}
                        {(org.response_rate !== undefined || org.response_time_hours !== undefined) && (
                          <div className="flex items-center gap-4 mt-2">
                            {org.response_rate !== undefined && (
                              <div className="inline-flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="font-medium text-gray-900">
                                  {Math.round(org.response_rate * 100)}%
                                </span>
                                <span className="text-gray-500">response rate</span>
                              </div>
                            )}
                            {org.response_time_hours !== undefined && (
                              <div className="inline-flex items-center gap-1 text-xs">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {org.response_time_hours}h
                                </span>
                                <span className="text-gray-500">avg response</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>Total Camps</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {orgStats.total_camps}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Active</span>
                          </div>
                          <p className="text-lg font-semibold text-green-600">
                            {orgStats.active_camps}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Users className="w-3 h-3" />
                            <span>Registrations</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {orgStats.total_registrations}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Revenue</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            ${orgStats.total_revenue.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Commission</span>
                          </div>
                          <p className="text-lg font-semibold text-blue-600">
                            ${orgStats.total_commission.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Pending</span>
                          </div>
                          <p className="text-lg font-semibold text-amber-600">
                            ${orgStats.pending_commission.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Camps List */}
                      {orgStats.camps.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Camps ({orgStats.camps.length})
                          </h4>
                          <div className="space-y-2">
                            {orgStats.camps.map((camp) => (
                              <div
                                key={camp.id}
                                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="text-sm font-medium text-gray-900 truncate">
                                      {camp.name}
                                    </h5>
                                    <span
                                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                        camp.status === 'published'
                                          ? 'bg-green-100 text-green-700'
                                          : camp.status === 'draft'
                                          ? 'bg-gray-100 text-gray-600'
                                          : camp.status === 'full'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {camp.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      Ages {camp.age_min}-{camp.age_max}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      ${camp.price}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-white rounded text-xs font-medium">
                                      {camp.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(org)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {profile?.role === 'super_admin' && (
                      <button
                        onClick={() => handleEdit(org)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Organisation"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrganisations.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No organisations found</p>
            </div>
          )}
        </div>
      </div>

      {showDetails && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Organisation Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedOrg.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Contact Email</p>
                    <p className="text-gray-900">{selectedOrg.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Contact Phone</p>
                    <p className="text-gray-900">{selectedOrg.contact_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Website</p>
                    <p className="text-gray-900">{selectedOrg.website || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Timezone</p>
                    <p className="text-gray-900">{selectedOrg.timezone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Status</p>
                    <p className="text-gray-900">{selectedOrg.active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Tax ID</p>
                    <p className="text-gray-900">{selectedOrg.tax_id || 'N/A'}</p>
                  </div>
                  {selectedOrg.billing_contact_email && (
                    <div>
                      <p className="text-gray-600 font-medium">Billing Contact</p>
                      <p className="text-gray-900">{selectedOrg.billing_contact_name}</p>
                      <p className="text-gray-700 text-xs">{selectedOrg.billing_contact_email}</p>
                    </div>
                  )}
                  {selectedOrg.contract_start_date && (
                    <div>
                      <p className="text-gray-600 font-medium">Contract Period</p>
                      <p className="text-gray-900">
                        {new Date(selectedOrg.contract_start_date).toLocaleDateString()} -
                        {selectedOrg.contract_end_date
                          ? new Date(selectedOrg.contract_end_date).toLocaleDateString()
                          : 'Ongoing'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {stats[selectedOrg.id] && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600 font-medium">Total Camps</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {stats[selectedOrg.id].total_camps}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-600 font-medium">Active Camps</p>
                        <p className="text-2xl font-bold text-green-900">
                          {stats[selectedOrg.id].active_camps}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 font-medium">Registrations</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats[selectedOrg.id].total_registrations}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">
                          ${stats[selectedOrg.id].total_revenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600 font-medium">Total Commission</p>
                        <p className="text-2xl font-bold text-blue-900">
                          ${stats[selectedOrg.id].total_commission.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-sm text-amber-600 font-medium">Pending Commission</p>
                        <p className="text-2xl font-bold text-amber-900">
                          ${stats[selectedOrg.id].pending_commission.toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <OrganisationFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          organisation={editingOrg}
        />
      )}
    </DashboardLayout>
  );
}
