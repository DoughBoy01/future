import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle, Download, Play } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  getUpcomingPayouts,
  getAllPayouts,
  processPayouts,
  getPayoutDetails,
  type PayoutSummary,
  type Payout,
} from '../../services/payoutService';

export function PayoutsManagement() {
  const [upcomingPayouts, setUpcomingPayouts] = useState<PayoutSummary[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<Payout[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState({
    status: '',
    organisationId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [upcoming, history] = await Promise.all([
        getUpcomingPayouts(),
        getAllPayouts(filter),
      ]);
      setUpcomingPayouts(upcoming);
      setPayoutHistory(history);
    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayouts = async (organisationId?: string) => {
    if (!confirm('Are you sure you want to process payouts? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      const result = await processPayouts(organisationId, true);
      alert(
        `Processed ${result.processed.length} payouts successfully. ${result.errors.length} errors.`
      );
      await loadData();
    } catch (error: any) {
      alert(`Error processing payouts: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const viewPayoutDetails = async (payoutId: string) => {
    try {
      const details = await getPayoutDetails(payoutId);
      setSelectedPayout(details);
    } catch (error) {
      console.error('Error loading payout details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'processing':
      case 'scheduled':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const totalPending = upcomingPayouts.reduce((sum, p) => sum + p.total_pending_amount, 0);
  const totalPaid = payoutHistory
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Payout Management">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Pending Payouts</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-airbnb-grey-500 mt-1">
              {upcomingPayouts.length} organizations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Total Paid (All Time)</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-airbnb-grey-500 mt-1">
              {payoutHistory.filter((p) => p.status === 'paid').length} payouts
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Processing</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              {payoutHistory.filter((p) => p.status === 'processing').length}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">Active transfers</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Failed</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              {payoutHistory.filter((p) => p.status === 'failed').length}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">Requires attention</p>
          </div>
        </div>

        {/* Upcoming Payouts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-airbnb-grey-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-airbnb-grey-900">Upcoming Payouts</h2>
            <button
              onClick={() => handleProcessPayouts()}
              disabled={processing || upcomingPayouts.length === 0}
              className="bg-airbnb-pink-600 hover:bg-airbnb-pink-700 disabled:bg-airbnb-grey-400 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Process All Payouts
                </>
              )}
            </button>
          </div>

          {upcomingPayouts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-airbnb-grey-600">No pending payouts at this time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-airbnb-grey-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Commissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                      Period
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-airbnb-grey-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-airbnb-grey-200">
                  {upcomingPayouts.map((payout) => (
                    <tr key={payout.organisation_id} className="hover:bg-airbnb-grey-50">
                      <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                        {payout.organisation_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-airbnb-grey-900">
                        ${payout.total_pending_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-airbnb-grey-600">
                        {payout.pending_commission_count} records
                      </td>
                      <td className="px-6 py-4 text-sm text-airbnb-grey-600">
                        {new Date(payout.earliest_commission_date).toLocaleDateString()} -{' '}
                        {new Date(payout.latest_commission_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleProcessPayouts(payout.organisation_id)}
                          disabled={processing}
                          className="text-airbnb-pink-600 hover:text-airbnb-pink-700 text-sm font-medium"
                        >
                          Process Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-airbnb-grey-200">
            <h2 className="text-lg font-semibold text-airbnb-grey-900">Payout History</h2>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-airbnb-grey-50 border-b border-airbnb-grey-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 border border-airbnb-grey-300 rounded-lg text-sm"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="px-3 py-2 border border-airbnb-grey-300 rounded-lg text-sm"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="px-3 py-2 border border-airbnb-grey-300 rounded-lg text-sm"
              placeholder="End Date"
            />

            <button
              onClick={() => setFilter({ status: '', organisationId: '', startDate: '', endDate: '' })}
              className="px-3 py-2 border border-airbnb-grey-300 rounded-lg text-sm hover:bg-white"
            >
              Clear Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-airbnb-grey-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-airbnb-grey-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-airbnb-grey-200">
                {payoutHistory.map((payout) => (
                  <tr key={payout.id} className="hover:bg-airbnb-grey-50">
                    <td className="px-6 py-4 text-sm text-airbnb-grey-600">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                      {(payout as any).organisations?.name || payout.organisation_id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-airbnb-grey-900">
                      ${payout.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewPayoutDetails(payout.id)}
                        className="text-airbnb-pink-600 hover:text-airbnb-pink-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout Details Modal */}
        {selectedPayout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-airbnb-grey-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-airbnb-grey-900">Payout Details</h3>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="text-airbnb-grey-600 hover:text-airbnb-grey-900"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-airbnb-grey-600">Organization</p>
                    <p className="text-lg font-medium text-airbnb-grey-900">
                      {selectedPayout.organisations?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-airbnb-grey-600">Amount</p>
                    <p className="text-lg font-medium text-airbnb-grey-900">
                      ${selectedPayout.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-airbnb-grey-600">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedPayout.status
                      )}`}
                    >
                      {selectedPayout.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-airbnb-grey-600">Period</p>
                    <p className="text-sm text-airbnb-grey-900">
                      {new Date(selectedPayout.period_start).toLocaleDateString()} -{' '}
                      {new Date(selectedPayout.period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-airbnb-grey-900 mb-3">
                    Commission Records ({selectedPayout.commissions?.length || 0})
                  </h4>
                  <div className="border border-airbnb-grey-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-airbnb-grey-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Camp</th>
                          <th className="px-4 py-2 text-left">Booking</th>
                          <th className="px-4 py-2 text-left">Rate</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-airbnb-grey-200">
                        {selectedPayout.commissions?.map((commission: any) => (
                          <tr key={commission.id}>
                            <td className="px-4 py-2">{commission.camps?.name || 'N/A'}</td>
                            <td className="px-4 py-2">{commission.booking_id}</td>
                            <td className="px-4 py-2">{(commission.commission_rate * 100).toFixed(1)}%</td>
                            <td className="px-4 py-2 text-right font-medium">
                              ${commission.commission_amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
