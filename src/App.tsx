import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { BookingsManagement } from './pages/admin/BookingsManagement';
import { CommunicationsCenter } from './pages/admin/CommunicationsCenter';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { DataManagement } from './pages/admin/DataManagement';
import { OrganisationsManagement } from './pages/admin/OrganisationsManagement';
import { CommissionsManagement } from './pages/admin/CommissionsManagement';
import { CommissionRatesManagement } from './pages/admin/CommissionRatesManagement';
import { PayoutsManagement } from './pages/admin/PayoutsManagement';
import { PaymentAnalytics } from './pages/admin/PaymentAnalytics';
import { CampOrganizerManagement } from './pages/admin/CampOrganizerManagement';
import { SiteSettings } from './pages/admin/SiteSettings';
import { SystemDiagnostics } from './pages/admin/SystemDiagnostics';
import UserRoleManagement from './pages/admin/UserRoleManagement';
import { PartnersPage } from './pages/PartnersPage';
import { FilterDemoPage } from './pages/FilterDemoPage';
import { TalkToAdvisorPage } from './pages/TalkToAdvisorPage';
import { ForParentsPage } from './pages/ForParentsPage';
import ForSchoolsPage from './pages/ForSchoolsPage';
import { QuizLandingPage } from './pages/QuizLandingPage';
import { ConversationalCampFinderPage } from './pages/ConversationalCampFinderPage';
import { RoleBasedRoute } from './components/rbac/RoleBasedRoute';
import { DevContentEditor } from './components/dev/DevContentEditor';

// Camp Owner Pages
import CampOwnerLanding from './pages/CampOwnerLanding';

// Onboarding Pages
import Welcome from './pages/onboarding/Welcome';
import OrganizationSetup from './pages/onboarding/OrganizationSetup';
import FirstCampWizard from './pages/onboarding/FirstCampWizard';

// Organizer Dashboard Pages
import OrganizerDashboardOverview from './pages/organizer/OrganizerDashboardOverview';
import OrganizationProfile from './pages/organizer/OrganizationProfile';
import StripePaymentSettings from './pages/organizer/StripePaymentSettings';
import PersonalProfile from './pages/organizer/PersonalProfile';

// Admin - Onboarding Pages
import PromotionalOffersManagement from './pages/admin/PromotionalOffersManagement';
import OnboardingAnalytics from './pages/admin/OnboardingAnalytics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { loading, user: !!user });

  if (loading) {
    console.log('⏳ Auth loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user, redirecting to /auth');
    return <Navigate to="/auth" />;
  }

  console.log('✅ User authenticated, rendering protected content');
  return <>{children}</>;
}

function App() {
  const location = useLocation();

  // Check if current route is a dashboard route (admin, organizer, or onboarding)
  const isDashboardRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/organizer-dashboard') ||
    location.pathname.startsWith('/organizer/') ||
    location.pathname.startsWith('/onboarding');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isDashboardRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/camps" element={<CampsPage />} />
          <Route path="/camps/:id" element={<CampDetailPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/for-parents" element={<ForParentsPage />} />
          <Route path="/for-camp-owners" element={<CampOwnerLanding />} />
          <Route path="/find-your-camp" element={<QuizLandingPage />} />
          <Route path="/quiz" element={<Navigate to="/find-your-camp" replace />} />
          <Route path="/filter-demo" element={<FilterDemoPage />} />
          <Route path="/talk-to-advisor" element={<TalkToAdvisorPage />} />
          <Route path="/for-schools" element={<ForSchoolsPage />} />
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

          {/* ============================================ */}
          {/* CAMP ORGANIZER ONBOARDING ROUTES */}
          {/* ============================================ */}
          {/* TEMPORARY TEST - Bypass auth to test route */}
          <Route
            path="/onboarding/welcome-test"
            element={<Welcome />}
          />
          <Route
            path="/onboarding/welcome"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <Welcome />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/organization"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <OrganizationSetup />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/first-camp"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <FirstCampWizard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* CAMP ORGANIZER DASHBOARD ROUTES */}
          {/* Separate dashboard for camp organisers */}
          {/* ============================================ */}
          <Route
            path="/organizer-dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <OrganizerDashboardOverview />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/profile"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <PersonalProfile />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/organization/profile"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <OrganizationProfile />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/settings/payments"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['camp_organizer']}>
                  <StripePaymentSettings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Additional organizer routes (to be implemented) */}
          {/* <Route path="/organizer-dashboard/bookings" element={...} /> */}
          {/* <Route path="/organizer-dashboard/registrations" element={...} /> */}
          {/* <Route path="/organizer-dashboard/enquiries" element={...} /> */}
          {/* <Route path="/organizer-dashboard/commissions" element={...} /> */}

          {/* ============================================ */}
          {/* ADMIN DASHBOARD ROUTES */}
          {/* Platform admin only - camp_organizer removed */}
          {/* ============================================ */}
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
            path="/admin/camp-organizers"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <CampOrganizerManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-roles"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <UserRoleManagement />
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
            path="/admin/dashboard/bookings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                  <BookingsManagement />
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
            path="/admin/dashboard/organisations"
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
            path="/admin/dashboard/commission-rates"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <CommissionRatesManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/payouts"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                  <PayoutsManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/payment-analytics"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin', 'school_admin', 'operations']}>
                  <PaymentAnalytics />
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
          <Route
            path="/admin/promotional-offers"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <PromotionalOffersManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/onboarding-analytics"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <OnboardingAnalytics />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}

      {/* Dev-only inline content editor */}
      {import.meta.env.DEV && <DevContentEditor />}
    </div>
  );
}

export default App;
