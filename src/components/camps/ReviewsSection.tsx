import { Star, ThumbsUp, BadgeCheck } from 'lucide-react';
import { useState } from 'react';

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
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    } else if (sortBy === 'highest') {
      return b.overall_rating - a.overall_rating;
    } else {
      return a.overall_rating - b.overall_rating;
    }
  });

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

  if (totalReviews === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">Be the first to share your experience with this camp!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="flex-shrink-0">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
              {renderStars(Math.round(averageRating), 'lg')}
              <p className="mt-2 text-sm text-gray-600">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starDistribution[stars as keyof typeof starDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">{stars} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-1 gap-4">
            {[
              { label: 'Staff', value: ratingBreakdown.staff },
              { label: 'Activities', value: ratingBreakdown.activities },
              { label: 'Facilities', value: ratingBreakdown.facilities },
              { label: 'Value', value: ratingBreakdown.value },
            ].map((category) => (
              <div key={category.label} className="text-center md:text-left">
                <div className="text-sm text-gray-600 mb-1">{category.label}</div>
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(category.value), 'sm')}
                  <span className="text-sm font-medium text-gray-900">{category.value.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {recommendPercentage >= 90 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-green-700">
              <ThumbsUp className="w-5 h-5" />
              <span className="font-semibold">{recommendPercentage}% of parents recommend this camp</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold text-gray-900">{totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                  {review.parent_name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900">{review.parent_name}</h4>
                  {review.verified_booking && (
                    <div className="flex items-center gap-1 text-green-600">
                      <BadgeCheck className="w-4 h-4" />
                      <span className="text-xs font-medium">Verified Booking</span>
                    </div>
                  )}
                  {review.parent_location && (
                    <span className="text-sm text-gray-500">• {review.parent_location}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {renderStars(review.overall_rating, 'sm')}
                  <span className="text-sm text-gray-500">{formatDate(review.submitted_at)}</span>
                </div>

                {review.comments && (
                  <p className="text-gray-700 leading-relaxed mb-4">{review.comments}</p>
                )}

                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                {review.response_from_host && (
                  <div className="mt-4 pl-4 border-l-2 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Response from host</span>
                      {review.response_date && (
                        <span className="text-sm text-gray-500">• {formatDate(review.response_date)}</span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{review.response_from_host}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                  </button>
                  {review.would_recommend && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <ThumbsUp className="w-4 h-4 fill-current" />
                      <span className="font-medium">Recommends</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
