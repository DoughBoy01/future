import { Star, ThumbsUp, BadgeCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Review {
  id: string;
  parent_name: string;
  parent_location?: string;
  overall_rating: number;
  staff_rating?: number;
  activities_rating?: number;
  facilities_rating?: number;
  value_rating?: number;
  comments?: string;
  would_recommend: boolean;
  verified_booking: boolean;
  photos?: string[];
  helpful_count: number;
  submitted_at: string;
  response_from_host?: string;
  response_date?: string;
}

interface ReviewsSectionProps {
  campId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    overall: number;
    staff: number;
    activities: number;
    facilities: number;
    value: number;
  };
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: Review[];
  recommendPercentage: number;
}

export function ReviewsSection({
  averageRating,
  totalReviews,
  ratingBreakdown,
  starDistribution,
  reviews,
  recommendPercentage,
}: ReviewsSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Filter only positive reviews (4-5 stars) for social proof
  const positiveReviews = reviews
    .filter(review => review.overall_rating >= 4)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const goToPrevious = () => {
    const newIndex = currentSlide === 0 ? positiveReviews.length - 1 : currentSlide - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentSlide === positiveReviews.length - 1 ? 0 : currentSlide + 1;
    goToSlide(newIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      goToNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      goToPrevious();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const slideWidth = scrollContainerRef.current.offsetWidth;
        const newSlide = Math.round(scrollLeft / slideWidth);
        setCurrentSlide(newSlide);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (totalReviews === 0 || positiveReviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Star className="w-12 h-12 text-airbnb-grey-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-airbnb-grey-900 mb-2">No Reviews Yet</h3>
        <p className="text-airbnb-grey-600">Be the first to share your experience with this camp!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary Header */}
      <div className="bg-gradient-to-br from-white to-airbnb-pink-50 rounded-xl shadow-md p-6 sm:p-8 border border-airbnb-grey-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-5xl font-bold text-airbnb-grey-900">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating), 'lg')}
                <p className="text-sm text-airbnb-grey-600 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
              </div>
            </div>
          </div>

          {recommendPercentage >= 90 && (
            <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-bold text-green-900">{recommendPercentage}%</div>
                <div className="text-xs text-green-700">Would Recommend</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Proof Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-airbnb-grey-900">What Parents Are Saying</h3>
          <div className="flex items-center gap-2 text-sm text-airbnb-grey-600">
            <BadgeCheck className="w-4 h-4 text-green-600" />
            <span>Verified Reviews</span>
          </div>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {positiveReviews.map((review) => (
              <div
                key={review.id}
                className="w-full flex-shrink-0 snap-center px-1"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-airbnb-grey-200 hover:shadow-lg transition-shadow">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-airbnb-pink-200 mb-4" />

                  {/* Stars */}
                  <div className="mb-4">
                    {renderStars(review.overall_rating, 'md')}
                  </div>

                  {/* Review Comment */}
                  {review.comments && (
                    <blockquote className="text-airbnb-grey-700 text-base sm:text-lg leading-relaxed mb-6 line-clamp-4">
                      "{review.comments}"
                    </blockquote>
                  )}

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-airbnb-grey-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-airbnb-pink-500 to-airbnb-pink-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {review.parent_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-airbnb-grey-900">{review.parent_name}</div>
                      <div className="flex items-center gap-2 text-sm text-airbnb-grey-600">
                        {review.parent_location && <span>{review.parent_location}</span>}
                        {review.parent_location && review.verified_booking && <span>•</span>}
                        {review.verified_booking && (
                          <span className="flex items-center gap-1 text-green-600">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommends Badge */}
                  {review.would_recommend && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <ThumbsUp className="w-4 h-4 fill-current" />
                      <span>Recommends this camp</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Desktop */}
          {positiveReviews.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-airbnb-grey-50 transition-colors border border-airbnb-grey-200 z-10"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-6 h-6 text-airbnb-grey-700" />
              </button>
              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-airbnb-grey-50 transition-colors border border-airbnb-grey-200 z-10"
                aria-label="Next review"
              >
                <ChevronRight className="w-6 h-6 text-airbnb-grey-700" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {positiveReviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {positiveReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to review ${index + 1}`}
                  className={`transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 h-2 bg-airbnb-pink-500 rounded-full'
                      : 'w-2 h-2 bg-airbnb-grey-300 rounded-full hover:bg-airbnb-grey-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
