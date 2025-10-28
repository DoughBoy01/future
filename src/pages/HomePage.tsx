import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CampCard } from '../components/home/CampCard';
import { CategoryCard } from '../components/home/CategoryCard';
import type { Database } from '../lib/database.types';

type Camp = Database['public']['Tables']['camps']['Row'];
type Category = Database['public']['Tables']['camp_categories']['Row'];

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

  const staticCamps = [
    {
      id: undefined,
      badge: 'Limited' as const,
      image: 'https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Lake Tahoe, California',
      rating: 5,
      reviewCount: 0,
      title: 'Adventure Quest Camp',
      category: 'Adventure',
      ageRange: 'Ages 8-14',
      price: 850,
      originalPrice: 950,
      spotsRemaining: 3,
      bookingsThisWeek: 12,
    },
    {
      id: undefined,
      badge: 'Popular' as const,
      image: 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'My house',
      rating: 0,
      reviewCount: 0,
      title: 'Steves camping day',
      category: 'Specialty',
      ageRange: 'Ages 21+',
      price: 100,
      originalPrice: 200,
      spotsRemaining: 8,
      bookingsThisWeek: 15,
    },
    {
      id: undefined,
      badge: 'Limited' as const,
      image: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Portland, OR',
      rating: 0,
      reviewCount: 0,
      title: 'Creative Arts Studio',
      category: 'Arts',
      ageRange: 'Ages 6-16',
      price: 680,
      originalPrice: 800,
      spotsRemaining: 2,
      bookingsThisWeek: 8,
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
      price: 1200,
      originalPrice: 1400,
      spotsRemaining: 15,
      bookingsThisWeek: 0,
    },
    {
      id: undefined,
      badge: 'Popular' as const,
      image: 'https://images.pexels.com/photos/920382/pexels-photo-920382.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Denver, CO',
      rating: 5,
      reviewCount: 12,
      title: 'Mountain Explorer Camp',
      category: 'Outdoor',
      ageRange: 'Ages 10-15',
      price: 920,
      originalPrice: 1100,
      spotsRemaining: 6,
      bookingsThisWeek: 18,
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
          price: earlyBirdActive && camp.early_bird_price ? camp.early_bird_price : camp.price,
          currency: camp.currency,
          originalPrice: earlyBirdActive && camp.early_bird_price ? camp.price : undefined,
          spotsRemaining,
          bookingsThisWeek: Math.floor(Math.random() * 20),
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
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

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
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pb-20 sm:pb-24 md:pb-32">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <span className="block mb-1 sm:mb-2">Give Your Child the Edge</span>
              <span className="block">Unlock Their FutureEdge Today</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-3xl px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Accelerate their success with amazing educational experiences
            </p>
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
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>

          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <span className="block mb-1 sm:mb-2">Give Your Child the Edge</span>
              <span className="block">Unlock Their FutureEdge Today</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-3xl px-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Accelerate their success with amazing educational experiences
            </p>
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
      <section className="relative pb-72 sm:pb-80 md:pb-96">
        <div
          className="absolute inset-0 h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px] bg-cover bg-center sm:bg-top"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px] flex flex-col items-center text-center px-4 pt-24 sm:pt-28 md:pt-32 lg:pt-36">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 max-w-5xl leading-[1.15] sm:leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="block mb-1 sm:mb-2">Give Your Child the Edge</span>
            <span className="block">Unlock Their FutureEdge Today</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white max-w-3xl px-4 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Accelerate their success with amazing educational experiences
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 -mt-40 sm:-mt-44 md:-mt-48">
          <div className="max-w-7xl mx-auto relative" role="region" aria-label="Featured camps carousel">
            {camps.length > cardsPerView && (
              <button
                onClick={handlePrevSlide}
                disabled={isNavigating}
                aria-label="Previous slide"
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <CampCard {...camp} />
                </div>
              ))}
            </div>

            {camps.length > cardsPerView && (
              <button
                onClick={handleNextSlide}
                disabled={isNavigating}
                aria-label="Next slide"
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            )}
          </div>
        </div>

        {camps.length > cardsPerView && totalSlides > 1 && (
          <div
            className="flex md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 space-x-2 z-10"
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
            className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 space-x-2 z-10"
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
