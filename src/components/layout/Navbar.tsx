import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, LogOut, User, Settings, Shield, CheckCircle, Sparkles, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
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

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('userLanguage', languageCode);
    setLanguageMenuOpen(false);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <>
      {/* Skip to Content Link for Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <nav className="bg-white shadow-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-2 mr-4 lg:mr-0">
              <img
                src={siteLogo || "/logo.png"}
                alt="FutureEdge"
                className="h-6 lg:h-8 w-auto object-contain"
              />
            </Link>

            <div className="hidden lg:ml-12 lg:flex lg:space-x-4 xl:space-x-8">
              <Link
                to="/camps"
                className="text-airbnb-grey-700 hover:text-airbnb-grey-900 px-1 text-sm xl:text-base font-medium transition-standard whitespace-nowrap"
              >
                {t('nav.browse_camps')}
              </Link>
              {user && profile?.role === 'parent' && (
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                    isActive('/dashboard')
                      ? 'text-airbnb-pink-500 border-b-2 border-airbnb-pink-500'
                      : 'text-airbnb-grey-700 hover:text-airbnb-grey-900'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
              )}
              {user && ['school_admin', 'marketing', 'operations', 'risk', 'super_admin'].includes(profile?.role || '') && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                      location.pathname.startsWith('/admin/dashboard')
                        ? 'text-airbnb-pink-500 border-b-2 border-airbnb-pink-500'
                        : 'text-airbnb-grey-700 hover:text-airbnb-grey-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1" aria-hidden="true" />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/approvals"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-standard ${
                      isActive('/admin/approvals')
                        ? 'text-airbnb-pink-500 border-b-2 border-airbnb-pink-500'
                        : 'text-airbnb-grey-700 hover:text-airbnb-grey-900'
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
                          ? 'text-airbnb-pink-500 border-b-2 border-airbnb-pink-500'
                          : 'text-airbnb-grey-700 hover:text-airbnb-grey-900'
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
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-2 text-airbnb-grey-700 hover:text-airbnb-grey-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-standard"
                aria-label="Change language"
                aria-expanded={languageMenuOpen}
                aria-haspopup="true"
              >
                <Globe className="w-4 lg:w-5 h-4 lg:h-5" aria-hidden="true" />
                <span className="hidden md:inline">{currentLanguage.nativeName}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {languageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLanguageMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20 border border-airbnb-grey-300">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-fast flex items-center justify-between ${
                          i18n.language === language.code
                            ? 'bg-airbnb-pink-50 text-airbnb-pink-600 font-medium'
                            : 'text-airbnb-grey-700 hover:bg-airbnb-grey-50'
                        }`}
                      >
                        <span>{language.nativeName}</span>
                        {i18n.language === language.code && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!user ? (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:block text-airbnb-grey-900 hover:text-airbnb-grey-700 px-3 lg:px-4 py-2 rounded-md text-sm lg:text-base font-medium transition-standard"
                >
                  {t('nav.sign_in')}
                </Link>
                <Link
                  to="/partners"
                  className="hidden sm:block bg-airbnb-grey-100 text-airbnb-grey-700 px-6 py-3 rounded-md text-sm lg:text-base font-medium hover:bg-airbnb-grey-200 hover:text-airbnb-grey-900 transition-standard border border-airbnb-grey-300"
                >
                  {t('nav.partners')}
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-airbnb-grey-700 hover:text-airbnb-pink-500 transition-standard"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 lg:w-8 h-7 lg:h-8 bg-airbnb-pink-50 rounded-full flex items-center justify-center">
                    <User className="w-4 lg:w-5 h-4 lg:h-5 text-airbnb-pink-500" aria-hidden="true" />
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
              className="lg:hidden ml-2 p-2 rounded-md text-airbnb-grey-700 hover:bg-airbnb-grey-50 transition-fast"
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
          <div className="lg:hidden border-t border-airbnb-grey-300 py-4 space-y-2">
            <Link
              to="/camps"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium text-airbnb-grey-700 hover:bg-airbnb-grey-50 hover:text-airbnb-grey-900 rounded-md transition-fast"
            >
              {t('nav.browse_camps')}
            </Link>

            {user && profile?.role === 'parent' && (
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`block px-4 py-2 text-base font-medium rounded-md transition-fast ${
                  isActive('/dashboard')
                    ? 'bg-airbnb-pink-50 text-airbnb-pink-500'
                    : 'text-airbnb-grey-700 hover:bg-airbnb-grey-50 hover:text-airbnb-grey-900'
                }`}
              >
                {t('nav.dashboard')}
              </Link>
            )}

            {user && ['school_admin', 'marketing', 'operations', 'risk', 'super_admin'].includes(profile?.role || '') && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 text-base font-medium rounded-md transition-fast ${
                    location.pathname.startsWith('/admin/dashboard')
                      ? 'bg-airbnb-pink-50 text-airbnb-pink-500'
                      : 'text-airbnb-grey-700 hover:bg-airbnb-grey-50 hover:text-airbnb-grey-900'
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
                      ? 'bg-airbnb-pink-50 text-airbnb-pink-500'
                      : 'text-airbnb-grey-700 hover:bg-airbnb-grey-50 hover:text-airbnb-grey-900'
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
                        ? 'bg-airbnb-pink-50 text-airbnb-pink-500'
                        : 'text-airbnb-grey-700 hover:bg-airbnb-grey-50 hover:text-airbnb-grey-900'
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Roles
                  </Link>
                )}
              </>
            )}

            <div className="pt-4 border-t border-airbnb-grey-300 mt-4">
              {/* Mobile Language Selector */}
              <div className="px-4 mb-4">
                <label className="block text-xs font-medium text-airbnb-grey-600 mb-2">
                  {t('common.language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`px-3 py-2 text-sm rounded-md transition-fast ${
                        i18n.language === language.code
                          ? 'bg-airbnb-pink-500 text-white'
                          : 'bg-airbnb-grey-100 text-airbnb-grey-700 hover:bg-airbnb-grey-200'
                      }`}
                    >
                      {language.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {!user ? (
                <>
                  <Link
                    to="/auth"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-base font-medium text-airbnb-grey-900 hover:bg-airbnb-grey-50 rounded-md transition-fast"
                  >
                    {t('nav.sign_in')}
                  </Link>
                  <Link
                    to="/partners"
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 mt-2 text-base font-medium text-airbnb-grey-700 bg-airbnb-grey-100 hover:bg-airbnb-grey-200 hover:text-airbnb-grey-900 rounded-md transition-fast text-center border border-airbnb-grey-300"
                  >
                    {t('nav.partners')}
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-airbnb-pink-600 hover:bg-airbnb-pink-50 rounded-md transition-fast"
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
