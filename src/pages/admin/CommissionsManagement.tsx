import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle, Filter, Download, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCommissionSummary } from '../../services/commissionService';
import { formatCurrency } from '../../utils/currency';

interface CommissionRecord {
  id: string;
  organisation_id: string;
  camp_id: string;
  registration_id: string;
  commission_rate: number;
  registration_amount: number;
  commission_amount: number;
  payment_status: string;
  payment_reference: string | null;
  paid_date: string | null;
  created_at: string;
  customer_name: string;
  organisation: {
    name: string;
  };
  camp: {
    name: string;
  };
}

interface CommissionSummary {
  total_commission: number;
  pending_commission: number;
  processing_commission: number;
  paid_commission: number;
  total_records: number;
  average_commission_rate: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export function CommissionsManagement() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({
    total_commission: 0,
    pending_commission: 0,
    processing_commission: 0,
    paid_commission: 0,
    total_records: 0,
    average_commission_rate: 0,
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [organisations, setOrganisations] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadData();
  }, [statusFilter, selectedOrg, dateRange]);

  async function loadData() {
    try {
      setLoading(true);

      let query = supabase
        .from('commission_records')
        .select(`
          *,
          organisation:organisations(name),
          camp:camps(name),
          booking:bookings!registration_id(parent_id, parents(is_guest, guest_name, profile_id))
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }

      if (selectedOrg !== 'all') {
        query = query.eq('organisation_id', selectedOrg);
      }

      if (dateRange.startDate) {
        query = query.gte('created_at', new Date(dateRange.startDate).toISOString());
      }

      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: commissionsData, error: commissionsError } = await query;

      if (commissionsError) throw commissionsError;

      // Process commission records and fetch customer names
      const commissionsWithCustomers = await Promise.all(
        (commissionsData || []).map(async (record: any) => {
          let customerName = 'Unknown';

          const booking = Array.isArray(record.booking) ? record.booking[0] : record.booking;
          const parent = booking?.parents;

          if (parent) {
            if (parent.is_guest) {
              customerName = parent.guest_name || 'Guest';
            } else if (parent.profile_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', parent.profile_id)
                .maybeSingle();

              if (profileData) {
                customerName = `${profileData.first_name} ${profileData.last_name}`;
              }
            }
          }

          return {
            ...record,
            customer_name: customerName,
            organisation: Array.isArray(record.organisation) ? record.organisation[0] : record.organisation,
            camp: Array.isArray(record.camp) ? record.camp[0] : record.camp,
          };
        })
      );

      const typedCommissions = commissionsWithCustomers as CommissionRecord[];

      setCommissions(typedCommissions);

      const totalCommission = typedCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const pendingCommission = typedCommissions
        .filter(c => c.payment_status === 'pending')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const processingCommission = typedCommissions
        .filter(c => c.payment_status === 'processing')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0);
      const paidCommission = typedCommissions
        .filter(c => c.payment_status === 'paid')
        .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

      const avgRate = typedCommissions.length > 0
        ? typedCommissions.reduce((sum, c) => sum + (c.commission_rate || 0), 0) / typedCommissions.length
        : 0;

      setSummary({
        total_commission: totalCommission,
        pending_commission: pendingCommission,
        processing_commission: processingCommission,
        paid_commission: paidCommission,
        total_records: typedCommissions.length,
        average_commission_rate: avgRate,
      });

      const { data: orgsData } = await supabase
        .from('organisations')
        .select('id, name')
        .order('name');

      if (orgsData) {
        setOrganisations(orgsData);
      }
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
      disputed: 'bg-red-100 text-red-700',
    };

    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Organisation', 'Camp', 'Customer', 'Registration Amount', 'Commission Rate', 'Commission Amount', 'Status', 'Payment Reference'];
    const rows = commissions.map(c => [
      new Date(c.created_at).toLocaleDateString(),
      c.organisation?.name || 'Unknown',
      c.camp?.name || 'Unknown',
      c.customer_name,
      c.registration_amount.toFixed(2),
      `${(c.commission_rate * 100).toFixed(2)}%`,
      c.commission_amount.toFixed(2),
      c.payment_status,
      c.payment_reference || 'N/A',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSelectedOrg('all');
    setDateRange({ startDate: '', endDate: '' });
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage commission payments to organisations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.total_commission.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg Rate: {(summary.average_commission_rate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${summary.pending_commission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary.paid_commission.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.total_records}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="disputed">Disputed</option>
              </select>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Organisations</option>
                {organisations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Date Range
              </button>
              {(statusFilter !== 'all' || selectedOrg !== 'all' || dateRange.startDate || dateRange.endDate) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Camp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {commission.organisation?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {commission.camp?.name || 'Unknown Camp'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {commission.customer_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${commission.registration_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(commission.commission_rate * 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        ${commission.commission_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {((commission.commission_amount / commission.registration_amount) * 100).toFixed(1)}% of sale
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          commission.payment_status
                        )}`}
                      >
                        {commission.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commission.paid_date
                        ? new Date(commission.paid_date).toLocaleDateString()
                        : new Date(commission.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {commissions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No commission records found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
