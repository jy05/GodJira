import { formatInTimezone, formatRelative } from '@/lib/date-utils';
import { useAuth } from '@/contexts/AuthContext';

interface DateDisplayProps {
  date: string | Date | null | undefined;
  format?: 'short' | 'medium' | 'long' | 'full' | 'relative' | 'date-only' | 'time-only';
  showTimezone?: boolean;
  className?: string;
}

/**
 * Display a date in the user's preferred timezone
 * Automatically uses the current user's timezone from AuthContext
 */
export const DateDisplay = ({ 
  date, 
  format = 'medium',
  showTimezone = false,
  className = ''
}: DateDisplayProps) => {
  const { user } = useAuth();
  const timezone = user?.timezone || 'UTC';
  
  if (!date) return null;
  
  let formatted = '';
  let formatStr = 'PPpp'; // Default medium
  
  switch (format) {
    case 'short':
      formatStr = 'P'; // "04/29/2023"
      break;
    case 'date-only':
      formatStr = 'PPP'; // "April 29, 2023"
      break;
    case 'time-only':
      formatStr = 'p'; // "9:30 AM"
      break;
    case 'medium':
      formatStr = 'PPp'; // "Apr 29, 2023, 9:30 AM"
      break;
    case 'long':
      formatStr = 'PPPp'; // "April 29th, 2023 at 9:30 AM"
      break;
    case 'full':
      formatStr = 'PPPPpppp'; // Full format
      break;
    case 'relative':
      return (
        <time 
          dateTime={typeof date === 'string' ? date : date.toISOString()}
          title={formatInTimezone(date, timezone, 'PPpp')}
          className={className}
        >
          {formatRelative(date)}
        </time>
      );
  }
  
  formatted = formatInTimezone(date, timezone, formatStr);
  
  if (showTimezone) {
    const tzAbbr = formatInTimezone(date, timezone, 'zzz');
    formatted += ` ${tzAbbr}`;
  }
  
  return (
    <time 
      dateTime={typeof date === 'string' ? date : date.toISOString()}
      title={formatInTimezone(date, timezone, 'PPPPpppp')}
      className={className}
    >
      {formatted}
    </time>
  );
};

interface RelativeTimeProps {
  date: string | Date | null | undefined;
  className?: string;
}

/**
 * Display relative time ("2 hours ago", "yesterday")
 * Shows full datetime on hover
 */
export const RelativeTime = ({ date, className = '' }: RelativeTimeProps) => {
  return <DateDisplay date={date} format="relative" className={className} />;
};

interface DateRangeProps {
  start: string | Date | null | undefined;
  end: string | Date | null | undefined;
  format?: 'short' | 'medium' | 'long';
  separator?: string;
  className?: string;
}

/**
 * Display a date range with consistent formatting
 */
export const DateRange = ({ 
  start, 
  end, 
  format = 'short',
  separator = ' - ',
  className = ''
}: DateRangeProps) => {
  if (!start && !end) return null;
  
  return (
    <span className={className}>
      {start && <DateDisplay date={start} format={format} />}
      {start && end && <span>{separator}</span>}
      {end && <DateDisplay date={end} format={format} />}
    </span>
  );
};
