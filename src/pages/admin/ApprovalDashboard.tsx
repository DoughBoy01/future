import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { approvalWorkflowService, type ApprovalRequest } from '../../services/approvalWorkflowService';
import { useAuth } from '../../contexts/AuthContext';

export function ApprovalDashboard() {
  const { user, profile } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [submittedRequests, setSubmittedRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');

  useEffect(() => {
    if (user && profile) {
      loadData();
    }
  }, [user, profile]);

  async function loadData() {
    if (!user || !profile) return;

    try {
      const [pending, submitted] = await Promise.all([
        approvalWorkflowService.getUserPendingApprovals(user.id, profile.role),
        approvalWorkflowService.getUserSubmittedRequests(user.id),
      ]);

      setPendingApprovals(pending);
      setSubmittedRequests(submitted);
    } catch (error) {
      console.error('Error loading approval data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    if (!user) return;

    const result = await approvalWorkflowService.approveRequest(requestId, user.id);

    if (result.success) {
      await loadData();
    }
  }

  async function handleReject(requestId: string, reason: string) {
    if (!user) return;

    const result = await approvalWorkflowService.rejectRequest(requestId, user.id, reason);

    if (result.success) {
      await loadData();
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Approval Workflows</h1>
          </div>
          <p className="text-gray-600">
            Review and manage approval requests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {pendingApprovals.length}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {submittedRequests.length}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {pendingApprovals.filter((r) => r.priority === 'urgent').length}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending Approvals ({pendingApprovals.length})
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'submitted'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Your Requests ({submittedRequests.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending approvals</p>
                  </div>
                ) : (
                  pendingApprovals.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 capitalize">
                              {request.resource_type.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Submitted {new Date(request.submitted_at).toLocaleDateString()}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id, 'Rejected by reviewer')}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'submitted' && (
              <div className="space-y-4">
                {submittedRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No submitted requests</p>
                  </div>
                ) : (
                  submittedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 capitalize">
                              {request.resource_type.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Submitted {new Date(request.submitted_at).toLocaleDateString()}
                            {request.completed_at && (
                              <> • Completed {new Date(request.completed_at).toLocaleDateString()}</>
                            )}
                          </p>
                          {request.rejection_reason && (
                            <p className="text-sm text-red-600 mt-2">
                              Reason: {request.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
