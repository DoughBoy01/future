import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserView } from '../../contexts/UserViewContext';
import { LogOut, User, Settings, Shield, CheckCircle, Sparkles, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { UserViewToggle } from './UserViewToggle';
import { getDashboardRoute } from '../../utils/navigation';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { currentView, canSwitchView } = useUserView();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  // Determine which navigation to show based on current view
  const showParentNav = !user || (user && (currentView === 'parent' || profile?.role === 'parent'));
  const showAdminNav = user && currentView === 'camp_organiser' && ['school_admin', 'marketing', 'operations', 'risk', 'super_admin'].includes(profile?.role || '');

  useEffect(() => {
    loadSiteLogo();
  }, []);

  async function loadSiteLogo() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_logo')
        .maybeSingle();

      if (error) throw error;
      if (data?.value && typeof data.value === 'object') {
        const logoData = data.value as { url?: string | null };
        setSiteLogo(logoData.url || null);
      }
    } catch (error) {
      console.error('Error loading site logo:', error);
    }
  }

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Get the correct dashboard route based on user role
  const dashboardRoute = getDashboardRoute(profile?.role);

  return (
    <>
      {/* Skip to Content Link for Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <nav className="sticky top-0 z-50" style={{ background: '#1e2d3a' }} role="navigation" aria-label="Main navigation">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-2 mr-4 lg:mr-0">
              <img
                src={siteLogo || "/logo.gif"}
                alt="FutureEdge"
                className="h-16 lg:h-20 w-auto object-contain p-3"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = "/logo.gif";
                }}
              />
            </Link>

            <div className="hidden lg:ml-12 lg:flex lg:space-x-4 xl:space-x-8">
              {/* Parent Navigation */}
              {showParentNav && (
                <>
                  <Link
                    to="/camps"
                    className="text-white/90 hover:text-white px-1 text-sm xl:text-base font-medium transition-standard whitespace-nowrap"
                  >
                    {t('nav.browse_camps')}
                  </Link>
                  <Link
                    to="/for-parents"
                    className="text-white/90 hover:text-white px-1 text-sm xl:text-base font-medium transition-standard whitespace-nowrap"
                  >
                    For Parents
                  </Link>
                  <Link
                    to="/for-schools"
                    className="text-white/90 hover:text-white px-1 text-sm xl:text-base font-medium transition-standard whitespace-nowrap"
                  >
                    For Schools
                  </Link>
                  <Link
                    to="/talk-to-advisor"
                    className="text-white/90 hover:text-white px-1 text-sm xl:text-base font-medium transition-standard whitespace-nowrap"
                  >
                    Talk to AI Advisor
                  </Link>
                  {user && (
                    <Link
                      to={dashboardRoute}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                        isActive(dashboardRoute)
                          ? 'text-airbnb-pink-400 border-b-2 border-airbnb-pink-400'
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      {t('nav.dashboard')}
                    </Link>
                  )}
                </>
              )}

              {/* Camp Organiser Navigation */}
              {showAdminNav && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                      location.pathname.startsWith('/admin/dashboard')
                        ? 'text-airbnb-pink-400 border-b-2 border-airbnb-pink-400'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1" aria-hidden="true" />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/approvals"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                      isActive('/admin/approvals')
                        ? 'text-airbnb-pink-400 border-b-2 border-airbnb-pink-400'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    Approvals
                  </Link>
                  {['school_admin', 'super_admin'].includes(profile?.role || '') && (
                    <Link
                      to="/admin/roles"
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                        isActive('/admin/roles')
                          ? 'text-airbnb-pink-400 border-b-2 border-airbnb-pink-400'
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1" aria-hidden="true" />
                      Roles
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* User View Toggle */}
            {user && canSwitchView && <UserViewToggle />}

            {!user ? (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:block text-white hover:text-white/80 px-3 lg:px-4 py-2 rounded-md text-sm lg:text-base font-medium transition-standard"
                >
                  {t('nav.sign_in')}
                </Link>
                <Link
                  to="/partners"
                  className="hidden sm:block bg-white/10 text-white px-6 py-3 rounded-md text-sm lg:text-base font-medium hover:bg-white/20 transition-standard border border-white/30 backdrop-blur-sm"
                >
                  {t('nav.partners')}
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-white hover:text-airbnb-pink-300 transition-standard"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 lg:w-8 h-7 lg:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <User className="w-4 lg:w-5 h-4 lg:h-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium hidden md:block">
                    {profile?.first_name || 'User'}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-airbnb-grey-300">
                      <div className="px-4 py-2 border-b border-airbnb-grey-300">
                        <p className="text-sm font-medium text-airbnb-grey-900">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs text-airbnb-grey-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-airbnb-grey-700 hover:bg-airbnb-grey-50 transition-fast"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t('nav.settings')}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-airbnb-pink-600 hover:bg-airbnb-pink-50 transition-fast"
                      >
                        <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t('nav.sign_out')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden ml-2 p-2 rounded-md text-white hover:bg-white/10 transition-fast"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-4 space-y-2">
            {/* Parent Navigation */}
            {showParentNav && (
              <>
                <Link
                  to="/camps"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-base font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-fast"
                >
                  {t('nav.browse_camps')}
                </Link>

                <Link
                  to="/for-parents"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-base font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-fast"
                >
                  For Parents
                </Link>

                <Link
                  to="/for-schools"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-base font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-fast"
                >
                  For Schools
                </Link>

                <Link
                  to="/talk-to-advisor"
                  onClick={closeMobileMenu}
                  className="block px-4 py-2 text-base font-medium text-white/90 hover:bg-white/10 hover:text-white rounded-md transition-fast"
                >
                  Talk to AI Advisor
                </Link>

                {user && (
                  <Link
                    to={dashboardRoute}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-2 text-base font-medium rounded-md transition-fast ${
                      isActive(dashboardRoute)
                        ? 'bg-airbnb-pink-600/20 text-airbnb-pink-300'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('nav.dashboard')}
                  </Link>
                )}
              </>
            )}

            {/* Camp Organiser Navigation */}
            {showAdminNav && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-md transition-fast ${
                    location.pathname.startsWith('/admin/dashboard')
                      ? 'bg-airbnb-pink-600/20 text-airbnb-pink-300'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/approvals"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-md transition-fast ${
                    isActive('/admin/approvals')
                      ? 'bg-airbnb-pink-600/20 text-airbnb-pink-300'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approvals
                </Link>
                {['school_admin', 'super_admin'].includes(profile?.role || '') && (
                  <Link
                    to="/admin/roles"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-2 text-base font-medium rounded-md transition-fast ${
                      isActive('/admin/roles')
                        ? 'bg-airbnb-pink-600/20 text-airbnb-pink-300'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Roles
                  </Link>
                )}
              </>
            )}

            <div className="pt-4 border-t border-white/20 mt-4">
              {!user ? (
                <>
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-base font-medium text-white hover:bg-white/10 rounded-md transition-fast"
                  >
                    {t('nav.sign_in')}
                  </Link>
                  <Link
                    to="/partners"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 mt-2 text-base font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-fast text-center border border-white/30"
                  >
                    {t('nav.partners')}
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-airbnb-pink-300 hover:bg-airbnb-pink-600/20 rounded-md transition-fast"
                >
                  <LogOut className="w-5 h-5 mr-2" aria-hidden="true" />
                  {t('nav.sign_out')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
