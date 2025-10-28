import { CheckCircle } from 'lucide-react';

interface BookingNotificationProps {
  location: string;
  timeAgo: string;
  spotsBooked?: number;
}

export function BookingNotification({ location, timeAgo, spotsBooked = 1 }: BookingNotificationProps) {
  return (
    <div className="bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-100 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Someone from {location} just booked!
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {spotsBooked} {spotsBooked === 1 ? 'spot' : 'spots'} • {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
