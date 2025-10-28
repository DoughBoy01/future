import { AlertCircle, TrendingUp, Users } from 'lucide-react';

interface AvailabilityAlertProps {
  spotsRemaining: number;
  capacity: number;
  threshold?: number;
}

export function AvailabilityAlert({ spotsRemaining, capacity, threshold = 5 }: AvailabilityAlertProps) {
  const percentRemaining = (spotsRemaining / capacity) * 100;

  if (spotsRemaining <= 0) {
    return (
      <div className="bg-red-500 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg animate-pulse">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg">Fully Booked!</p>
          <p className="text-sm text-red-100">This camp has reached maximum capacity</p>
        </div>
      </div>
    );
  }

  if (spotsRemaining <= 3) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg animate-pulse">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg">Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} left!</p>
          <p className="text-sm text-red-100">Book now before it's too late</p>
        </div>
      </div>
    );
  }

  if (spotsRemaining <= threshold) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg">Limited Availability!</p>
          <p className="text-sm text-orange-100">Only {spotsRemaining} spots remaining</p>
        </div>
      </div>
    );
  }

  if (percentRemaining <= 25) {
    return (
      <div className="bg-yellow-500 text-yellow-900 px-6 py-4 rounded-xl flex items-center gap-3 shadow-md">
        <TrendingUp className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold">Filling up fast!</p>
          <p className="text-sm">{spotsRemaining} spots available</p>
        </div>
      </div>
    );
  }

  if (percentRemaining <= 50) {
    return (
      <div className="bg-blue-50 border-2 border-blue-300 text-blue-900 px-6 py-4 rounded-xl flex items-center gap-3">
        <Users className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-semibold">Popular choice!</p>
          <p className="text-sm">{spotsRemaining} spots available</p>
        </div>
      </div>
    );
  }

  return null;
}
