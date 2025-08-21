import { Clock, Globe } from "lucide-react";
import { useRealTimeClock } from "@/hooks/useRealTimeClock";

interface RealTimeClockProps {
  variant?: 'header' | 'full';
  className?: string;
}

export default function RealTimeClock({ variant = 'header', className = '' }: RealTimeClockProps) {
  const { time, date, timezone } = useRealTimeClock();

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-100 dark:border-gray-600 ${className}`}>
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <div className="text-sm">
          <div className="font-semibold text-gray-900 dark:text-white leading-none" data-testid="clock-time">
            {time}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 leading-none" data-testid="clock-timezone">
            {timezone}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-modern p-6 text-center ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold">World Clock</h3>
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="clock-time-full">
          {time}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300" data-testid="clock-date-full">
          {date}
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
          <Globe className="w-3 h-3" />
          {timezone}
        </div>
      </div>
    </div>
  );
}