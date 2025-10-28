import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  registrations: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
  };
  camps: {
    total: number;
    active: number;
    completed: number;
  };
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, change: 0 },
    registrations: { total: 0, thisMonth: 0, lastMonth: 0, change: 0 },
    customers: { total: 0, active: 0, new: 0 },
    camps: { total: 0, active: 0, completed: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [
        allRegistrations,
        thisMonthRegs,
        lastMonthRegs,
        allRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        parentsCount,
        campsCount,
        activeCampsCount,
        completedCampsCount,
      ] = await Promise.all([
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart.toISOString()),
        supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('registrations').select('amount_paid'),
        supabase
          .from('registrations')
          .select('amount_paid')
          .gte('created_at', thisMonthStart.toISOString()),
        supabase
          .from('registrations')
          .select('amount_paid')
          .gte('created_at', lastMonthStart.toISOString())
          .lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('parents').select('id', { count: 'exact', head: true }),
        supabase.from('camps').select('id', { count: 'exact', head: true }),
        supabase
          .from('camps')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase
          .from('camps')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed'),
      ]);

      const totalRevenue =
        allRevenue.data?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;
      const thisMonthRev =
        thisMonthRevenue.data?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;
      const lastMonthRev =
        lastMonthRevenue.data?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;

      const revenueChange =
        lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
      const regsChange =
        (lastMonthRegs.count || 0) > 0
          ? (((thisMonthRegs.count || 0) - (lastMonthRegs.count || 0)) /
              (lastMonthRegs.count || 1)) *
            100
          : 0;

      setAnalytics({
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRev,
          lastMonth: lastMonthRev,
          change: Math.round(revenueChange),
        },
        registrations: {
          total: allRegistrations.count || 0,
          thisMonth: thisMonthRegs.count || 0,
          lastMonth: lastMonthRegs.count || 0,
          change: Math.round(regsChange),
        },
        customers: {
          total: parentsCount.count || 0,
          active: parentsCount.count || 0,
          new: thisMonthRegs.count || 0,
        },
        camps: {
          total: campsCount.count || 0,
          active: activeCampsCount.count || 0,
          completed: completedCampsCount.count || 0,
        },
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="mt-1 text-sm text-gray-600">
              Track performance and key metrics
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${analytics.revenue.total.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="This Month"
              value={`$${analytics.revenue.thisMonth.toLocaleString()}`}
              icon={TrendingUp}
              color="blue"
              trend={{
                value: analytics.revenue.change,
                label: 'vs last month',
              }}
            />
            <StatCard
              title="Last Month"
              value={`$${analytics.revenue.lastMonth.toLocaleString()}`}
              icon={DollarSign}
              color="purple"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Registrations"
              value={analytics.registrations.total}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="This Month"
              value={analytics.registrations.thisMonth}
              icon={TrendingUp}
              color="green"
              trend={{
                value: analytics.registrations.change,
                label: 'vs last month',
              }}
            />
            <StatCard
              title="Last Month"
              value={analytics.registrations.lastMonth}
              icon={Calendar}
              color="yellow"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers & Camps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Customers"
              value={analytics.customers.total}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Active Camps"
              value={analytics.camps.active}
              icon={BarChart3}
              color="green"
            />
            <StatCard
              title="Completed Camps"
              value={analytics.camps.completed}
              icon={Calendar}
              color="purple"
            />
            <StatCard
              title="Total Camps"
              value={analytics.camps.total}
              icon={BarChart3}
              color="yellow"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span
                  className={`text-sm font-medium ${
                    analytics.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {analytics.revenue.change >= 0 ? '+' : ''}
                  {analytics.revenue.change}%
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Registration Growth</span>
                <span
                  className={`text-sm font-medium ${
                    analytics.registrations.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {analytics.registrations.change >= 0 ? '+' : ''}
                  {analytics.registrations.change}%
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active Camps</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.camps.active}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600">Customer Base</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.customers.total}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Revenue increased by ${(analytics.revenue.thisMonth - analytics.revenue.lastMonth).toLocaleString()} this month
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {analytics.registrations.thisMonth} new registrations in the current month
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {analytics.camps.active} active camps accepting registrations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
