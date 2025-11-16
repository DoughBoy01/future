import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import { CampCard } from '../components/home/CampCard';
import SocialMeta from '../components/seo/SocialMeta';
import {
  getProgrammaticPage,
  getCampsForProgrammaticPage,
  ProgrammaticPage,
} from '../services/programmaticPageService';

export default function ProgrammaticLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ProgrammaticPage | null>(null);
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPage(slug);
    }
  }, [slug]);

  async function loadPage(slug: string) {
    setLoading(true);
    setError(false);
    try {
      const pageData = await getProgrammaticPage(slug);
      if (!pageData) {
        setError(true);
        return;
      }

      setPage(pageData);

      // Load camps for this page
      const campsData = await getCampsForProgrammaticPage(pageData);
      setCamps(campsData);
    } catch (err) {
      console.error('Error loading programmatic page:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading camps...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/camps"
          className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Browse All Camps
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const seoTitle = page.title;
  const seoDescription = page.meta_description || '';

  // Structured data for local business/service
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.h1_title || page.title,
    description: seoDescription,
    numberOfItems: camps.length,
    itemListElement: camps.slice(0, 10).map((camp, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: camp.name,
        description: camp.short_description,
        image: camp.featured_image_url,
        offers: {
          '@type': 'Offer',
          price: camp.price,
          priceCurrency: camp.currency || 'USD',
        },
      },
    })),
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Camps',
        item: `${window.location.origin}/camps`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.h1_title || page.title,
        item: window.location.href,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <SocialMeta
        title={seoTitle}
        description={seoDescription}
        type="website"
        url={window.location.href}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {page.h1_title || page.title.replace(' | FutureEdge', '')}
          </h1>

          {/* Key Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-600" />
              <span className="font-medium">{camps.length} Camps Available</span>
            </div>
            {page.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-600" />
                <span className="font-medium">Location: {page.location}</span>
              </div>
            )}
            {page.category && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                <span className="font-medium capitalize">Category: {page.category}</span>
              </div>
            )}
            {(page.age_min || page.age_max) && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                <span className="font-medium">
                  Ages{' '}
                  {page.age_min && page.age_max
                    ? `${page.age_min}-${page.age_max}`
                    : page.age_min
                    ? `${page.age_min}+`
                    : `up to ${page.age_max}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Intro Content */}
        {page.intro_content && (
          <div
            className="max-w-4xl mx-auto mb-12 prose prose-lg"
            dangerouslySetInnerHTML={{ __html: page.intro_content }}
          />
        )}

        {/* Trust Indicators */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Parents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
              <div className="text-gray-600">Verified Camps</div>
            </div>
          </div>
        </div>

        {/* Camps Grid */}
        {camps.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No camps found
            </h3>
            <p className="text-gray-600 mb-8">
              We're constantly adding new camps. Check back soon or browse all camps.
            </p>
            <Link
              to="/camps"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Browse All Camps
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Camps ({camps.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {camps.map((camp) => (
                <CampCard key={camp.id} camp={camp} />
              ))}
            </div>
          </>
        )}

        {/* SEO Content Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose {page.location ? `${page.location} ` : ''}
              {page.category ? `${page.category} ` : ''}Summer Camps?
            </h2>

            <div className="prose prose-lg">
              <p>
                Finding the right summer camp for your child is one of the most important
                decisions you'll make. {page.location && `In ${page.location}, you have access to `}
                {page.category && `${page.category} camps that `}
                provide enriching experiences that help children grow, learn, and make
                lasting friendships.
              </p>

              <h3>What Makes Our Camps Special</h3>
              <ul>
                <li>
                  <strong>Verified & Safe:</strong> All camps are thoroughly vetted with
                  background checks, insurance verification, and safety protocols.
                </li>
                <li>
                  <strong>Experienced Staff:</strong> Professional instructors with years
                  of experience working with children.
                </li>
                <li>
                  <strong>Flexible Options:</strong> Day camps, overnight camps, and
                  specialty programs to fit your schedule.
                </li>
                <li>
                  <strong>Parent Reviews:</strong> Real feedback from families who've
                  attended these camps.
                </li>
                <li>
                  <strong>Easy Booking:</strong> Secure online registration with instant
                  confirmation.
                </li>
              </ul>

              <h3>How to Choose the Right Camp</h3>
              <p>
                Consider your child's interests, age, and personality when selecting a
                camp. Look for programs that align with their passions whether that's
                sports, arts, STEM, or outdoor adventures. Read parent reviews, check
                safety certifications, and don't hesitate to contact camp directors with
                questions.
              </p>

              <h3>Ready to Get Started?</h3>
              <p>
                Browse our curated selection of {page.category && `${page.category} `}
                summer camps{page.location && ` in ${page.location}`} above. Each listing
                includes detailed information, photos, pricing, and parent reviews to help
                you make the best choice for your family.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                to="/blog"
                className="px-6 py-3 bg-white text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium"
              >
                Read Our Camp Guides
              </Link>
              <Link
                to="/talk-to-advisor"
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                Talk to Our AI Advisor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
