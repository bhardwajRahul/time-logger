/**
 * Combines a Date object with a time string (in "HH:MM" format) to create a new Date object with the specified date and time.
 *
 * Example: combineDateTime(new Date('2024-01-01'), '14:30') => Date object representing January 1, 2024 at 2:30 PM
 */
export const combineDateTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

/**
 * Formats a number as a two-digit string, padding with a leading zero if necessary.
 *
 * Example: formatTime(5) => "05", formatTime(12) => "12"
 */
export const padWithZero = (value: number) => String(value).padStart(2, '0');

/**
 * Formats a total number of seconds into an HH:MM:SS string.
 *
 * Example: formatSeconds(3725) => "01:02:05"
 */
export const formatSeconds = (totalSecs: number): string => {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${padWithZero(h)}:${padWithZero(m)}:${padWithZero(s)}`;
};

/**
 * Computes the merged duration between two or more time entries as a human-readable string.
 * The merged duration is the sum of all individual entry durations.
 *
 * Example: computeMergedDuration(['9:00', '11:00'], ['11:00', '12:00']) => "3h 00m"
 */
export const computeMergedDuration = (
  startTimes: string[],
  endTimes: string[],
): string => {
  if (startTimes.length !== endTimes.length) {
    throw new Error('startTimes and endTimes must have the same length');
  }
  const totalMs = startTimes.reduce((acc, start, i) => {
    return acc + (new Date(endTimes[i]).getTime() - new Date(start).getTime());
  }, 0);
  const totalMins = Math.floor(totalMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  if (hours > 0) return `${hours}h ${padWithZero(minutes)}m`;
  return `${minutes}m`;
};
