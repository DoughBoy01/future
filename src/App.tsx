import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CampsPage } from './pages/CampsPage';
import { CampDetailPage } from './pages/CampDetailPage';
import { CampRegistrationPage } from './pages/CampRegistrationPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { RegistrationChildDetailsPage } from './pages/RegistrationChildDetailsPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { RoleManagement } from './pages/admin/RoleManagement';
import { ApprovalDashboard } from './pages/admin/ApprovalDashboard';
import { DashboardOverview } from './pages/admin/DashboardOverview';
import { CampsManagement } from './pages/admin/CampsManagement';
import { EnquiriesManagement } from './pages/admin/EnquiriesManagement';
import { CustomersManagement } from './pages/admin/CustomersManagement';
import { RegistrationsManagement } from './pages/admin/RegistrationsManagement';
import { CommunicationsCenter } from './pages/admin/CommunicationsCenter';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { DataManagement } from './pages/admin/DataManagement';
import { OrganisationsManagement } from './pages/admin/OrganisationsManagement';
import { CommissionsManagement } from './pages/admin/CommissionsManagement';
import { SiteSettings } from './pages/admin/SiteSettings';
import { SystemDiagnostics } from './pages/admin/SystemDiagnostics';
import { PartnersPage } from './pages/PartnersPage';
import { FilterDemoPage } from './pages/FilterDemoPage';
import { RoleBasedRoute } from './components/rbac/RoleBasedRoute';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/camps" element={<CampsPage />} />
          <Route path="/camps/:id" element={<CampDetailPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/filter-demo" element={<FilterDemoPage />} />
          <Route path="/camps/:id/register" element={<CampRegistrationPage />} />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registration/:registrationId/child-details"
          element={
            <ProtectedRoute>
              <RegistrationChildDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin']}>
                <RoleManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'marketing', 'operations', 'risk']}>
                <ApprovalDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'marketing', 'operations', 'risk']}>
                <DashboardOverview />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/camps"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'marketing', 'operations']}>
                <CampsManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/enquiries"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'marketing', 'operations']}>
                <EnquiriesManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/customers"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                <CustomersManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/registrations"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                <RegistrationsManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/communications"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'marketing']}>
                <CommunicationsCenter />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/analytics"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'marketing', 'operations']}>
                <AnalyticsDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/data-management"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                <DataManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/schools"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin']}>
                <OrganisationsManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/commissions"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                <CommissionsManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin']}>
                <SiteSettings />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/diagnostics"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['super_admin']}>
                <SystemDiagnostics />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
