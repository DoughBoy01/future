import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CampCard } from '../components/home/CampCard';
import { CampCardSkeleton } from '../components/home/CampCardSkeleton';
import { CategoryCard } from '../components/home/CategoryCard';
import { FutureImpact } from '../components/home/FutureImpact';
import { QuizHomeModule } from '../components/quiz/QuizHomeModule';
import { PromotionalPopup } from '../components/marketing/PromotionalPopup';
import { NewsletterSignup } from '../components/marketing/NewsletterSignup';
import { trackFeaturedCarouselView, trackFeaturedCampClick } from '../utils/analytics';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];
type Category = Database['public']['Tables']['camp_categories']['Row'];



export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [featuredCamps, setFeaturedCamps] = useState<Camp[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [cardWidth, setCardWidth] = useState(280);
  const [isNavigating, setIsNavigating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Autoplay state
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(() => {
    const saved = localStorage.getItem('featuredCarouselAutoplay');
    return saved !== null ? saved === 'true' : !prefersReducedMotion;
  });
  const [isHovered, setIsHovered] = useState(false);


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
            .order('start_date', { ascending: true }),
          supabase
            .from('camp_categories')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true })
        ]);

        if (campsResponse.error) throw campsResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;

        if (isMounted) {
          if (campsResponse.data) {
            setFeaturedCamps(campsResponse.data);

            // Track featured carousel view with camp IDs
            if (campsResponse.data.length > 0) {
              const campIds = campsResponse.data.map(camp => camp.id);
              trackFeaturedCarouselView(campIds);
            }
          }

          if (categoriesResponse.data) {
            setCategories(categoriesResponse.data);
          }

          setError(null);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load data'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);


  // Transform featured camps data for display (memoized for performance)
  const camps = useMemo(() => {
    return featuredCamps
      .filter(camp => {
        // Filter out camps that have already started
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const campStartDate = camp.start_date ? new Date(camp.start_date) : null;
        return !campStartDate || campStartDate >= today;
      })
      .map(camp => {
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
          category: camp.category || 'General',
          ageRange: `Ages ${camp.age_min}-${camp.age_max}`,
          ageMin: camp.age_min,
          ageMax: camp.age_max,
          price: earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price,
          currency: camp.currency || undefined,
          originalPrice: earlyBirdActive && camp.early_bird_price ? camp.price : undefined,
          spotsRemaining,
          startDate: camp.start_date,
          endDate: camp.end_date,
          description: camp.description || undefined,
        };
      });
  }, [featuredCamps]);

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

  // Autoplay carousel functionality
  useEffect(() => {
    if (!isAutoplayEnabled || camps.length <= 1 || isHovered || isNavigating) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000); // Advance every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoplayEnabled, camps.length, isHovered, isNavigating, handleNextSlide]);

  // Preload adjacent slide images for smooth transitions
  useEffect(() => {
    if (camps.length === 0) return;

    const nextIndex = (activeSlide + 1) % totalSlides;
    const prevIndex = (activeSlide - 1 + totalSlides) % totalSlides;

    [nextIndex, prevIndex].forEach(slideIndex => {
      const startIdx = slideIndex * cardsPerView;
      const endIdx = Math.min(startIdx + cardsPerView, camps.length);

      for (let i = startIdx; i < endIdx; i++) {
        if (camps[i]?.image) {
          const img = new Image();
          img.src = camps[i].image;
        }
      }
    });
  }, [activeSlide, camps, cardsPerView, totalSlides]);

  // Toggle autoplay and persist preference
  const toggleAutoplay = () => {
    setIsAutoplayEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('featuredCarouselAutoplay', String(newValue));
      return newValue;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: '#1e2d3a',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.6)' }}
            >
              <source src="/hero_background.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
          </div>

          <div className="relative h-full ios-hero-container text-center px-4 pt-22 sm:pt-26 md:pt-28 lg:pt-32 pb-80 sm:pb-60 md:pb-64 z-10" style={{ minHeight: '100%' }}>
            <h1 className="hero-text-layer text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-[1.15] sm:leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="block mb-2 sm:mb-2 tracking-tight">Unlock Top University Admissions</span>
              <span className="block bg-gradient-to-r from-white via-airbnb-pink-200 to-white bg-clip-text text-transparent animate-gradient-flow text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">With Proven Camp Experiences</span>
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
              <div className="flex gap-3 sm:gap-4 overflow-hidden px-1 sm:px-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[calc(100vw-2rem)] max-w-[280px] sm:w-[320px] md:w-[340px]">
                    <CampCardSkeleton />
                  </div>
                ))}
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

  // Show carousel controls only if there are multiple slides
  const showCarouselControls = camps.length > 1;

  // Smart pagination dots with ellipsis for 10+ slides
  const getVisibleDots = () => {
    if (totalSlides <= 7) {
      return Array.from({ length: totalSlides }, (_, i) => i);
    }

    const dots: (number | null)[] = [];
    const current = activeSlide;

    if (current <= 3) {
      // Show first 5, ellipsis, last
      dots.push(0, 1, 2, 3, 4, null, totalSlides - 1);
    } else if (current >= totalSlides - 4) {
      // Show first, ellipsis, last 5
      dots.push(0, null, totalSlides - 5, totalSlides - 4, totalSlides - 3, totalSlides - 2, totalSlides - 1);
    } else {
      // Show first, ellipsis, current ±1, ellipsis, last
      dots.push(0, null, current - 1, current, current + 1, null, totalSlides - 1);
    }

    return dots;
  };

  return (
    <div className="min-h-screen">
      {/* Promotional Popup - configurable dwell time for testing */}
      <PromotionalPopup
        dwellTime={3000}
        discountPercentage={10}
      />

      <section className="relative pb-16 sm:pb-20">
        {/* Hero Content with Video Background */}
        <div className="relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px]">
          {/* Video Background Layer - Absolute positioned within hero section */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 0 }}
          >
            <div className="absolute inset-0" style={{ background: '#1e2d3a' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.7)' }}
              >
                <source src="/hero_background.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
            </div>
          </div>

          {/* Hero Text Content - Above video */}
          <div className="relative ios-hero-container text-center px-4 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-72 sm:pb-56 md:pb-60" style={{ zIndex: 1 }}>
            <h1 className="hero-text-layer text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl mx-auto leading-[1.15] sm:leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="block mb-2 sm:mb-2 tracking-tight">Unlock Top University Admissions</span>
              <span className="block bg-gradient-to-r from-white via-airbnb-pink-200 to-white bg-clip-text text-transparent animate-gradient-flow text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">With Proven Camp Experiences</span>
            </h1>
            <p className="hero-text-layer text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-2xl mx-auto px-2 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] animate-fade-in-up font-medium mb-4 sm:mb-5" style={{ animationDelay: '0.3s' }}>
              Accelerate their success with amazing educational experiences
            </p>
            <div className="hero-text-layer animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link
                to="/camps"
                className="inline-flex items-center gap-2 bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-airbnb shadow-md hover:shadow-lg"
              >
                Explore Camps
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Camp Cards Carousel - Overlapping hero */}
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 -mt-40 sm:-mt-44 md:-mt-48" style={{ zIndex: 10 }}>
            {/* Error State */}
            {error && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
                <p className="text-airbnb-grey-600 mb-4">
                  Couldn't load featured camps. Please try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-airbnb shadow-md hover:shadow-lg"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!error && camps.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-airbnb-grey-900 mb-3">
                  No Featured Camps Yet
                </h3>
                <p className="text-airbnb-grey-600 mb-6">
                  Check back soon for handpicked camp experiences
                </p>
                <Link to="/camps">
                  <button className="bg-airbnb-pink-600 hover:bg-airbnb-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-airbnb shadow-md hover:shadow-lg">
                    Browse All Camps
                  </button>
                </Link>
              </div>
            )}

            {/* Carousel */}
            {!error && camps.length > 0 && (
              <div
                className="max-w-7xl mx-auto relative"
                role="region"
                aria-label="Featured camps carousel"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Autoplay control button */}
                {showCarouselControls && (
                  <button
                    onClick={toggleAutoplay}
                    aria-label={isAutoplayEnabled ? "Pause automatic carousel" : "Resume automatic carousel"}
                    className="absolute top-3 right-3 z-30 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                  >
                    {isAutoplayEnabled ? (
                      <Pause className="w-4 h-4 text-airbnb-grey-700" />
                    ) : (
                      <Play className="w-4 h-4 text-airbnb-grey-700" />
                    )}
                  </button>
                )}

                {/* Previous button */}
                {showCarouselControls && (
                  <button
                    onClick={handlePrevSlide}
                    disabled={isNavigating}
                    aria-label="Previous slide"
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20"
                  >
                    <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                )}

                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1 sm:px-0"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                    >
                      <CampCard
                        {...camp}
                        onTrackClick={() => trackFeaturedCampClick(camp.id || '', index, camps.length)}
                      />
                    </div>
                  ))}
                </div>

                {/* Next button */}
                {showCarouselControls && (
                  <button
                    onClick={handleNextSlide}
                    disabled={isNavigating}
                    aria-label="Next slide"
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20"
                  >
                    <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                )}

                {/* Accessibility: Screen reader announcements */}
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                >
                  {`Showing slide ${activeSlide + 1} of ${totalSlides}`}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Pagination Dots with smart ellipsis */}
          {!error && showCarouselControls && totalSlides > 1 && (
            <div
              className="flex md:hidden justify-center items-center mt-4 space-x-2"
              role="tablist"
              aria-label="Carousel pagination"
            >
              {getVisibleDots().map((dotIndex, i) => (
                dotIndex === null ? (
                  <span key={`ellipsis-${i}`} className="text-airbnb-grey-400 px-1">...</span>
                ) : (
                  <button
                    key={dotIndex}
                    onClick={() => setActiveSlide(dotIndex)}
                    role="tab"
                    aria-selected={dotIndex === activeSlide}
                    aria-label={`Go to slide ${dotIndex + 1}`}
                    className={`rounded-full transition-all ${
                      dotIndex === activeSlide ? 'bg-blue-600 w-8 h-2.5' : 'bg-gray-400 w-2.5 h-2.5'
                    }`}
                  />
                )
              ))}
            </div>
          )}

          {/* Desktop Pagination Dots with smart ellipsis */}
          {!error && showCarouselControls && totalSlides > 1 && (
            <div
              className="hidden md:flex justify-center items-center mt-6 space-x-2"
              role="tablist"
              aria-label="Carousel pagination"
            >
              {getVisibleDots().map((dotIndex, i) => (
                dotIndex === null ? (
                  <span key={`ellipsis-${i}`} className="text-white/50 px-1">...</span>
                ) : (
                  <button
                    key={dotIndex}
                    onClick={() => setActiveSlide(dotIndex)}
                    role="tab"
                    aria-selected={dotIndex === activeSlide}
                    aria-label={`Go to slide ${dotIndex + 1}`}
                    className={`rounded-full transition-all ${
                      dotIndex === activeSlide ? 'bg-white w-8 h-2' : 'bg-white/50 w-2 h-2'
                    }`}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Future Impact Section - Reverse Psychology */}
      <FutureImpact />

      {/* Camp Finder Quiz Module */}
      <QuizHomeModule />

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
