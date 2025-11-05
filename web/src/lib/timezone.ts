/**
 * Timezone utility functions
 * Handles timezone conversions and formatting
 */

/**
 * Get list of common timezones
 */
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
  { value: 'UTC', label: 'UTC' },
];

/**
 * Format a date string according to user's timezone
 * @param dateString - ISO date string from the server
 * @param userTimezone - User's preferred timezone (IANA identifier)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateInTimezone = (
  dateString: string,
  userTimezone?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(dateString);
  const timezone = userTimezone || 'America/Chicago'; // Default to CST

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    timeZone: timezone,
  }).format(date);
};

/**
 * Format a date for display in a concise format
 * @param dateString - ISO date string
 * @param userTimezone - User's preferred timezone
 * @returns Formatted date string (e.g., "Nov 5, 2025, 3:45 PM CST")
 */
export const formatDateTime = (dateString: string, userTimezone?: string): string => {
  return formatDateInTimezone(dateString, userTimezone);
};

/**
 * Format a date for display in short format (date only)
 * @param dateString - ISO date string
 * @param userTimezone - User's preferred timezone
 * @returns Formatted date string (e.g., "Nov 5, 2025")
 */
export const formatDate = (dateString: string, userTimezone?: string): string => {
  return formatDateInTimezone(dateString, userTimezone, {
    hour: undefined,
    minute: undefined,
    timeZoneName: undefined,
  });
};

/**
 * Format a date for display in relative format (e.g., "2 hours ago")
 * Falls back to full date if more than 7 days old
 * @param dateString - ISO date string
 * @param userTimezone - User's preferred timezone
 * @returns Formatted date string
 */
export const formatRelativeDate = (dateString: string, userTimezone?: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDateTime(dateString, userTimezone);
  }
};

/**
 * Get the user's detected timezone
 * @returns IANA timezone identifier
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert a date from one timezone to another
 * @param dateString - ISO date string
 * @param fromTimezone - Source timezone
 * @param toTimezone - Target timezone
 * @returns Date object adjusted to target timezone
 */
export const convertTimezone = (
  dateString: string,
  fromTimezone: string,
  toTimezone: string
): Date => {
  const date = new Date(dateString);
  
  // Format date in source timezone
  const sourceFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: fromTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Format date in target timezone
  const targetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: toTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return date;
};
