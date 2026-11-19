import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface ResultPanelProps {
  result: { available: boolean; reason: string } | null;
}

export function ResultPanel({ result }: ResultPanelProps) {
  if (!result) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-3">
        <Info size={20} className="text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-600">Check Availability</p>
          <p className="mt-1 text-xs text-slate-500">
            Select a room and time range, then click "Check Availability" to see if it's free.
          </p>
        </div>
      </div>
    );
  }

  if (result.available) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3 animate-in fade-in duration-300">
        <CheckCircle2 size={22} className="text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-800">Available</p>
          <p className="mt-1 text-xs text-emerald-700">{result.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3 animate-in fade-in duration-300">
      <XCircle size={22} className="text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold text-red-800">Unavailable</p>
        <p className="mt-1 text-xs text-red-700">{result.reason}</p>
      </div>
    </div>
  );
}
