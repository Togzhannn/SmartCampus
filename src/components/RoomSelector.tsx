import { Lock, Users, MapPin } from 'lucide-react';
import type { Room } from '@/types';

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelect: (roomId: string) => void;
}

export function RoomSelector({ rooms, selectedRoomId, onSelect }: RoomSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-3">
        Select a Room
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => {
          const selected = room.id === selectedRoomId;
          return (
            <button
              key={room.id}
              onClick={() => onSelect(room.id)}
              disabled={room.blocked}
              className={[
                'text-left rounded-xl border p-4 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1',
                room.blocked
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                  : selected
                    ? 'border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-200'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{room.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> {room.building}
                  </p>
                </div>
                {room.blocked && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <Lock size={11} /> Blocked
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <Users size={12} /> Capacity: {room.capacity}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
