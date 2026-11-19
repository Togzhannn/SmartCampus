import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { explainAvailability } from '@/explain';
import type { ExplainInput, ExplainResult } from '@/explain';

const SOURCE_LABEL: Record<ExplainResult['source'], string> = {
  mock: 'Mock (no real AI used)',
  ai: 'AI',
  fallback: 'Fallback template',
};

export function ExplainPanel({ input }: { input: ExplainInput }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    setLoading(true);
    setError(null);
    try {
      setData(await explainAvailability(input));
    } catch {
      setData(null);
      setError('Could not generate an explanation. The status above is still correct.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleExplain}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        Explain availability
      </button>

      {error && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {error}
        </p>
      )}

      {data && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-violet-800">
              AI-generated explanation — not a booking confirmation
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700 border border-violet-200">
              {SOURCE_LABEL[data.source]}
            </span>
          </div>
          <p className="text-sm text-slate-700">{data.explanation}</p>
        </div>
      )}
    </div>
  );
}