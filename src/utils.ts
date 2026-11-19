import type { Booking, Interval, Room } from './types';

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;

export type ReasonCode =
  | 'AVAILABLE'
  | 'INVALID_INTERVAL'
  | 'PAST_START'
  | 'TOO_LONG'
  | 'NO_ROOM'
  | 'BLOCKED'
  | 'OVERLAP';

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function labelToMinutes(label: string): number {
  // Expects "H:MM AM" or "HH:MM PM"
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export function overlaps(a: Interval, b: Interval): boolean {
  // Touching endpoints are allowed, so strict inequality
  return a.start < b.end && b.start < a.end;
}

export function validateInterval(
  interval: Interval,
  currentTime: number,
  room: Room | undefined,
  bookings: Booking[],
): { valid: boolean; reason?: string; code: ReasonCode } {
  // AC1: 0 <= start < end <= 1440, start after current time
  if (
    !Number.isFinite(interval.start) ||
    !Number.isFinite(interval.end) ||
    interval.start < 0 ||
    interval.end > MINUTES_PER_DAY ||
    interval.start >= interval.end
  ) {
    return {
      valid: false,
      code: 'INVALID_INTERVAL',
      reason: 'Time interval is invalid. Start must be earlier than end, and both must be between 00:00 and 23:59.',
    };
  }

  if (interval.start <= currentTime) {
    return {
      valid: false,
      code: 'PAST_START',
      reason: `Start time must be after the current time (${minutesToLabel(currentTime)}).`,
    };
  }

  // AC2: booking longer than 120 minutes
  if (interval.end - interval.start > MAX_BOOKING_MINUTES) {
    return {
      valid: false,
      code: 'TOO_LONG',
      reason: `Bookings cannot exceed ${MAX_BOOKING_MINUTES} minutes. Your selected duration is ${interval.end - interval.start} minutes.`,
    };
  }

  // AC3: room blocked
  if (!room) {
    return { valid: false, code: 'NO_ROOM', reason: 'Please select a room.' };
  }
  if (room.blocked) {
    return {
      valid: false,
      code: 'BLOCKED',
      reason: `${room.name} is currently blocked and unavailable for booking.`,
    };
  }

  // AC4: overlaps existing booking
  const roomBookings = bookings.filter((b) => b.roomId === room.id);
  const conflict = roomBookings.find((b) => overlaps(interval, { start: b.start, end: b.end }));
  if (conflict) {
    return {
      valid: false,
      code: 'OVERLAP',
      reason: `Overlaps "${conflict.title}" (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}) in ${room.name}.`,
    };
  }

  return { valid: true, code: 'AVAILABLE' };
}