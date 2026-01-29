import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { getIncompleteOnboardingStats } from '../../services/onboardingService';

interface OnboardingMetrics {
  total_signups: number;
  completed_organization: number;
  created_first_camp: number;
  first_booking_received: number;
  stripe_connected: number;
  avg_time_to_first_camp_hours: number;
  incomplete_welcome: number;
  incomplete_organization: number;
  incomplete_first_camp: number;
}

interface CohortData {
  week: string;
  signups: number;
  completed: number;
  conversion_rate: number;
}

export default function OnboardingAnalytics() {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      setLoading(true);

      // Calculate date filter
      const now = new Date();
      let dateFilter = '';
      if (timeRange === '7d') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = sevenDaysAgo.toISOString();
      } else if (timeRange === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = thirtyDaysAgo.toISOString();
      } else if (timeRange === '90d') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFilter = ninetyDaysAgo.toISOString();
      }

      // Fetch camp organizer profiles
      let profilesQuery = supabase
        .from('profiles')
        .select('*, organisation_member:organisation_members!inner(organisation_id, role)')
        .eq('role', 'camp_organizer');

      if (dateFilter) {
        profilesQuery = profilesQuery.gte('created_at', dateFilter);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;

      // Fetch organizations for these profiles
      const orgIds = profiles
        ?.map(p => p.organisation_member)
        .flat()
        .filter(om => om && om.organisation_id)
        .map(om => om.organisation_id) || [];

      const { data: organizations } = await supabase
        .from('organisations')
        .select('*')
        .in('id', orgIds);

      // Fetch camps created by these organizations
      const { data: camps } = await supabase
        .from('camps')
        .select('organisation_id, created_at')
        .in('organisation_id', orgIds);

      // Fetch bookings for these organizations
      const { data: bookings } = await supabase
        .from('bookings')
        .select('camp_id, created_at, status')
        .eq('status', 'confirmed');

      // Calculate metrics
      const totalSignups = profiles?.length || 0;

      const completedOrganization = profiles?.filter(p => {
        const org = organizations?.find(o =>
          p.organisation_member?.some((om: any) => om.organisation_id === o.id)
        );
        return org && org.name && org.contact_email;
      }).length || 0;

      const orgsWithCamps = new Set(camps?.map(c => c.organisation_id) || []);
      const createdFirstCamp = orgsWithCamps.size;

      const campIds = camps?.map(c => c.organisation_id) || [];
      const orgsWithBookings = new Set(
        bookings?.filter(b => {
          const camp = camps?.find(c => campIds.includes(c.organisation_id));
          return camp !== undefined;
        }).map(b => {
          const camp = camps?.find(c => campIds.includes(c.organisation_id));
          return camp?.organisation_id;
        }).filter(Boolean) || []
      );
      const firstBookingReceived = orgsWithBookings.size;

      const stripeConnected = organizations?.filter(o => o.stripe_account_id).length || 0;

      // Calculate average time to first camp
      let totalTimeHours = 0;
      let campCount = 0;
      profiles?.forEach(profile => {
        const userOrgIds = profile.organisation_member?.map((om: any) => om.organisation_id) || [];
        const userCamps = camps?.filter(c => userOrgIds.includes(c.organisation_id));
        if (userCamps && userCamps.length > 0) {
          const signupTime = new Date(profile.created_at).getTime();
          const firstCampTime = new Date(userCamps[0].created_at).getTime();
          const hoursElapsed = (firstCampTime - signupTime) / (1000 * 60 * 60);
          totalTimeHours += hoursElapsed;
          campCount++;
        }
      });
      const avgTimeToFirstCampHours = campCount > 0 ? totalTimeHours / campCount : 0;

      // Get incomplete stats
      const incompleteStats = await getIncompleteOnboardingStats();

      setMetrics({
        total_signups: totalSignups,
        completed_organization: completedOrganization,
        created_first_camp: createdFirstCamp,
        first_booking_received: firstBookingReceived,
        stripe_connected: stripeConnected,
        avg_time_to_first_camp_hours: avgTimeToFirstCampHours,
        incomplete_welcome: incompleteStats.stuck_at_welcome,
        incomplete_organization: incompleteStats.stuck_at_organization,
        incomplete_first_camp: incompleteStats.stuck_at_first_camp,
      });

      // Generate cohort data (weekly cohorts)
      const cohortMap = new Map<string, { signups: number; completed: number }>();

      profiles?.forEach(profile => {
        const weekStart = getWeekStart(new Date(profile.created_at));
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!cohortMap.has(weekKey)) {
          cohortMap.set(weekKey, { signups: 0, completed: 0 });
        }

        const cohort = cohortMap.get(weekKey)!;
        cohort.signups += 1;

        if (profile.onboarding_completed) {
          cohort.completed += 1;
        }
      });

      const cohortData: CohortData[] = Array.from(cohortMap.entries())
        .map(([week, data]) => ({
          week,
          signups: data.signups,
          completed: data.completed,
          conversion_rate: data.signups > 0 ? (data.completed / data.signups) * 100 : 0,
        }))
        .sort((a, b) => b.week.localeCompare(a.week))
        .slice(0, 12); // Last 12 weeks

      setCohorts(cohortData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!metrics) return null;

  const funnelStages = [
    { label: 'Signups', count: metrics.total_signups, icon: Users, color: 'blue' },
    { label: 'Organization Setup', count: metrics.completed_organization, icon: CheckCircle, color: 'green' },
    { label: 'First Camp Created', count: metrics.created_first_camp, icon: Calendar, color: 'purple' },
    { label: 'First Booking', count: metrics.first_booking_received, icon: TrendingUp, color: 'pink' },
  ];

  const conversionRates = {
    signup_to_org: metrics.total_signups > 0 ? (metrics.completed_organization / metrics.total_signups) * 100 : 0,
    org_to_camp: metrics.completed_organization > 0 ? (metrics.created_first_camp / metrics.completed_organization) * 100 : 0,
    camp_to_booking: metrics.created_first_camp > 0 ? (metrics.first_booking_received / metrics.created_first_camp) * 100 : 0,
    overall: metrics.total_signups > 0 ? (metrics.first_booking_received / metrics.total_signups) * 100 : 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding Analytics</h1>
            <p className="mt-1 text-gray-600">
              Track camp owner onboarding funnel and conversion rates
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-pink-600" />
              <p className="text-sm text-gray-600">Overall Conversion</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{conversionRates.overall.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Signup to first booking</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <p className="text-sm text-gray-600">Avg. Time to Camp</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.avg_time_to_first_camp_hours.toFixed(1)}h
            </p>
            <p className="text-xs text-gray-500 mt-1">From signup to first camp</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600">Stripe Connected</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.stripe_connected}</p>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.total_signups > 0 ? ((metrics.stripe_connected / metrics.total_signups) * 100).toFixed(1) : 0}% of signups
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <p className="text-sm text-gray-600">Incomplete</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.incomplete_welcome + metrics.incomplete_organization + metrics.incomplete_first_camp}
            </p>
            <p className="text-xs text-gray-500 mt-1">Users stuck in onboarding</p>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Onboarding Funnel</h2>
          <div className="space-y-4">
            {funnelStages.map((stage, index) => {
              const percentage = metrics.total_signups > 0 ? (stage.count / metrics.total_signups) * 100 : 0;
              const Icon = stage.icon;
              const dropoff = index > 0 ? funnelStages[index - 1].count - stage.count : 0;
              const dropoffRate = index > 0 && funnelStages[index - 1].count > 0
                ? (dropoff / funnelStages[index - 1].count) * 100
                : 0;

              return (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 text-${stage.color}-600`} />
                      <span className="font-medium text-gray-900">{stage.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{stage.count}</span>
                      <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                    <div
                      className={`bg-${stage.color}-600 h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {dropoff > 0 && (
                    <p className="text-xs text-red-600">
                      ↓ {dropoff} users dropped off ({dropoffRate.toFixed(1)}% drop-off rate)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
            <p className="text-sm font-medium text-green-700 mb-1">Signup → Organization</p>
            <p className="text-3xl font-bold text-green-900">{conversionRates.signup_to_org.toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
            <p className="text-sm font-medium text-purple-700 mb-1">Organization → First Camp</p>
            <p className="text-3xl font-bold text-purple-900">{conversionRates.org_to_camp.toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200 p-6">
            <p className="text-sm font-medium text-pink-700 mb-1">First Camp → Booking</p>
            <p className="text-3xl font-bold text-pink-900">{conversionRates.camp_to_booking.toFixed(1)}%</p>
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Drop-off Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-700 mb-2">Stuck at Welcome</p>
              <p className="text-2xl font-bold text-orange-900">{metrics.incomplete_welcome}</p>
              <p className="text-xs text-orange-600 mt-1">Haven't started organization setup</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-700 mb-2">Stuck at Organization</p>
              <p className="text-2xl font-bold text-amber-900">{metrics.incomplete_organization}</p>
              <p className="text-xs text-amber-600 mt-1">Organization setup incomplete</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-2">Stuck at First Camp</p>
              <p className="text-2xl font-bold text-red-900">{metrics.incomplete_first_camp}</p>
              <p className="text-xs text-red-600 mt-1">Haven't created first camp</p>
            </div>
          </div>
        </div>

        {/* Weekly Cohorts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Cohorts</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Week Starting</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Signups</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Completed</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.week} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(cohort.week).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {cohort.signups}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {cohort.completed}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        cohort.conversion_rate >= 70 ? 'bg-green-100 text-green-700' :
                        cohort.conversion_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cohort.conversion_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
