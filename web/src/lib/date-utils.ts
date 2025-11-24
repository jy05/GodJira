import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Format a date in user's timezone
 * @param date - ISO string or Date object
 * @param timezone - IANA timezone (e.g., "America/Chicago")
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: string | Date | null | undefined,
  timezone: string = 'UTC',
  formatStr: string = 'PPpp' // Default: "Apr 29, 2023, 9:30 AM"
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatInTimeZone(dateObj, timezone, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format relative time ("2 hours ago", "yesterday")
 * @param date - ISO string or Date object
 * @returns Relative time string
 */
export function formatRelative(
  date: string | Date | null | undefined
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
}

/**
 * Format date only (no time)
 * @param date - ISO string or Date object
 * @param timezone - IANA timezone
 * @returns Date string (e.g., "April 29, 2023")
 */
export function formatDate(
  date: string | Date | null | undefined,
  timezone: string = 'UTC'
): string {
  return formatInTimezone(date, timezone, 'PPP'); // "April 29, 2023"
}

/**
 * Format short date
 * @param date - ISO string or Date object
 * @param timezone - IANA timezone
 * @returns Short date string (e.g., "04/29/2023")
 */
export function formatDateShort(
  date: string | Date | null | undefined,
  timezone: string = 'UTC'
): string {
  return formatInTimezone(date, timezone, 'P'); // "04/29/2023"
}

/**
 * Format time only (no date)
 * @param date - ISO string or Date object
 * @param timezone - IANA timezone
 * @returns Time string (e.g., "9:30 AM")
 */
export function formatTime(
  date: string | Date | null | undefined,
  timezone: string = 'UTC'
): string {
  return formatInTimezone(date, timezone, 'p'); // "9:30 AM"
}

/**
 * Format full datetime
 * @param date - ISO string or Date object
 * @param timezone - IANA timezone
 * @returns Full datetime string (e.g., "Apr 29, 2023, 9:30 AM")
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  timezone: string = 'UTC'
): string {
  return formatInTimezone(date, timezone, 'PPpp'); // "Apr 29, 2023, 9:30 AM"
}

/**
 * Format full datetime with timezone abbreviation
 * @param date - ISO string or Date object
 * @param timezone - IANA timezone
 * @returns Full datetime string with timezone (e.g., "Apr 29, 2023, 9:30 AM CST")
 */
export function formatDateTimeWithTz(
  date: string | Date | null | undefined,
  timezone: string = 'UTC'
): string {
  if (!date) return '';
  const formatted = formatInTimezone(date, timezone, 'PPpp');
  const tzAbbr = formatInTimezone(date, timezone, 'zzz');
  return `${formatted} ${tzAbbr}`;
}

/**
 * Convert user timezone date to UTC for API
 * @param date - ISO string or Date object in user's timezone
 * @param timezone - User's IANA timezone
 * @returns ISO string in UTC
 */
export function toUTC(
  date: string | Date,
  timezone: string
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, timezone);
  return zonedDate.toISOString();
}

/**
 * Convert datetime-local input value to user's timezone, then to UTC
 * @param datetimeLocal - datetime-local input value (yyyy-MM-ddTHH:mm)
 * @param timezone - User's IANA timezone
 * @returns ISO string in UTC
 */
export function datetimeLocalToUTC(
  datetimeLocal: string,
  timezone: string
): string {
  if (!datetimeLocal) return '';
  
  // Parse as if it's in the user's timezone
  const [datePart, timePart] = datetimeLocal.split('T');
  const dateStr = `${datePart}T${timePart || '00:00'}:00`;
  
  // Convert to UTC
  return toUTC(dateStr, timezone);
}

/**
 * Convert UTC date to datetime-local format in user's timezone
 * @param date - ISO string or Date object in UTC
 * @param timezone - User's IANA timezone
 * @returns datetime-local format string (yyyy-MM-ddTHH:mm)
 */
export function toDatetimeLocal(
  date: string | Date | null | undefined,
  timezone: string = 'UTC'
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const zonedDate = toZonedTime(dateObj, timezone);
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error converting to datetime-local:', error);
    return '';
  }
}
