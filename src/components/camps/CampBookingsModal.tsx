import { useState, useEffect } from 'react';
import { X, Download, Filter, Search, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DataTable, Column } from '../dashboard/DataTable';
import { importExportService } from '../../services/importExportService';

interface Booking {
  id: string;
  camp_name: string;
  organisation_name: string;
  child_name: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  status: string;
  payment_status: string;
  amount_due: number;
  amount_paid: number;
  booking_date: string;
}

interface CampBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: {
    id: string;
    name: string;
    organisation_name?: string;
  };
}

export function CampBookingsModal({ isOpen, onClose, camp }: CampBookingsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && camp.id) {
      loadBookings();
    }
  }, [isOpen, camp.id]);

  async function loadBookings() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
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
        .eq('camp_id', camp.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

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
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  // Filter bookings based on current filter state
  const filteredBookings = bookings.filter((booking) => {
    // Status filter
    if (filterStatus !== 'all' && booking.status !== filterStatus) {
      return false;
    }

    // Payment filter
    if (filterPayment !== 'all' && booking.payment_status !== filterPayment) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.child_name.toLowerCase().includes(search) ||
        booking.parent_name.toLowerCase().includes(search) ||
        booking.parent_email.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // Calculate summary statistics
  const stats = {
    total: filteredBookings.length,
    confirmed: filteredBookings.filter((b) => b.status === 'confirmed').length,
    pendingPayment: filteredBookings.filter(
      (b) => b.payment_status === 'unpaid' || b.payment_status === 'partial'
    ).length,
    revenue: filteredBookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0),
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterPayment('all');
    setSearchTerm('');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterPayment !== 'all' || searchTerm !== '';

  const handleExportCSV = () => {
    const csvData = filteredBookings.map((booking) => ({
      'Child Name': booking.child_name,
      'Parent Name': booking.parent_name,
      'Parent Email': booking.parent_email,
      'Parent Phone': booking.parent_phone || '',
      'Status': booking.status,
      'Payment Status': booking.payment_status,
      'Amount Due': booking.amount_due,
      'Amount Paid': booking.amount_paid,
      'Booking Date': new Date(booking.booking_date).toLocaleDateString(),
    }));

    const campNameSlug = camp.name.toLowerCase().replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `camp_${campNameSlug}_bookings_${date}.csv`;

    importExportService.exportToCSV(csvData, filename);
  };

  // Table columns
  const columns: Column<Booking>[] = [
    {
      key: 'child_name',
      label: 'Child',
      sortable: true,
      render: (booking) => (
        <div>
          <div className="font-medium text-gray-900">{booking.child_name}</div>
          <div className="text-sm text-gray-500">{booking.parent_name}</div>
        </div>
      ),
    },
    {
      key: 'parent_email',
      label: 'Contact',
      sortable: true,
      render: (booking) => (
        <div>
          <div className="text-sm text-gray-900">{booking.parent_email}</div>
          {booking.parent_phone && (
            <div className="text-sm text-gray-500">{booking.parent_phone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (booking) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-green-100 text-green-800',
          waitlisted: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-red-100 text-red-800',
          completed: 'bg-gray-100 text-gray-800',
        };
        const color = statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {booking.status}
          </span>
        );
      },
    },
    {
      key: 'payment_status',
      label: 'Payment',
      sortable: true,
      render: (booking) => {
        const paymentColors = {
          unpaid: 'bg-red-100 text-red-800',
          partial: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-green-100 text-green-800',
          refunded: 'bg-gray-100 text-gray-800',
        };
        const color = paymentColors[booking.payment_status as keyof typeof paymentColors] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {booking.payment_status}
          </span>
        );
      },
    },
    {
      key: 'amount_paid',
      label: 'Amount',
      sortable: true,
      render: (booking) => (
        <div>
          <div className="font-medium text-gray-900">
            ${booking.amount_paid?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500">
            of ${booking.amount_due?.toFixed(2) || '0.00'}
          </div>
        </div>
      ),
    },
    {
      key: 'booking_date',
      label: 'Booking Date',
      sortable: true,
      render: (booking) => (
        <div className="text-sm text-gray-900">
          {new Date(booking.booking_date).toLocaleDateString()}
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookings-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="bookings-modal-title" className="text-2xl font-bold text-gray-900">
              Bookings for {camp.name}
            </h2>
            {camp.organisation_name && (
              <p className="text-sm text-gray-500 mt-1">{camp.organisation_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : (
            <>
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Pending Payment</p>
                      <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingPayment}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-pink-600 mt-1">${stats.revenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-pink-400" />
                  </div>
                </div>
              </div>

              {/* Filters and Actions Bar */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Status Filter */}
                    <div className="flex-1">
                      <label htmlFor="status-filter" className="sr-only">
                        Filter by status
                      </label>
                      <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Payment Filter */}
                    <div className="flex-1">
                      <label htmlFor="payment-filter" className="sr-only">
                        Filter by payment status
                      </label>
                      <select
                        id="payment-filter"
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="all">All Payments</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                      <label htmlFor="search-bookings" className="sr-only">
                        Search bookings
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          id="search-bookings"
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Bookings Table */}
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                  <p className="text-sm text-gray-500">
                    {hasActiveFilters
                      ? 'Try adjusting your filters to see more results.'
                      : 'This camp has no bookings yet.'}
                  </p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredBookings} searchable={false} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
