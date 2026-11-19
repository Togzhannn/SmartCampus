import { useMemo, useState } from 'react';
import { Building2, Clock, Search, RotateCcw } from 'lucide-react';
import { ROOMS, INITIAL_BOOKINGS } from '@/data';
import { minutesToLabel, labelToMinutes, validateInterval, MAX_BOOKING_MINUTES } from '@/utils';
import { RoomSelector } from '@/components/RoomSelector';
import { TimeSelector } from '@/components/TimeSelector';
import { Timeline } from '@/components/Timeline';
import { ResultPanel } from '@/components/ResultPanel';

function App() {
  // "Current time" — fictional, set to 10:00 AM for the prototype
  const currentTime = 600;

  const [bookings] = useState(INITIAL_BOOKINGS);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startLabel, setStartLabel] = useState('11:00 AM');
  const [endLabel, setEndLabel] = useState('12:00 PM');
  const [result, setResult] = useState<{ available: boolean; reason: string } | null>(null);

  const selectedRoom = useMemo(
    () => ROOMS.find((r) => r.id === selectedRoomId),
    [selectedRoomId],
  );

  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === selectedRoomId),
    [bookings, selectedRoomId],
  );

  function handleCheck() {
    const start = labelToMinutes(startLabel);
    const end = labelToMinutes(endLabel);
    const validation = validateInterval(
      { start, end },
      currentTime,
      selectedRoom,
      bookings,
    );

    if (!validation.valid) {
      setResult({ available: false, reason: validation.reason! });
      return;
    }

    setResult({
      available: true,
      reason: `${selectedRoom!.name} is available from ${minutesToLabel(start)} to ${minutesToLabel(end)} (${end - start} min). No conflicts with existing bookings.`,
    });
  }

  function handleReset() {
    setResult(null);
    setSelectedRoomId('');
    setStartLabel('11:00 AM');
    setEndLabel('12:00 PM');
  }

  const startMin = labelToMinutes(startLabel);
  const endMin = labelToMinutes(endLabel);
  const candidate = selectedRoom && startMin >= 0 && endMin > startMin
    ? { start: startMin, end: endMin }
    : null;

  const duration = endMin > startMin ? endMin - startMin : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500 text-white shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                Smart Campus Room Availability Checker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Find an open room and check if your time slot is free.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Current time banner */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <Clock size={16} className="text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800">
            Current time: <strong>{minutesToLabel(currentTime)}</strong> — booking start must be after this time.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <RoomSelector rooms={ROOMS} selectedRoomId={selectedRoomId} onSelect={setSelectedRoomId} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Select Time Range</h2>
              <TimeSelector
                startLabel={startLabel}
                endLabel={endLabel}
                onStartChange={setStartLabel}
                onEndChange={setEndLabel}
              />
              {duration > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Duration: <strong className="text-slate-700">{duration} minutes</strong>
                  {duration > MAX_BOOKING_MINUTES && <span className="text-red-600 font-medium"> — exceeds the 120-minute limit</span>}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheck}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 active:scale-[0.98]"
              >
                <Search size={18} /> Check Availability
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-[0.98]"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>

            {/* Result */}
            <ResultPanel result={result} />
          </div>

          {/* Right: Timeline + booking list */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              {selectedRoom ? (
                <Timeline
                  bookings={roomBookings}
                  candidate={candidate}
                  currentTime={currentTime}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Select a room to view its schedule.</p>
                </div>
              )}
            </div>

            {selectedRoom && roomBookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Existing Bookings</h3>
                <ul className="space-y-2">
                  {roomBookings
                    .sort((a, b) => a.start - b.start)
                    .map((b) => (
                      <li key={b.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3 rounded-lg bg-slate-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{b.title}</p>
                          <p className="text-xs text-slate-400 truncate">{b.bookedBy}</p>
                        </div>
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap sm:text-right">
                          {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Fictional sample data — no real bookings are modified. For demonstration only.
        </footer>
      </main>
    </div>
  );
}

export default App;
