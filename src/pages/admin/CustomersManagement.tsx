import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Mail, Phone, UserPlus, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Customer {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  children_count: number;
  registrations_count: number;
  created_at: string;
}

export function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const { data: parentsData, error: parentsError } = await supabase
        .from('parents')
        .select(`
          id,
          profile_id,
          profiles!inner(
            first_name,
            last_name,
            phone
          ),
          created_at
        `);

      if (parentsError) throw parentsError;

      const customerPromises = (parentsData || []).map(async (parent: any) => {
        const [childrenResult, registrationsResult, authResult] = await Promise.all([
          supabase
            .from('children')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', parent.id),
          supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', parent.id),
          supabase.auth.admin.getUserById(parent.profile_id),
        ]);

        return {
          id: parent.id,
          profile_id: parent.profile_id,
          first_name: parent.profiles.first_name,
          last_name: parent.profiles.last_name,
          email: authResult.data.user?.email || '',
          phone: parent.profiles.phone,
          children_count: childrenResult.count || 0,
          registrations_count: registrationsResult.count || 0,
          created_at: parent.created_at,
        };
      });

      const customersData = await Promise.all(customerPromises);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: 'first_name',
      label: 'Name',
      sortable: true,
      render: (customer) => (
        <div>
          <p className="font-medium text-gray-900">
            {customer.first_name} {customer.last_name}
          </p>
          <p className="text-xs text-gray-500">{customer.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (customer) => (
        <div className="flex items-center gap-2 text-gray-700">
          {customer.phone ? (
            <>
              <Phone className="w-4 h-4 text-gray-400" />
              {customer.phone}
            </>
          ) : (
            <span className="text-gray-400">No phone</span>
          )}
        </div>
      ),
    },
    {
      key: 'children_count',
      label: 'Children',
      sortable: true,
      render: (customer) => (
        <span className="text-gray-900">{customer.children_count}</span>
      ),
    },
    {
      key: 'registrations_count',
      label: 'Registrations',
      sortable: true,
      render: (customer) => (
        <span className="font-medium text-blue-600">{customer.registrations_count}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (customer) => new Date(customer.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (customer) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(customer);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSendEmail(customer);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleViewDetails = (customer: Customer) => {
    console.log('View details:', customer);
  };

  const handleSendEmail = (customer: Customer) => {
    console.log('Send email to:', customer);
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              View and manage parent accounts and their children
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Children</p>
            <p className="text-3xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.children_count, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Registrations</p>
            <p className="text-3xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.registrations_count, 0)}
            </p>
          </div>
        </div>

        <DataTable
          data={customers}
          columns={columns}
          searchable
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found."
        />
      </div>
    </DashboardLayout>
  );
}
