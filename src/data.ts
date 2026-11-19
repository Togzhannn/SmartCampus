import type { Room, Booking } from './types';

export const ROOMS: Room[] = [
  { id: 'r1', name: 'Athena 101', building: 'Athena Hall', capacity: 30, blocked: false },
  { id: 'r2', name: 'Athena 102', building: 'Athena Hall', capacity: 20, blocked: false },
  { id: 'r3', name: 'Newton 201', building: 'Newton Hall', capacity: 50, blocked: false },
  { id: 'r4', name: 'Newton 202', building: 'Newton Hall', capacity: 12, blocked: true },
  { id: 'r5', name: 'Curie Lab', building: 'Curie Hall', capacity: 8, blocked: false },
  { id: 'r6', name: 'Da Vinci Studio', building: 'Da Vinci Hall', capacity: 40, blocked: false },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'r1', start: 540, end: 600, title: 'Intro to Algorithms', bookedBy: 'Prof. Smith' },
  { id: 'b2', roomId: 'r1', start: 720, end: 780, title: 'Faculty Meeting', bookedBy: 'Dept. Office' },
  { id: 'b3', roomId: 'r2', start: 480, end: 540, title: 'Calculus I', bookedBy: 'Prof. Johnson' },
  { id: 'b4', roomId: 'r2', start: 900, end: 960, title: 'Office Hours', bookedBy: 'Prof. Johnson' },
  { id: 'b5', roomId: 'r3', start: 600, end: 660, title: 'Physics Lecture', bookedBy: 'Prof. Brown' },
  { id: 'b6', roomId: 'r3', start: 840, end: 900, title: 'Lab Session', bookedBy: 'Prof. Brown' },
  { id: 'b7', roomId: 'r5', start: 600, end: 660, title: 'Chem Lab', bookedBy: 'Prof. Lee' },
  { id: 'b8', roomId: 'r6', start: 780, end: 840, title: 'Design Workshop', bookedBy: 'Prof. Garcia' },
];
