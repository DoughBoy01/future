import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalRevenue: number;
  totalCommissions: number;
  totalPayouts: number;
  platformRevenue: number;
  bookingsCount: number;
  organizationsCount: number;
  averageCommissionRate: number;
}

interface RevenueByOrganization {
  organisation_id: string;
  organisation_name: string;
  total_bookings: number;
  total_revenue: number;
  total_commissions: number;
  platform_revenue: number;
}

export function PaymentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revenueByOrg, setRevenueByOrg] = useState<RevenueByOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get overall analytics
      const { data: bookings } = await supabase
        .from('bookings')
        .select('amount_paid, payment_status, camp_id, camps(organisation_id, commission_rate)')
        .eq('payment_status', 'paid')
        .gte('confirmation_date', dateRange.startDate)
        .lte('confirmation_date', dateRange.endDate);

      const { data: commissions } = await supabase
        .from('commission_records')
        .select('commission_amount, registration_amount, commission_rate')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      const { data: payouts } = await supabase
        .from('payouts')
        .select('amount, status')
        .eq('status', 'paid')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0;
      const totalCommissions = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      const totalPayouts = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const platformRevenue = totalRevenue - totalCommissions;

      const { data: orgs } = await supabase
        .from('organisations')
        .select('id')
        .eq('active', true);

      const avgRate =
        commissions && commissions.length > 0
          ? commissions.reduce((sum, c) => sum + (c.commission_rate || 0), 0) / commissions.length
          : 0;

      setAnalytics({
        totalRevenue,
        totalCommissions,
        totalPayouts,
        platformRevenue,
        bookingsCount: bookings?.length || 0,
        organizationsCount: orgs?.length || 0,
        averageCommissionRate: avgRate,
      });

      // Revenue by organization
      const orgRevenue: Record<string, RevenueByOrganization> = {};

      bookings?.forEach((booking) => {
        const orgId = (booking.camps as any)?.organisation_id;
        if (!orgId) return;

        if (!orgRevenue[orgId]) {
          orgRevenue[orgId] = {
            organisation_id: orgId,
            organisation_name: '',
            total_bookings: 0,
            total_revenue: 0,
            total_commissions: 0,
            platform_revenue: 0,
          };
        }

        const commissionRate = (booking.camps as any)?.commission_rate || 0.15;
        const revenue = booking.amount_paid || 0;
        const commission = revenue * commissionRate;

        orgRevenue[orgId].total_bookings += 1;
        orgRevenue[orgId].total_revenue += revenue;
        orgRevenue[orgId].total_commissions += commission;
        orgRevenue[orgId].platform_revenue += revenue - commission;
      });

      // Fetch organization names
      const orgIds = Object.keys(orgRevenue);
      if (orgIds.length > 0) {
        const { data: orgNames } = await supabase
          .from('organisations')
          .select('id, name')
          .in('id', orgIds);

        orgNames?.forEach((org) => {
          if (orgRevenue[org.id]) {
            orgRevenue[org.id].organisation_name = org.name;
          }
        });
      }

      setRevenueByOrg(
        Object.values(orgRevenue).sort((a, b) => b.total_revenue - a.total_revenue)
      );
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <DashboardLayout title="Payment Analytics">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment Analytics">
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <label className="text-sm text-airbnb-grey-700 font-medium">Date Range:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-airbnb-grey-300 rounded-lg text-sm"
          />
          <span className="text-airbnb-grey-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-airbnb-grey-300 rounded-lg text-sm"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              ${analytics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">From {analytics.bookingsCount} bookings</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Platform Revenue</span>
              <TrendingUp className="w-5 h-5 text-airbnb-pink-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              ${analytics.platformRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">
              {((analytics.platformRevenue / analytics.totalRevenue) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Total Payouts</span>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              ${analytics.totalPayouts.toFixed(2)}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">Paid to organizations</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-airbnb-grey-600">Active Organizations</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-airbnb-grey-900">
              {analytics.organizationsCount}
            </div>
            <p className="text-xs text-airbnb-grey-500 mt-1">
              Avg commission: {(analytics.averageCommissionRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Revenue by Organization */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-airbnb-grey-200">
            <h2 className="text-lg font-semibold text-airbnb-grey-900">Revenue by Organization</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-airbnb-grey-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-airbnb-grey-700 uppercase">
                    Organization Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-airbnb-grey-200">
                {revenueByOrg.map((org) => (
                  <tr key={org.organisation_id} className="hover:bg-airbnb-grey-50">
                    <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                      {org.organisation_name || org.organisation_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-airbnb-grey-600">
                      {org.total_bookings}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-airbnb-grey-900">
                      ${org.total_revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      ${org.total_commissions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                      ${org.platform_revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-airbnb-grey-50 font-medium">
                <tr>
                  <td className="px-6 py-4 text-sm text-airbnb-grey-900">Total</td>
                  <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                    {revenueByOrg.reduce((sum, org) => sum + org.total_bookings, 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                    ${revenueByOrg.reduce((sum, org) => sum + org.total_revenue, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    ${revenueByOrg.reduce((sum, org) => sum + org.total_commissions, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-airbnb-grey-900">
                    ${revenueByOrg.reduce((sum, org) => sum + org.platform_revenue, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
