import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, LogOut, User, Settings, Shield, CheckCircle, Sparkles, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-2 mr-4 lg:mr-0">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="FutureEdge"
                  className="h-8 lg:h-12 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="bg-black p-1.5 lg:p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className="text-lg lg:text-xl font-bold text-gray-900">FutureEdge</span>
                </>
              )}
            </Link>

            <div className="hidden lg:ml-12 lg:flex lg:space-x-4 xl:space-x-8">
              <Link
                to="/camps"
                className="text-gray-700 hover:text-gray-900 px-1 text-sm xl:text-base font-medium transition-colors whitespace-nowrap"
              >
                Browse Camps
              </Link>
              <Link
                to="/how-it-works"
                className="text-gray-700 hover:text-gray-900 px-1 text-sm xl:text-base font-medium transition-colors whitespace-nowrap"
              >
                How it Works
              </Link>
              <Link
                to="/safety"
                className="text-gray-700 hover:text-gray-900 px-1 text-sm xl:text-base font-medium transition-colors whitespace-nowrap"
              >
                Safety & Trust
              </Link>
              <Link
                to="/support"
                className="text-gray-700 hover:text-gray-900 px-1 text-sm xl:text-base font-medium transition-colors whitespace-nowrap"
              >
                Support
              </Link>
              {user && profile?.role === 'parent' && (
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Dashboard
                </Link>
              )}
              {user && ['school_admin', 'marketing', 'operations', 'risk', 'super_admin'].includes(profile?.role || '') && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin/dashboard')
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/approvals"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      isActive('/admin/approvals')
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approvals
                  </Link>
                  {['school_admin', 'super_admin'].includes(profile?.role || '') && (
                    <Link
                      to="/admin/roles"
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                        isActive('/admin/roles')
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Roles
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <button className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Globe className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden md:inline">English</span>
            </button>

            {!user ? (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:block text-gray-900 hover:text-gray-700 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="hidden sm:block bg-orange-400 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-full text-sm lg:text-base font-medium hover:bg-orange-500 transition-colors"
                >
                  Partners
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-7 lg:w-8 h-7 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600" />
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden ml-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            <Link
              to="/camps"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              Browse Camps
            </Link>
            <Link
              to="/how-it-works"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              How it Works
            </Link>
            <Link
              to="/safety"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              Safety & Trust
            </Link>
            <Link
              to="/support"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              Support
            </Link>

            {user && profile?.role === 'parent' && (
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`block px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                My Dashboard
              </Link>
            )}

            {user && ['school_admin', 'marketing', 'operations', 'risk', 'super_admin'].includes(profile?.role || '') && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                    location.pathname.startsWith('/admin/dashboard')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/approvals"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                    isActive('/admin/approvals')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approvals
                </Link>
                {['school_admin', 'super_admin'].includes(profile?.role || '') && (
                  <Link
                    to="/admin/roles"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActive('/admin/roles')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Roles
                  </Link>
                )}
              </>
            )}

            <div className="pt-4 border-t border-gray-200 mt-4">
              {!user ? (
                <>
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 mt-2 text-base font-medium text-white bg-orange-400 hover:bg-orange-500 rounded-lg transition-colors text-center"
                  >
                    Partners
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
