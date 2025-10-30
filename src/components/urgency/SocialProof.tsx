import { Users, TrendingUp, Eye } from 'lucide-react';

interface SocialProofProps {
  bookingsLast24h?: number;
  bookingsLastWeek?: number;
  currentViewers?: number;
  showViewers?: boolean;
}

export function SocialProof({
  bookingsLast24h = 0,
  bookingsLastWeek = 0,
  currentViewers = 0,
  showViewers = false
}: SocialProofProps) {
  if (!bookingsLast24h && !bookingsLastWeek && !currentViewers) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {bookingsLast24h > 0 && (
        <div className="inline-flex items-center gap-2 bg-airbnb-pink-50 border border-airbnb-pink-200 text-airbnb-pink-700 px-4 py-2 rounded-full">
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            <span className="font-bold">{bookingsLast24h}</span> booked today
          </span>
        </div>
      )}

      {bookingsLastWeek > 5 && (
        <div className="inline-flex items-center gap-2 bg-airbnb-grey-100 border border-airbnb-grey-300 text-airbnb-grey-900 px-4 py-2 rounded-full">
          <Users className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            <span className="font-bold">{bookingsLastWeek}</span> families booked this week
          </span>
        </div>
      )}

      {showViewers && currentViewers > 0 && (
        <div className="inline-flex items-center gap-2 bg-airbnb-pink-50 border border-airbnb-pink-300 text-airbnb-pink-700 px-4 py-2 rounded-full animate-pulse">
          <Eye className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">
            <span className="font-bold">{currentViewers}</span> {currentViewers === 1 ? 'person is' : 'people are'} viewing this
          </span>
        </div>
      )}
    </div>
  );
}
