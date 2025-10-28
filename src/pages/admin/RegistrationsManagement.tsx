import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Download, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Registration {
  id: string;
  camp_name: string;
  child_name: string;
  parent_name: string;
  status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  amount_due: number;
  amount_paid: number;
  registration_date: string;
}

export function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          payment_status,
          amount_due,
          amount_paid,
          registration_date,
          camps!inner(name),
          children!inner(first_name, last_name),
          parents!inner(profile_id)
        `)
        .order('registration_date', { ascending: false });

      if (error) throw error;

      const registrationsPromises = (data || []).map(async (reg: any) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', reg.parents.profile_id)
          .maybeSingle();

        return {
          id: reg.id,
          camp_name: reg.camps.name,
          child_name: `${reg.children.first_name} ${reg.children.last_name}`,
          parent_name: profileData
            ? `${profileData.first_name} ${profileData.last_name}`
            : 'Unknown',
          status: reg.status,
          payment_status: reg.payment_status,
          amount_due: reg.amount_due,
          amount_paid: reg.amount_paid,
          registration_date: reg.registration_date,
        };
      });

      const registrationsData = await Promise.all(registrationsPromises);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRegistrations = registrations.filter((reg) => {
    if (filterStatus !== 'all' && reg.status !== filterStatus) return false;
    if (filterPayment !== 'all' && reg.payment_status !== filterPayment) return false;
    return true;
  });

  const columns: Column<Registration>[] = [
    {
      key: 'camp_name',
      label: 'Camp',
      sortable: true,
      render: (reg) => (
        <p className="font-medium text-gray-900">{reg.camp_name}</p>
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
      key: 'registration_date',
      label: 'Registered',
      sortable: true,
      render: (reg) => new Date(reg.registration_date).toLocaleDateString(),
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrations</h2>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage all camp registrations
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{registrations.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-green-600">
              {registrations.filter((r) => r.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {registrations.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-3xl font-bold text-blue-600">
              {registrations.filter((r) => r.payment_status === 'paid').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
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
          </div>
        </div>

        <DataTable
          data={filteredRegistrations}
          columns={columns}
          searchable
          searchPlaceholder="Search registrations..."
          emptyMessage="No registrations found."
        />
      </div>
    </DashboardLayout>
  );
}
