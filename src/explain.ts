import type { ReasonCode } from '@/utils';

export interface ExplainInput {
  roomLabel: string;
  startLabel: string;
  endLabel: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export type ExplainAdapter = (input: ExplainInput) => Promise<unknown>;

export interface ExplainResult {
  explanation: string;
  source: 'mock' | 'ai' | 'fallback';
}

const MAX_EXPLANATION_LENGTH = 300;
const MAX_FIELD_LENGTH = 60;

const REASON_CODES: ReasonCode[] = [
  'AVAILABLE',
  'INVALID_INTERVAL',
  'PAST_START',
  'TOO_LONG',
  'NO_ROOM',
  'BLOCKED',
  'OVERLAP',
];

// Deterministic text: used as the safe fallback and as the mock explanation.
export function fallbackText(i: ExplainInput): string {
  const t = `${i.startLabel}–${i.endLabel}`;
  switch (i.reasonCode) {
    case 'AVAILABLE':
      return `${i.roomLabel} is free for ${t}.`;
    case 'OVERLAP':
      return `${i.roomLabel} is not available for ${t} because another booking overlaps this time.`;
    case 'BLOCKED':
      return `${i.roomLabel} is currently blocked and cannot be booked.`;
    case 'PAST_START':
      return 'The start time must be later than the current time.';
    case 'TOO_LONG':
      return 'Bookings can be at most 120 minutes long.';
    case 'INVALID_INTERVAL':
      return 'The selected time range is not valid. The start must be before the end.';
    default:
      return 'Please select a room and a time range.';
  }
}

// Input is untrusted: check types, length and consistency before using it.
export function validateExplainInput(x: unknown): ExplainInput | null {
  if (!x || typeof x !== 'object') return null;
  const i = x as Record<string, unknown>;
  const okStr = (v: unknown) =>
    typeof v === 'string' && v.trim().length > 0 && v.length <= MAX_FIELD_LENGTH;
  if (!okStr(i.roomLabel) || !okStr(i.startLabel) || !okStr(i.endLabel)) return null;
  if (typeof i.isAvailable !== 'boolean') return null;
  if (!REASON_CODES.includes(i.reasonCode as ReasonCode)) return null;
  // The status must agree with the reason code.
  if (i.isAvailable !== (i.reasonCode === 'AVAILABLE')) return null;
  return i as unknown as ExplainInput;
}

// Model output is untrusted too: validate shape, length, format and agreement with the status.
export function validateExplainOutput(x: unknown, input: ExplainInput): string | null {
  if (!x || typeof x !== 'object') return null;
  const e = (x as { explanation?: unknown }).explanation;
  if (typeof e !== 'string') return null;
  const text = e.trim();
  if (!text || text.length > MAX_EXPLANATION_LENGTH) return null;
  if ((text.match(/[.!?](\s|$)/g) ?? []).length > 2) return null; // at most 2 sentences
  if (/[<>]/.test(text)) return null; // no markup
  const sayingBusy = /\b(unavailable|not available|booked|blocked|overlap)/i.test(text);
  const sayingFree = /\b(is|are) (available|free)\b/i.test(text);
  if (input.isAvailable && sayingBusy) return null;
  if (!input.isAvailable && sayingFree) return null;
  return text;
}

// MOCK adapter: no network, builds the explanation from structured data only.
export const mockAdapter: ExplainAdapter = async (i) => ({
  explanation: fallbackText(i),
});

export async function explainAvailability(
  rawInput: unknown,
  adapter: ExplainAdapter = mockAdapter,
  timeoutMs = 5000,
): Promise<ExplainResult> {
  const input = validateExplainInput(rawInput);
  if (!input) throw new Error('Invalid explain input');

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    });
    const out = await Promise.race([adapter(input), timeout]);
    const text = validateExplainOutput(out, input);
    if (!text) return { explanation: fallbackText(input), source: 'fallback' };
    return { explanation: text, source: adapter === mockAdapter ? 'mock' : 'ai' };
  } catch {
    return { explanation: fallbackText(input), source: 'fallback' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}