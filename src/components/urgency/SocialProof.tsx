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
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">
            <span className="font-bold">{bookingsLast24h}</span> booked today
          </span>
        </div>
      )}

      {bookingsLastWeek > 5 && (
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            <span className="font-bold">{bookingsLastWeek}</span> families booked this week
          </span>
        </div>
      )}

      {showViewers && currentViewers > 0 && (
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-full animate-pulse">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            <span className="font-bold">{currentViewers}</span> {currentViewers === 1 ? 'person is' : 'people are'} viewing this
          </span>
        </div>
      )}
    </div>
  );
}
