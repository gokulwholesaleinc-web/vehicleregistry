import { useState, useEffect } from 'react';

interface ClockData {
  time: string;
  date: string;
  timezone: string;
  timestamp: number;
}

export function useRealTimeClock() {
  const [clockData, setClockData] = useState<ClockData>({
    time: '',
    date: '',
    timezone: '',
    timestamp: 0
  });

  const updateClock = () => {
    const now = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };

    // Get timezone display name
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneDisplay = timezone.split('/').pop()?.replace('_', ' ') || timezone;

    setClockData({
      time: now.toLocaleTimeString('en-US', timeOptions),
      date: now.toLocaleDateString('en-US', dateOptions),
      timezone: timezoneDisplay,
      timestamp: now.getTime()
    });
  };

  useEffect(() => {
    // Update immediately
    updateClock();
    
    // Set up interval to update every second
    const interval = setInterval(updateClock, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return clockData;
}