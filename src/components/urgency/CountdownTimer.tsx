import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CountdownTimer({ targetDate, label = 'Offer ends in', size = 'md', showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const numberSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${sizeClasses[size]}`}>
      {showIcon && <Clock className="w-5 h-5 text-red-500 animate-pulse" />}
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">{label}:</span>
        <div className="flex items-center gap-1">
          {timeLeft.days > 0 && (
            <>
              <div className="bg-red-500 text-white px-2 py-1 rounded font-bold min-w-[2.5rem] text-center">
                <span className={numberSizeClasses[size]}>{timeLeft.days}</span>
                <div className="text-xs">days</div>
              </div>
              <span className="font-bold">:</span>
            </>
          )}
          <div className="bg-red-500 text-white px-2 py-1 rounded font-bold min-w-[2.5rem] text-center">
            <span className={numberSizeClasses[size]}>{String(timeLeft.hours).padStart(2, '0')}</span>
            <div className="text-xs">hrs</div>
          </div>
          <span className="font-bold">:</span>
          <div className="bg-red-500 text-white px-2 py-1 rounded font-bold min-w-[2.5rem] text-center">
            <span className={numberSizeClasses[size]}>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <div className="text-xs">min</div>
          </div>
          <span className="font-bold">:</span>
          <div className="bg-red-500 text-white px-2 py-1 rounded font-bold min-w-[2.5rem] text-center">
            <span className={numberSizeClasses[size]}>{String(timeLeft.seconds).padStart(2, '0')}</span>
            <div className="text-xs">sec</div>
          </div>
        </div>
      </div>
    </div>
  );
}
