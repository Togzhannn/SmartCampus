import { describe, it, expect } from 'vitest';
import { validateInterval } from '@/utils';
import { ROOMS, INITIAL_BOOKINGS } from '@/data';
import type { Room } from '@/types';

const CURRENT_TIME = 600; // 10:00 AM, matches App.tsx

function roomById(id: string): Room {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`Fixture room ${id} not found`);
  return room;
}

describe('validateInterval', () => {
  it('AC1: rejects a start time that is not after the current time', () => {
    const result = validateInterval(
      { start: 540, end: 570 },
      CURRENT_TIME,
      roomById('r1'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('after the current time');
  });

  it('AC1: rejects a start time equal to the current time', () => {
    const result = validateInterval(
      { start: CURRENT_TIME, end: 660 },
      CURRENT_TIME,
      roomById('r5'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
  });

  it('AC1: rejects a reversed interval where start is after end', () => {
    const result = validateInterval(
      { start: 900, end: 840 },
      CURRENT_TIME,
      roomById('r3'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Start must be earlier than end');
  });

  it('AC1: rejects an interval where start equals end', () => {
    const result = validateInterval(
      { start: 900, end: 900 },
      CURRENT_TIME,
      roomById('r3'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
  });

  it('AC2: rejects a 121-minute duration', () => {
    const result = validateInterval(
      { start: 780, end: 901 },
      CURRENT_TIME,
      roomById('r1'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Your selected duration is 121 minutes');
  });

  it('AC2: allows a booking of exactly 120 minutes', () => {
    const result = validateInterval(
      { start: 780, end: 900 },
      CURRENT_TIME,
      roomById('r1'),
      INITIAL_BOOKINGS,
    );
    expect(result).toEqual({ valid: true, code: 'AVAILABLE' }); // changed
  });

  it('AC3: rejects a booking in blocked room r4', () => {
    const result = validateInterval(
      { start: 780, end: 840 },
      CURRENT_TIME,
      roomById('r4'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('currently blocked');
  });

  it('AC4: rejects an interval that overlaps an existing booking', () => {
    const result = validateInterval(
      { start: 750, end: 810 },
      CURRENT_TIME,
      roomById('r1'),
      INITIAL_BOOKINGS,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Overlaps "Faculty Meeting"');
  });

  it('AC4: allows bookings that touch existing bookings only at endpoints', () => {
    const result = validateInterval(
      { start: 780, end: 840 },
      CURRENT_TIME,
      roomById('r1'),
      INITIAL_BOOKINGS,
    );
    expect(result).toEqual({ valid: true, code: 'AVAILABLE' }); // changed
  });

  it('AC5: does not mutate booking fixtures', () => {
    const snapshot = structuredClone(INITIAL_BOOKINGS);

    validateInterval({ start: 750, end: 810 }, CURRENT_TIME, roomById('r1'), INITIAL_BOOKINGS);
    validateInterval({ start: 780, end: 840 }, CURRENT_TIME, roomById('r1'), INITIAL_BOOKINGS);
    validateInterval({ start: 780, end: 901 }, CURRENT_TIME, roomById('r1'), INITIAL_BOOKINGS);

    expect(INITIAL_BOOKINGS).toEqual(snapshot);
  });
});