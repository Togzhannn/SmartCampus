import { describe, it, expect, vi } from 'vitest';
import { explainAvailability, validateExplainOutput, fallbackText } from '@/explain';
import type { ExplainInput } from '@/explain';
import { MAX_BOOKING_MINUTES } from '@/utils';

const free: ExplainInput = {
  roomLabel: 'Curie Lab',
  startLabel: '11:00 AM',
  endLabel: '12:00 PM',
  isAvailable: true,
  reasonCode: 'AVAILABLE',
};
const busy: ExplainInput = { ...free, isAvailable: false, reasonCode: 'OVERLAP' };

describe('Explain availability (LLM feature, mock adapter)', () => {
  it('LLM-AC2: available result gets a matching explanation', async () => {
    const r = await explainAvailability(free);
    expect(r.explanation).toMatch(/free/i);
    expect(r.source).toBe('mock');
  });

  it('LLM-AC2: overlap result gets a "not available" explanation', async () => {
    const r = await explainAvailability(busy);
    expect(r.explanation).toMatch(/not available/i);
  });

  it('LLM-AC3: rejects empty room label', async () => {
    await expect(explainAvailability({ ...free, roomLabel: '' })).rejects.toThrow();
  });

  it('LLM-AC3: rejects overly long input', async () => {
    await expect(
      explainAvailability({ ...free, roomLabel: 'x'.repeat(500) }),
    ).rejects.toThrow();
  });

  it('LLM-AC3: rejects malformed input', async () => {
    await expect(explainAvailability({ foo: 'bar' })).rejects.toThrow();
    await expect(explainAvailability(null)).rejects.toThrow();
  });

  it('LLM-AC3: rejects status that disagrees with reason code', async () => {
    await expect(
      explainAvailability({ ...free, reasonCode: 'OVERLAP' }),
    ).rejects.toThrow();
  });

  it('LLM-AC4: adapter error gives safe fallback', async () => {
    const r = await explainAvailability(free, async () => {
      throw new Error('API down');
    });
    expect(r.source).toBe('fallback');
    expect(r.explanation).toMatch(/free/i);
  });

  it('LLM-AC4: timeout gives safe fallback', async () => {
    vi.useFakeTimers();
    const p = explainAvailability(free, () => new Promise(() => {}), 5000);
    await vi.advanceTimersByTimeAsync(5001);
    const r = await p;
    vi.useRealTimers();
    expect(r.source).toBe('fallback');
  });

  it('LLM-AC2: model output contradicting the status is replaced by fallback', async () => {
    const r = await explainAvailability(busy, async () => ({
      explanation: 'Great news, the room is available!',
    }));
    expect(r.source).toBe('fallback');
    expect(r.explanation).toMatch(/not available/i);
  });

  it('LLM-AC3: malformed or too long model output is rejected', () => {
    expect(validateExplainOutput({ explanation: 'One. Two. Three.' }, free)).toBeNull();
    expect(validateExplainOutput({ foo: 1 }, free)).toBeNull();
    expect(validateExplainOutput({ explanation: 'x'.repeat(301) }, free)).toBeNull();
    expect(validateExplainOutput({ explanation: '<b>free</b>' }, free)).toBeNull();
  });
});

describe('Review fixes (finding 1: contradiction check, finding 4: shared constant)', () => {
  it('F1a: correct explanation with a negated keyword is accepted (available result)', () => {
    expect(
      validateExplainOutput({ explanation: 'No overlapping bookings, so the room is free.' }, free),
    ).not.toBeNull();
  });

  it('F1b: advice containing "available" is accepted (unavailable result)', () => {
    expect(
      validateExplainOutput(
        { explanation: 'This slot is taken. Please choose a time when the room is available.' },
        busy,
      ),
    ).not.toBeNull();
  });

  it('F1c: contradicting explanation is rejected (unavailable result)', () => {
    expect(
      validateExplainOutput({ explanation: 'Athena 101 can be reserved at that time.' }, busy),
    ).toBeNull();
  });

  it('F1d: contradiction hidden in the verdict sentence is rejected', () => {
    expect(
      validateExplainOutput({ explanation: 'The room is available if you hurry.' }, busy),
    ).toBeNull();
  });

  it('F1e: negated "overlap" is accepted for an available result', () => {
    expect(
      validateExplainOutput(
        { explanation: 'The room is free and does not overlap any booking.' },
        free,
      ),
    ).not.toBeNull();
  });

  it('F1f: the application\'s own fallback texts pass output validation', () => {
    const codes = ['AVAILABLE', 'OVERLAP', 'BLOCKED', 'PAST_START', 'TOO_LONG', 'INVALID_INTERVAL', 'NO_ROOM'] as const;
    for (const code of codes) {
      const input: ExplainInput = { ...free, isAvailable: code === 'AVAILABLE', reasonCode: code };
      expect(validateExplainOutput({ explanation: fallbackText(input) }, input)).not.toBeNull();
    }
  });

  it('F4: fallback text uses the shared booking limit constant', () => {
    const input: ExplainInput = { ...free, isAvailable: false, reasonCode: 'TOO_LONG' };
    expect(fallbackText(input)).toContain(String(MAX_BOOKING_MINUTES));
  });

  it('R2 (known limitation, finding 2 not fixed): abbreviation counted as extra sentences', () => {
    expect(
      validateExplainOutput({ explanation: 'The slot starts at 1 p.m. and ends at 2 p.m. today.' }, free),
    ).toBeNull();
  });
});