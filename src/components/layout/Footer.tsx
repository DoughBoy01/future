import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-airbnb-grey-900 text-white mt-auto">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FutureEdge</h3>
            <p className="text-airbnb-grey-300 text-sm leading-relaxed">
              {t('footer.tagline', 'Empowering the next generation through transformative camp experiences.')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quick_links', 'Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/camps"
                  className="text-airbnb-grey-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.browse_camps')}
                </Link>
              </li>
              <li>
                <Link
                  to="/partners"
                  className="text-airbnb-grey-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.partners')}
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-airbnb-grey-300 hover:text-white transition-colors text-sm"
                >
                  {t('nav.sign_in')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.support', 'Support')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@futureedge.com"
                  className="text-airbnb-grey-300 hover:text-white transition-colors text-sm"
                >
                  {t('footer.contact', 'Contact Us')}
                </a>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-airbnb-grey-300 hover:text-white transition-colors text-sm"
                >
                  {t('footer.privacy', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-airbnb-grey-300 hover:text-white transition-colors text-sm"
                >
                  {t('footer.terms', 'Terms of Service')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-airbnb-grey-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-airbnb-grey-400 text-sm">
              © {currentYear} FutureEdge. {t('footer.rights', 'All rights reserved.')}
            </p>
            <p className="text-airbnb-grey-400 text-sm flex items-center gap-1">
              {t('footer.made_with', 'Made with')} <Heart className="w-4 h-4 text-airbnb-pink-500 fill-current" /> {t('footer.for_future', 'for the future generation')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
