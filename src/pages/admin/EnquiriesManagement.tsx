import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DataTable, Column } from '../../components/dashboard/DataTable';
import { Filter, MessageSquare, CheckCircle, Clock, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Enquiry {
  id: string;
  camp_id: string;
  camp_name: string;
  organisation_name: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
}

export function EnquiriesManagement() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          camps(name, organisations(name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEnquiries: Enquiry[] = (data || []).map((enq: any) => ({
        id: enq.id,
        camp_id: enq.camp_id,
        camp_name: enq.camps.name,
        organisation_name: enq.camps.organisations?.name || 'Unknown',
        parent_name: enq.parent_name,
        parent_email: enq.parent_email,
        parent_phone: enq.parent_phone,
        subject: enq.subject,
        message: enq.message,
        status: enq.status,
        response: enq.response,
        responded_by: enq.responded_by,
        responded_at: enq.responded_at,
        created_at: enq.created_at,
      }));

      setEnquiries(formattedEnquiries);
    } catch (error) {
      console.error('Error loading enquiries:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRespond = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setResponseText(enquiry.response || '');
  };

  const handleUpdateStatus = async (enquiryId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: newStatus })
        .eq('id', enquiryId);

      if (error) throw error;

      setEnquiries(prev =>
        prev.map(enq => enq.id === enquiryId ? { ...enq, status: newStatus } : enq)
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedEnquiry || !responseText.trim()) return;

    setResponding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('enquiries')
        .update({
          response: responseText,
          responded_by: user?.id,
          responded_at: new Date().toISOString(),
          status: 'resolved',
        })
        .eq('id', selectedEnquiry.id);

      if (error) throw error;

      setEnquiries(prev =>
        prev.map(enq =>
          enq.id === selectedEnquiry.id
            ? {
                ...enq,
                response: responseText,
                responded_by: user?.id || null,
                responded_at: new Date().toISOString(),
                status: 'resolved' as const,
              }
            : enq
        )
      );

      setSelectedEnquiry(null);
      setResponseText('');
      alert('Response saved successfully! Remember to email the parent separately.');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    if (filterStatus !== 'all' && enq.status !== filterStatus) return false;
    return true;
  });

  const columns: Column<Enquiry>[] = [
    {
      key: 'camp_name',
      label: 'Camp',
      sortable: true,
      render: (enq) => (
        <p className="font-medium text-gray-900">{enq.camp_name}</p>
      ),
    },
    {
      key: 'organisation_name',
      label: 'Seller',
      sortable: true,
      render: (enq) => (
        <p className="font-medium text-gray-900">{enq.organisation_name}</p>
      ),
    },
    {
      key: 'parent_name',
      label: 'Parent',
      sortable: true,
      render: (enq) => (
        <div>
          <p className="text-gray-900">{enq.parent_name}</p>
          <p className="text-xs text-gray-500">{enq.parent_email}</p>
          {enq.parent_phone && (
            <p className="text-xs text-gray-500">{enq.parent_phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (enq) => (
        <div>
          <p className="font-medium text-gray-900">{enq.subject}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{enq.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (enq) => {
        const statusConfig = {
          new: { color: 'bg-blue-100 text-blue-700', icon: MessageSquare, label: 'New' },
          in_progress: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'In Progress' },
          resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
        };
        const config = statusConfig[enq.status];
        const Icon = config.icon;

        return (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Received',
      sortable: true,
      render: (enq) => (
        <div className="text-sm">
          <p className="text-gray-900">{new Date(enq.created_at).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(enq.created_at).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (enq) => (
        <div className="flex gap-2">
          {enq.status !== 'resolved' && (
            <>
              {enq.status === 'new' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(enq.id, 'in_progress');
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Mark In Progress
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRespond(enq);
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Respond
              </button>
            </>
          )}
          {enq.status === 'resolved' && enq.response && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRespond(enq);
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Response
            </button>
          )}
        </div>
      ),
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
            <h2 className="text-2xl font-bold text-gray-900">Camp Enquiries</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage parent enquiries about camps
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Enquiries</p>
            <p className="text-3xl font-bold text-gray-900">{enquiries.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">New</p>
            <p className="text-3xl font-bold text-blue-600">
              {enquiries.filter((e) => e.status === 'new').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-600">
              {enquiries.filter((e) => e.status === 'resolved').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <DataTable
          data={filteredEnquiries}
          columns={columns}
          searchable
          searchPlaceholder="Search enquiries..."
          emptyMessage="No enquiries found."
        />
      </div>

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedEnquiry(null)}
            />

            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Enquiry Details</h3>
              </div>

              <div className="px-6 py-6 space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Camp</p>
                  <p className="text-gray-900 font-semibold">{selectedEnquiry.camp_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Parent Name</p>
                    <p className="text-gray-900">{selectedEnquiry.parent_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900">{selectedEnquiry.parent_email}</p>
                  </div>
                </div>

                {selectedEnquiry.parent_phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900">{selectedEnquiry.parent_phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
                  <p className="text-gray-900 font-medium">{selectedEnquiry.subject}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                  <p className="text-gray-700 whitespace-pre-line">{selectedEnquiry.message}</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    disabled={selectedEnquiry.status === 'resolved'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="Type your response here..."
                  />
                  {selectedEnquiry.status === 'resolved' && selectedEnquiry.responded_at && (
                    <p className="mt-2 text-xs text-gray-500">
                      Responded on {new Date(selectedEnquiry.responded_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedEnquiry.status !== 'resolved' && (
                  <button
                    onClick={handleSubmitResponse}
                    disabled={responding || !responseText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {responding ? 'Saving...' : 'Save Response'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
