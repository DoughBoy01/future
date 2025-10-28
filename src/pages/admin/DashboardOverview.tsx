import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { Users, Calendar, DollarSign, TrendingUp, Tent, Mail, Shield, School, Banknote } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalRegistrations: number;
  totalRevenue: number;
  activeCamps: number;
  totalParents: number;
  pendingPayments: number;
  recentRegistrations: number;
  totalOrganisations: number;
  activeOrganisations: number;
  totalCommission: number;
  pendingCommission: number;
}

export function DashboardOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalRevenue: 0,
    activeCamps: 0,
    totalParents: 0,
    pendingPayments: 0,
    recentRegistrations: 0,
    totalOrganisations: 0,
    activeOrganisations: 0,
    totalCommission: 0,
    pendingCommission: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      const [
        registrationsResult,
        campsResult,
        parentsResult,
        revenueResult,
        pendingPaymentsResult,
        organisationsResult,
        commissionsResult,
      ] = await Promise.all([
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('parents').select('id', { count: 'exact', head: true }),
        supabase.from('registrations').select('amount_paid'),
        supabase.from('registrations').select('id', { count: 'exact', head: true }).neq('payment_status', 'paid'),
        supabase.from('organisations').select('id, active', { count: 'exact' }),
        supabase.from('commission_records').select('commission_amount, payment_status'),
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;
      const totalCommission = commissionsResult.data?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      const pendingCommission = commissionsResult.data?.filter(c => c.payment_status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
      const activeOrganisations = organisationsResult.data?.filter(o => o.active).length || 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentRegs = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalRegistrations: registrationsResult.count || 0,
        totalRevenue,
        activeCamps: campsResult.count || 0,
        totalParents: parentsResult.count || 0,
        pendingPayments: pendingPaymentsResult.count || 0,
        recentRegistrations: recentRegs.count || 0,
        totalOrganisations: organisationsResult.count || 0,
        activeOrganisations,
        totalCommission,
        pendingCommission,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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
        {profile?.role === 'super_admin' && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-bold">Super Administrator Access</h2>
            </div>
            <p className="text-blue-100">
              You have full system access. You can manage all schools, users, data, and system settings.
            </p>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Registrations"
              value={stats.totalRegistrations}
              icon={Calendar}
              color="blue"
              trend={{
                value: stats.recentRegistrations,
                label: 'in last 7 days',
              }}
            />
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Active Camps"
              value={stats.activeCamps}
              icon={Tent}
              color="purple"
            />
            <StatCard
              title="Total Customers"
              value={stats.totalParents}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Pending Payments"
              value={stats.pendingPayments}
              icon={TrendingUp}
              color="yellow"
            />
            <StatCard
              title="Recent Activity"
              value={stats.recentRegistrations}
              icon={Mail}
              color="green"
            />
            {profile?.role === 'super_admin' && (
              <>
                <StatCard
                  title="Organisations"
                  value={stats.totalOrganisations}
                  icon={School}
                  color="blue"
                  trend={{
                    value: stats.activeOrganisations,
                    label: 'active',
                  }}
                />
                <StatCard
                  title="Total Commission"
                  value={`$${stats.totalCommission.toLocaleString()}`}
                  icon={Banknote}
                  color="green"
                  trend={{
                    value: `$${stats.pendingCommission.toLocaleString()}`,
                    label: 'pending',
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {profile?.role === 'super_admin' && (
                <>
                  <Link
                    to="/admin/roles"
                    className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Role Management
                  </Link>
                  <Link
                    to="/admin/data-management"
                    className="block px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Data Management
                  </Link>
                </>
              )}
              <Link
                to="/admin/dashboard/camps"
                className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Manage Camps
              </Link>
              <Link
                to="/admin/dashboard/registrations"
                className="block px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                View Registrations
              </Link>
              <Link
                to="/admin/dashboard/communications"
                className="block px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Send Communication
              </Link>
              <Link
                to="/admin/dashboard/customers"
                className="block px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Manage Customers
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {stats.recentRegistrations} new registrations this week
                  </p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {stats.activeCamps} camps currently active
                  </p>
                  <p className="text-xs text-gray-500">Published and accepting registrations</p>
                </div>
              </div>
              {stats.pendingPayments > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {stats.pendingPayments} pending payments
                    </p>
                    <p className="text-xs text-gray-500">Requires attention</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
