import { Clock } from 'lucide-react';
import { MINUTES_PER_DAY, minutesToLabel } from '@/utils';

interface TimeSelectorProps {
  startLabel: string;
  endLabel: string;
  onStartChange: (label: string) => void;
  onEndChange: (label: string) => void;
}

const STEP = 30; // 30-minute increments

export function buildTimeOptions(): string[] {
  const options: string[] = [];
  for (let m = 0; m <= MINUTES_PER_DAY; m += STEP) {
    options.push(minutesToLabel(m));
  }
  return options;
}

export function TimeSelector({ startLabel, endLabel, onStartChange, onEndChange }: TimeSelectorProps) {
  const options = buildTimeOptions();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Clock size={14} /> Start Time
        </label>
        <select
          value={startLabel}
          onChange={(e) => onStartChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-colors"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Clock size={14} /> End Time
        </label>
        <select
          value={endLabel}
          onChange={(e) => onEndChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-colors"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
