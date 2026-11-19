export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
  title: string;
  bookedBy: string;
}

export interface Interval {
  start: number;
  end: number;
}

export type AvailabilityResult =
  | { available: true; roomName: string; interval: Interval }
  | { available: false; reason: string; roomName: string; interval: Interval };
