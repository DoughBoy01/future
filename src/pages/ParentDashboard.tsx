import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, User, Plus, MapPin, Clock, AlertCircle, FileText } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Child = Database['public']['Tables']['children']['Row'];
type Registration = Database['public']['Tables']['registrations']['Row'] & {
  camps: Database['public']['Tables']['camps']['Row'];
  children: Pick<Child, 'first_name' | 'last_name'>;
};

export function ParentDashboard() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  async function loadDashboardData() {
    try {
      const { data: parentData } = await supabase
        .from('parents')
        .select('id')
        .eq('profile_id', profile!.id)
        .maybeSingle();

      if (!parentData) {
        setLoading(false);
        return;
      }

      const [childrenResult, registrationsResult] = await Promise.all([
        supabase
          .from('children')
          .select('*')
          .eq('parent_id', parentData.id)
          .order('first_name'),
        supabase
          .from('registrations')
          .select(`
            *,
            camps(*),
            children(first_name, last_name)
          `)
          .eq('parent_id', parentData.id)
          .order('created_at', { ascending: false }),
      ]);

      if (childrenResult.data) setChildren(childrenResult.data);
      if (registrationsResult.data) setRegistrations(registrationsResult.data as Registration[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const incompleteRegistrations = registrations.filter(
    (reg) => !reg.form_completed && reg.payment_status === 'paid'
  );

  const upcomingRegistrations = registrations.filter(
    (reg) => reg.status === 'confirmed' && new Date(reg.camps.start_date) > new Date()
  );

  const pastRegistrations = registrations.filter(
    (reg) => reg.status === 'completed' || new Date(reg.camps.end_date) < new Date()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      waitlisted: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile?.first_name}!</h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100">Manage your children's camp registrations and activities</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {incompleteRegistrations.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2.5 sm:p-3 bg-white/20 rounded-lg flex-shrink-0">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Action Required!</h3>
                <p className="text-sm sm:text-base text-orange-100 mb-4">
                  You have {incompleteRegistrations.length} registration{incompleteRegistrations.length > 1 ? 's' : ''} pending completion.
                  Please complete the child information form to finalize your registration.
                </p>
                <div className="space-y-3">
                  {incompleteRegistrations.map((reg) => (
                    <div key={reg.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-base sm:text-lg">{reg.camps.name}</p>
                          <p className="text-orange-100 text-xs sm:text-sm">
                            {reg.children.first_name} {reg.children.last_name} • Starts {formatDate(reg.camps.start_date)}
                          </p>
                        </div>
                        <Link
                          to={`/registration/${reg.id}/child-details`}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-sm sm:text-base w-full sm:w-auto"
                        >
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                          Complete Form
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Registered Children</h3>
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{children.length}</div>
            <Link to="/children/add" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
              Add child →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Camps</h3>
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{upcomingRegistrations.length}</div>
            <Link to="/camps" className="text-sm text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
              Browse camps →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Total Registrations</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{registrations.length}</div>
            <p className="text-sm text-gray-500 mt-2">All time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Children</h2>
                <Link
                  to="/children/add"
                  className="bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Child
                </Link>
              </div>

              {children.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-gray-600 mb-4">No children registered yet</p>
                  <Link
                    to="/children/add"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                  >
                    Add your first child
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                            {child.first_name} {child.last_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Age: {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()}
                            {child.grade && ` • Grade: ${child.grade}`}
                          </p>
                        </div>
                        <Link
                          to={`/children/${child.id}`}
                          className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex-shrink-0 px-2 py-1.5 sm:px-0 sm:py-0"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Camps</h2>

              {upcomingRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No upcoming camps</p>
                  <Link
                    to="/camps"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse available camps
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingRegistrations.map((registration) => (
                    <div key={registration.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{registration.camps.name}</h3>
                          <p className="text-sm text-gray-600">
                            {registration.children.first_name} {registration.children.last_name}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                          {registration.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(registration.camps.start_date)} - {formatDate(registration.camps.end_date)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {registration.camps.location}
                        </div>
                      </div>
                      <Link
                        to={`/camps/${registration.camp_id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                      >
                        View details →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {pastRegistrations.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Camps</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pastRegistrations.slice(0, 4).map((registration) => (
                <div key={registration.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{registration.camps.name}</h3>
                      <p className="text-sm text-gray-600">
                        {registration.children.first_name} {registration.children.last_name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                      {registration.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(registration.camps.start_date)} - {formatDate(registration.camps.end_date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
