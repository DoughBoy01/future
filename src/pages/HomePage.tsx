import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CampCard } from '../components/home/CampCard';
import { CategoryCard } from '../components/home/CategoryCard';
import { FutureImpact } from '../components/home/FutureImpact';
import { PromotionalPopup } from '../components/marketing/PromotionalPopup';
import { NewsletterSignup } from '../components/marketing/NewsletterSignup';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];
type Category = Database['public']['Tables']['camp_categories']['Row'];

// Hero Background Image - Change this URL to update the hero image across the site
// For best performance, use a local image in /public folder (e.g., '/hero.jpg')
const HERO_IMAGE_URL = '/hero.jpeg';

// Seamless background that matches navbar - solid dark color for perfect blend
// This ensures no visible seam between navbar and hero section
const HERO_BACKGROUND = '#1e2d3a';

export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [featuredCamps, setFeaturedCamps] = useState<Camp[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [cardWidth, setCardWidth] = useState(280);
  const [isNavigating, setIsNavigating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [campsResponse, categoriesResponse] = await Promise.all([
          supabase
            .from('camps')
            .select('*')
            .eq('status', 'published')
            .eq('featured', true)
            .order('start_date', { ascending: true })
            .limit(5),
          supabase
            .from('camp_categories')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true })
        ]);

        if (campsResponse.error) throw campsResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;

        if (isMounted) {
          if (campsResponse.data && campsResponse.data.length > 0) {
            setFeaturedCamps(campsResponse.data);
          } else {
            const { data: allCamps } = await supabase
              .from('camps')
              .select('*')
              .eq('status', 'published')
              .order('start_date', { ascending: true })
              .limit(5);

            if (allCamps && isMounted) setFeaturedCamps(allCamps);
          }

          if (categoriesResponse.data) {
            setCategories(categoriesResponse.data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check if hero image exists
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.onerror = () => setHeroImageLoaded(false);
    img.src = HERO_IMAGE_URL;
  }, []);

  const staticCamps = [
    {
      id: undefined,
      badge: 'Limited' as const,
      image: 'https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Lake Tahoe, California',
      rating: 4.8,
      reviewCount: 12,
      title: 'Adventure Quest Camp',
      category: 'Adventure',
      ageRange: 'Ages 8-14',
      ageMin: 8,
      ageMax: 14,
      price: 850,
      originalPrice: 950,
      spotsRemaining: 3,
    },
    {
      id: undefined,
      badge: 'Popular' as const,
      image: 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'My House',
      rating: 4.7,
      reviewCount: 8,
      title: 'Steve\'s Camping Day',
      category: 'Specialty',
      ageRange: 'Ages 21+',
      ageMin: 21,
      ageMax: 99,
      price: 100,
      originalPrice: 200,
      spotsRemaining: 8,
    },
    {
      id: undefined,
      badge: 'Limited' as const,
      image: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Portland, OR',
      rating: 4.5,
      reviewCount: 6,
      title: 'Creative Arts Studio',
      category: 'Arts',
      ageRange: 'Ages 6-16',
      ageMin: 6,
      ageMax: 16,
      price: 680,
      originalPrice: 800,
      spotsRemaining: 2,
    },
    {
      id: undefined,
      badge: 'New' as const,
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Singapore',
      rating: 0,
      reviewCount: 0,
      title: 'TechnoKids Coding Camp',
      category: 'Arts',
      ageRange: 'Ages 9-17',
      ageMin: 9,
      ageMax: 17,
      price: 1200,
      originalPrice: 1400,
      spotsRemaining: 15,
    },
    {
      id: undefined,
      badge: 'Popular' as const,
      image: 'https://images.pexels.com/photos/920382/pexels-photo-920382.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Denver, CO',
      rating: 4.9,
      reviewCount: 28,
      title: 'Mountain Explorer Camp',
      category: 'Outdoor',
      ageRange: 'Ages 10-15',
      ageMin: 10,
      ageMax: 15,
      price: 920,
      originalPrice: 1100,
      spotsRemaining: 12,
    },
  ];

  const camps = featuredCamps.length > 0
    ? featuredCamps.map(camp => {
        const enrolledCount = (camp as any).enrolled_count || 0;
        const spotsRemaining = camp.capacity - enrolledCount;
        const earlyBirdActive = camp.early_bird_price &&
          camp.early_bird_deadline &&
          new Date(camp.early_bird_deadline) > new Date();

        return {
          id: camp.id,
          badge: spotsRemaining <= 5 ? ('Limited' as const) :
                 camp.featured ? ('Popular' as const) :
                 ('New' as const),
          image: camp.featured_image_url || 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
          location: camp.location,
          rating: 0,
          reviewCount: 0,
          title: camp.name,
          category: camp.category,
          ageRange: `Ages ${camp.age_min}-${camp.age_max}`,
          ageMin: camp.age_min,
          ageMax: camp.age_max,
          price: earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price,
          currency: camp.currency,
          originalPrice: earlyBirdActive && camp.early_bird_price ? camp.price : undefined,
          spotsRemaining,
          startDate: camp.start_date,
          endDate: camp.end_date,
          description: camp.description || undefined,
        };
      })
    : staticCamps;

  const updateCarouselDimensions = useCallback(() => {
    const width = window.innerWidth;
    let cards = 1;
    let cardW = Math.min(280, width - 32);

    if (width >= 1536) {
      cards = 4;
      cardW = 340;
    } else if (width >= 1280) {
      cards = 3;
      cardW = 340;
    } else if (width >= 1024) {
      cards = 3;
      cardW = 340;
    } else if (width >= 768) {
      cards = 2;
      cardW = 320;
    } else if (width >= 640) {
      cards = 1;
      cardW = 320;
    } else if (width >= 375) {
      cards = 1;
      cardW = Math.min(280, width - 32);
    } else {
      cards = 1;
      cardW = Math.min(280, width - 32);
    }

    setCardsPerView(cards);
    setCardWidth(cardW);
  }, []);

  useEffect(() => {
    updateCarouselDimensions();
    window.addEventListener('resize', updateCarouselDimensions);
    return () => window.removeEventListener('resize', updateCarouselDimensions);
  }, [updateCarouselDimensions]);

  const totalSlides = Math.max(1, Math.ceil(camps.length / cardsPerView));

  const handlePrevSlide = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, totalSlides]);

  const handleNextSlide = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    setTimeout(() => setIsNavigating(false), 300);
  }, [isNavigating, totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't interfere with interactive elements
    const target = e.target as HTMLElement;
    const noSwipeElement = target.closest('[data-no-swipe="true"]');
    const button = target.closest('button');
    const link = target.closest('a');

    if (noSwipeElement || button || link) {
      return;
    }
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't interfere with interactive elements
    const target = e.target as HTMLElement;
    const noSwipeElement = target.closest('[data-no-swipe="true"]');
    const button = target.closest('button');
    const link = target.closest('a');

    if (noSwipeElement || button || link) {
      setTouchStart(0);
      setTouchEnd(0);
      return;
    }

    // Only track move if we started a swipe (touchStart is set)
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't interfere with interactive elements
    const target = e.target as HTMLElement;
    const noSwipeElement = target.closest('[data-no-swipe="true"]');
    const button = target.closest('button');
    const link = target.closest('a');

    if (noSwipeElement || button || link) {
      setTouchStart(0);
      setTouchEnd(0);
      return;
    }

    if (!touchStart || !touchEnd) {
      setTouchStart(0);
      setTouchEnd(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const threshold = 50;

    if (distance > threshold) {
      handleNextSlide();
    } else if (distance < -threshold) {
      handlePrevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const gap = window.innerWidth >= 640 ? 16 : 12;
      const scrollAmount = activeSlide * cardsPerView * (cardWidth + gap);
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [activeSlide, cardsPerView, cardWidth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevSlide, handleNextSlide]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: '#1e2d3a',
            }}
          />

          <div className="relative h-full ios-hero-container text-center px-4 pt-22 sm:pt-26 md:pt-28 lg:pt-32 pb-80 sm:pb-60 md:pb-64" style={{ minHeight: '100%' }}>
            <h1 className="hero-text-layer text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-[1.15] sm:leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="block mb-2 sm:mb-2 tracking-tight">Give Your Child the Edge</span>
              <span className="block bg-gradient-to-r from-white via-airbnb-pink-200 to-white bg-clip-text text-transparent animate-gradient-flow text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">Unlock Their FutureEdge Today</span>
            </h1>
            <p className="hero-text-layer text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl px-2 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] animate-fade-in-up font-medium mb-4 sm:mb-5" style={{ animationDelay: '0.3s' }}>
              Accelerate their success with amazing educational experiences
            </p>
            <div className="hero-text-layer animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link
                to="/camps"
                className="inline-flex items-center gap-2 bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-airbnb shadow-md hover:shadow-lg"
              >
                Explore Camps
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-2 sm:px-4 pb-6 sm:pb-8 transform translate-y-1/2">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center items-center h-72 sm:h-80 bg-white rounded-xl sm:rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading amazing camps...</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
                Discover Amazing Camp Experiences
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
                From outdoor adventures to creative arts, STEM programs to sports camps - find the perfect experience for your child's interests and passions.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (camps.length === 0) {
    return (
      <div className="min-h-screen">
        <section className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: '#1e2d3a',
            }}
          />

          <div className="relative h-full ios-hero-container text-center px-4 pt-22 sm:pt-26 md:pt-28 lg:pt-32 pb-80 sm:pb-60 md:pb-64" style={{ minHeight: '100%' }}>
            <h1 className="hero-text-layer text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-[1.15] sm:leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="block mb-2 sm:mb-2 tracking-tight">Give Your Child the Edge</span>
              <span className="block bg-gradient-to-r from-white via-airbnb-pink-200 to-white bg-clip-text text-transparent animate-gradient-flow text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">Unlock Their FutureEdge Today</span>
            </h1>
            <p className="hero-text-layer text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl px-2 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] animate-fade-in-up font-medium mb-4 sm:mb-5" style={{ animationDelay: '0.3s' }}>
              Accelerate their success with amazing educational experiences
            </p>
            <div className="hero-text-layer animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link
                to="/camps"
                className="inline-flex items-center gap-2 bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-airbnb shadow-md hover:shadow-lg"
              >
                Explore Camps
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
                No Camps Available Yet
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
                Check back soon for exciting camp experiences for your child.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Promotional Popup - configurable dwell time for testing */}
      <PromotionalPopup
        dwellTime={3000}
        discountPercentage={10}
      />

      <section className="relative pb-16 sm:pb-20">
        <div
          className="absolute inset-0 h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px]"
          style={{
            background: '#1e2d3a',
          }}
        />

        <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px] ios-hero-container text-center px-4 pt-22 sm:pt-26 md:pt-28 lg:pt-32 pb-80 sm:pb-60 md:pb-64" style={{ minHeight: '450px' }}>
          <h1 className="hero-text-layer text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-[1.15] sm:leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block mb-2 sm:mb-2 tracking-tight">Give Your Child the Edge</span>
            <span className="block bg-gradient-to-r from-white via-airbnb-pink-200 to-white bg-clip-text text-transparent animate-gradient-flow text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">Unlock Their FutureEdge Today</span>
          </h1>
          <p className="hero-text-layer text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl px-2 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] animate-fade-in-up font-medium mb-4 sm:mb-5" style={{ animationDelay: '0.3s' }}>
            Accelerate their success with amazing educational experiences
          </p>
          <div className="hero-text-layer animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link
              to="/camps"
              className="inline-flex items-center gap-2 bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-airbnb shadow-md hover:shadow-lg"
            >
              Explore Camps
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 mt-8 sm:-mt-44 md:-mt-48">
          <div className="max-w-7xl mx-auto relative" role="region" aria-label="Featured camps carousel">
            {camps.length > cardsPerView && (
              <button
                onClick={handlePrevSlide}
                disabled={isNavigating}
                aria-label="Previous slide"
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ zIndex: 200 }}
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1 sm:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', position: 'relative' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="list"
            >
              {camps.map((camp, index) => (
                <div
                  key={camp.id || index}
                  className="flex-shrink-0 w-[calc(100vw-2rem)] max-w-[280px] sm:w-[320px] md:w-[340px]"
                  role="listitem"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <CampCard {...camp} />
                </div>
              ))}
            </div>

            {camps.length > cardsPerView && (
              <button
                onClick={handleNextSlide}
                disabled={isNavigating}
                aria-label="Next slide"
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ zIndex: 200 }}
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            )}
          </div>
        </div>

        {camps.length > cardsPerView && totalSlides > 1 && (
          <div
            className="flex md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 space-x-2"
            style={{ zIndex: 150 }}
            role="tablist"
            aria-label="Carousel pagination"
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                role="tab"
                aria-selected={index === activeSlide}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === activeSlide ? 'bg-blue-600 w-8' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {camps.length > cardsPerView && totalSlides > 1 && (
          <div
            className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 space-x-2"
            style={{ zIndex: 150 }}
            role="tablist"
            aria-label="Carousel pagination"
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                role="tab"
                aria-selected={index === activeSlide}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Future Impact Section - Reverse Psychology */}
      <FutureImpact />

      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2">
              Explore Camp Categories
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              Choose from our diverse range of camp experiences designed to inspire, challenge, and nurture your child's passions
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  description={category.description}
                  iconName={category.icon_name}
                  colorTheme={category.color_theme}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <NewsletterSignup />

      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 px-2">
              Discover Amazing Camp Experiences
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              From outdoor adventures to creative arts, STEM programs to sports camps - find the perfect experience for your child's interests and passions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
