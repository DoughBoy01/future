import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Download, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Booking {
  id: string;
  camp_name: string;
  organisation_name: string;
  child_name: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  amount_due: number;
  amount_paid: number;
  booking_date: string;
}

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterCamp, setFilterCamp] = useState<string>('all');
  const [filterOrganisation, setFilterOrganisation] = useState<string>('all');
  const [camps, setCamps] = useState<Array<{ id: string; name: string; organisation_id: string | null }>>([]);
  const [organisations, setOrganisations] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadBookings();
  }, [filterStatus, filterPayment, filterCamp, filterOrganisation]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  async function loadFilterOptions() {
    try {
      // Load camps with organisation_id
      const { data: campsData } = await supabase
        .from('camps')
        .select('id, name, organisation_id')
        .order('name');

      if (campsData) setCamps(campsData);

      // Load organisations
      const { data: orgsData } = await supabase
        .from('organisations')
        .select('id, name')
        .order('name');

      if (orgsData) setOrganisations(orgsData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }

  async function loadBookings() {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          status,
          payment_status,
          amount_due,
          amount_paid,
          created_at,
          camp_id,
          camps(id, name, organisation_id, organisations(id, name)),
          children(first_name, last_name),
          parents(profile_id, guest_name, guest_email, guest_phone, is_guest)
        `)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // Apply payment filter
      if (filterPayment !== 'all') {
        query = query.eq('payment_status', filterPayment);
      }

      // Apply camp filter
      if (filterCamp !== 'all') {
        query = query.eq('camp_id', filterCamp);
      }

      // Apply organisation filter (filter by camps from selected org)
      if (filterOrganisation !== 'all') {
        const campIds = camps
          .filter(c => c.organisation_id === filterOrganisation)
          .map(c => c.id);

        if (campIds.length > 0) {
          query = query.in('camp_id', campIds);
        } else {
          setBookings([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const bookingsPromises = (data || []).map(async (booking: any) => {
        let parentName = 'Unknown';
        let parentEmail = 'Unknown';
        let parentPhone: string | null = null;

        if (booking.parents) {
          if (booking.parents.is_guest) {
            // Guest user - use guest data
            parentName = booking.parents.guest_name || 'Guest';
            parentEmail = booking.parents.guest_email || 'Unknown';
            parentPhone = booking.parents.guest_phone || null;
          } else if (booking.parents.profile_id) {
            // Authenticated user - look up profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone')
              .eq('id', booking.parents.profile_id)
              .maybeSingle();

            if (profileData) {
              parentName = `${profileData.first_name} ${profileData.last_name}`;
              parentEmail = profileData.email || 'Unknown';
              parentPhone = profileData.phone || null;
            }
          }
        }

        return {
          id: booking.id,
          camp_name: booking.camps?.name || 'Unknown Camp',
          organisation_name: booking.camps?.organisations?.name || 'No Organisation',
          child_name: `${booking.children?.first_name || ''} ${booking.children?.last_name || ''}`.trim() || 'Unknown Child',
          parent_name: parentName,
          parent_email: parentEmail,
          parent_phone: parentPhone,
          status: booking.status,
          payment_status: booking.payment_status,
          amount_due: booking.amount_due,
          amount_paid: booking.amount_paid,
          booking_date: booking.created_at,
        };
      });

      const bookingsData = await Promise.all(bookingsPromises);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      console.error('Error details:', error.message, error.details, error.hint);
    } finally {
      setLoading(false);
    }
  }

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterPayment('all');
    setFilterCamp('all');
    setFilterOrganisation('all');
  };

  const columns: Column<Booking>[] = [
    {
      key: 'camp_name',
      label: 'Camp',
      sortable: true,
      render: (reg) => (
        <p className="font-medium text-gray-900">{reg.camp_name}</p>
      ),
    },
    {
      key: 'organisation_name',
      label: 'Seller',
      sortable: true,
      render: (reg) => (
        <p className="font-medium text-gray-900">{reg.organisation_name}</p>
      ),
    },
    {
      key: 'child_name',
      label: 'Child',
      sortable: true,
      render: (reg) => (
        <div>
          <p className="text-gray-900">{reg.child_name}</p>
          <p className="text-xs text-gray-500">{reg.parent_name}</p>
        </div>
      ),
    },
    {
      key: 'parent_email',
      label: 'Contact Details',
      sortable: true,
      render: (reg) => (
        <div>
          <p className="text-sm text-gray-900">{reg.parent_email}</p>
          {reg.parent_phone && (
            <p className="text-xs text-gray-500">{reg.parent_phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (reg) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-700',
          confirmed: 'bg-green-100 text-green-700',
          waitlisted: 'bg-blue-100 text-blue-700',
          cancelled: 'bg-red-100 text-red-700',
          completed: 'bg-gray-100 text-gray-700',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[reg.status]
            }`}
          >
            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'payment_status',
      label: 'Payment',
      sortable: true,
      render: (reg) => {
        const paymentColors = {
          unpaid: 'bg-red-100 text-red-700',
          partial: 'bg-yellow-100 text-yellow-700',
          paid: 'bg-green-100 text-green-700',
          refunded: 'bg-gray-100 text-gray-700',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              paymentColors[reg.payment_status]
            }`}
          >
            {reg.payment_status.charAt(0).toUpperCase() + reg.payment_status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'amount_paid',
      label: 'Amount',
      sortable: true,
      render: (reg) => (
        <div>
          <p className="font-medium text-gray-900">
            ${reg.amount_paid.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            of ${reg.amount_due.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      key: 'booking_date',
      label: 'Registered',
      sortable: true,
      render: (reg) => new Date(reg.booking_date).toLocaleDateString(),
    },
  ];

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
          <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage all customer bookings and purchases
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter((b) => b.payment_status === 'paid').length}
            </p>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                value={filterCamp}
                onChange={(e) => setFilterCamp(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Camps</option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
              <select
                value={filterOrganisation}
                onChange={(e) => setFilterOrganisation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sellers</option>
                {organisations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {(filterStatus !== 'all' || filterPayment !== 'all' || filterCamp !== 'all' || filterOrganisation !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <DataTable
          data={bookings}
          columns={columns}
          searchable
          searchPlaceholder="Search bookings..."
          emptyMessage="No bookings found."
        />
      </div>
    </DashboardLayout>
  );
}
