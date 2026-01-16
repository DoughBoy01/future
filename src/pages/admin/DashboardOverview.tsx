import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import {
  Calendar,
  DollarSign,
  Tent,
  Users,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalRegistrations: number;
  totalRevenue: number;
  activeCamps: number;
  totalParents: number;
  pendingPayments: number;
  recentRegistrations: number;
  pendingEnquiries: number;
  draftCamps: number;
  pendingReviewCamps: number;
  requiresChangesCamps: number;
  approvedCamps: number;
  rejectedCamps: number;
  unpublishedCamps: number;
  archivedCamps: number;
  totalCampOrganizers: number;
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
    pendingEnquiries: 0,
    draftCamps: 0,
    pendingReviewCamps: 0,
    requiresChangesCamps: 0,
    approvedCamps: 0,
    rejectedCamps: 0,
    unpublishedCamps: 0,
    archivedCamps: 0,
    totalCampOrganizers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      const [
        registrationsResult,
        publishedCampsResult,
        parentsResult,
        revenueResult,
        pendingPaymentsResult,
        enquiriesResult,
        draftCampsResult,
        pendingReviewCampsResult,
        requiresChangesCampsResult,
        approvedCampsResult,
        rejectedCampsResult,
        unpublishedCampsResult,
        archivedCampsResult,
        campOrganizersResult,
      ] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('parents').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('amount_paid'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).neq('payment_status', 'paid'),
        supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'requires_changes'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'unpublished'),
        supabase.from('camps').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'camp_organizer'),
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentRegs = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalRegistrations: registrationsResult.count || 0,
        totalRevenue,
        activeCamps: publishedCampsResult.count || 0,
        totalParents: parentsResult.count || 0,
        pendingPayments: pendingPaymentsResult.count || 0,
        recentRegistrations: recentRegs.count || 0,
        pendingEnquiries: enquiriesResult.count || 0,
        draftCamps: draftCampsResult.count || 0,
        pendingReviewCamps: pendingReviewCampsResult.count || 0,
        requiresChangesCamps: requiresChangesCampsResult.count || 0,
        approvedCamps: approvedCampsResult.count || 0,
        rejectedCamps: rejectedCampsResult.count || 0,
        unpublishedCamps: unpublishedCampsResult.count || 0,
        archivedCamps: archivedCampsResult.count || 0,
        totalCampOrganizers: campOrganizersResult.count || 0,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const needsAttention = [
    ...(stats.pendingReviewCamps > 0 ? [{
      title: `${stats.pendingReviewCamps} Camp${stats.pendingReviewCamps > 1 ? 's' : ''} Pending Review`,
      description: 'Camps waiting for admin approval',
      link: '/admin/dashboard/camps',
      color: 'red',
      icon: AlertCircle
    }] : []),
    ...(stats.requiresChangesCamps > 0 ? [{
      title: `${stats.requiresChangesCamps} Camp${stats.requiresChangesCamps > 1 ? 's' : ''} Need${stats.requiresChangesCamps === 1 ? 's' : ''} Changes`,
      description: 'Camps require organiser updates',
      link: '/admin/dashboard/camps',
      color: 'yellow',
      icon: Clock
    }] : []),
    ...(stats.pendingPayments > 0 ? [{
      title: `${stats.pendingPayments} Pending Payment${stats.pendingPayments > 1 ? 's' : ''}`,
      description: 'Payments awaiting processing',
      link: '/admin/dashboard/registrations',
      color: 'red',
      icon: AlertCircle
    }] : []),
    ...(stats.pendingEnquiries > 0 ? [{
      title: `${stats.pendingEnquiries} Open Enquir${stats.pendingEnquiries > 1 ? 'ies' : 'y'}`,
      description: 'Customer enquiries need response',
      link: '/admin/dashboard/enquiries',
      color: 'yellow',
      icon: MessageSquare
    }] : []),
    ...(stats.draftCamps > 0 ? [{
      title: `${stats.draftCamps} Draft Camp${stats.draftCamps > 1 ? 's' : ''}`,
      description: 'Camps being created',
      link: '/admin/dashboard/camps',
      color: 'blue',
      icon: Tent
    }] : []),
    ...(stats.approvedCamps > 0 ? [{
      title: `${stats.approvedCamps} Approved Camp${stats.approvedCamps > 1 ? 's' : ''}`,
      description: 'Camps ready to be published',
      link: '/admin/dashboard/camps',
      color: 'blue',
      icon: CheckCircle
    }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your platform today
          </p>
        </div>

        {/* Buyer Activity Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            Buyer Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    From bookings
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Registrations */}
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bookings</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.totalRegistrations}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stats.recentRegistrations} this week
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.totalParents}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Parent accounts
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="mt-2 text-3xl font-bold text-amber-600">
                    {stats.pendingPayments}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Awaiting payment
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Activity Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            Seller Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Published Camps */}
            <div className="bg-white rounded-xl border border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published Camps</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.activeCamps}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Live on platform
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Tent className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Pending Review */}
            <div className="bg-white rounded-xl border border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="mt-2 text-3xl font-bold text-amber-600">
                    {stats.pendingReviewCamps}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Awaiting approval
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Approved Camps */}
            <div className="bg-white rounded-xl border border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {stats.approvedCamps}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Ready to publish
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Camp Organizers */}
            <div className="bg-white rounded-xl border border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Organisations</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.totalCampOrganizers}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Seller accounts
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Needs Attention Section */}
        {needsAttention.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Needs Your Attention</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {needsAttention.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      item.color === 'red' ? 'bg-red-50' :
                      item.color === 'yellow' ? 'bg-yellow-50' :
                      'bg-blue-50'
                    }`}>
                      <item.icon className={`w-5 h-5 ${
                        item.color === 'red' ? 'text-red-600' :
                        item.color === 'yellow' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Good Message */}
        {needsAttention.length === 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">All caught up!</h3>
                <p className="text-sm text-green-700">No urgent items require your attention right now.</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Camps */}
          <Link
            to="/admin/dashboard/camps"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Tent className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Manage Camps</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create, edit, and publish summer camps
            </p>
            <div className="flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
              View all camps
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* View Registrations */}
          <Link
            to="/admin/dashboard/registrations"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Registrations</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Track bookings and manage payments
            </p>
            <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
              View registrations
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Customer Enquiries */}
          <Link
            to="/admin/dashboard/enquiries"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Enquiries</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Respond to customer questions
            </p>
            <div className="flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700">
              View enquiries
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Manage Customers */}
          <Link
            to="/admin/dashboard/customers"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-teal-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Customers</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View and manage parent accounts
            </p>
            <div className="flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-700">
              View customers
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Analytics */}
          <Link
            to="/admin/dashboard/analytics"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View reports and insights
            </p>
            <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
              View analytics
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Communications */}
          <Link
            to="/admin/dashboard/communications"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Communications</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send emails and announcements
            </p>
            <div className="flex items-center text-sm font-medium text-green-600 group-hover:text-green-700">
              Send message
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Camp Organizer Management */}
          <Link
            to="/admin/camp-organizers"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Camp Organizers</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Manage camp organizer accounts ({stats.totalCampOrganizers} active)
            </p>
            <div className="flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
              Manage organizers
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
