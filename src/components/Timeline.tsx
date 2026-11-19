import { minutesToLabel } from '@/utils';
import type { Booking, Interval } from '@/types';

interface TimelineProps {
  bookings: Booking[];
  candidate: Interval | null;
  currentTime: number;
}

const HOUR_START = 7 * 60; // 7:00 AM
const HOUR_END = 22 * 60;  // 10:00 PM

export function Timeline({ bookings, candidate, currentTime }: TimelineProps) {
  const span = HOUR_END - HOUR_START;

  function pct(min: number): number {
    return ((min - HOUR_START) / span) * 100;
  }

  const hours: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h += 60) {
    hours.push(h);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Today's Schedule (7:00 AM – 10:00 PM)</h3>
      </div>

      <div className="relative h-20 sm:h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
        {/* Hour grid lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${pct(h)}%` }}
          />
        ))}

        {/* Current time marker */}
        {currentTime >= HOUR_START && currentTime <= HOUR_END && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
            style={{ left: `${pct(currentTime)}%` }}
          >
            <span className="absolute -top-0 -translate-x-1/2 text-[10px] font-medium text-orange-600 whitespace-nowrap bg-white px-1 rounded">
              Now
            </span>
          </div>
        )}

        {/* Existing bookings */}
        {bookings.map((b) => {
          const left = Math.max(pct(b.start), 0);
          const right = Math.min(pct(b.end), 100);
          const width = right - left;
          if (width <= 0) return null;
          return (
            <div
              key={b.id}
              className="absolute top-1.5 bottom-1.5 rounded bg-sky-200 border border-sky-300 px-1 overflow-hidden flex items-center z-[1]"
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.title} (${minutesToLabel(b.start)}–${minutesToLabel(b.end)})`}
            >
              <span className="text-[10px] font-medium text-sky-800 truncate">{b.title}</span>
            </div>
          );
        })}

        {/* Candidate interval */}
        {candidate && candidate.start < candidate.end && (
          (() => {
            const left = Math.max(pct(candidate.start), 0);
            const right = Math.min(pct(candidate.end), 100);
            const width = right - left;
            if (width <= 0) return null;
            return (
              <div
                className="absolute top-0.5 bottom-0.5 rounded border-2 border-dashed border-emerald-500 bg-emerald-100/50 z-[2] flex items-center justify-center"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span className="text-[10px] font-semibold text-emerald-700 truncate px-1">Your request</span>
              </div>
            );
          })()
        )}
      </div>

      {/* Hour labels */}
      <div className="relative mt-1 h-5">
        {hours.map((h) => (
          <span
            key={h}
            className={`absolute -translate-x-1/2 text-[10px] text-slate-400 ${(h - HOUR_START) % 120 !== 0 ? 'hidden sm:block' : ''}`}
            style={{ left: `${pct(h)}%` }}
          >
            {minutesToLabel(h).replace(':00', '')}
          </span>
        ))}
      </div>
    </div>
  );
}
