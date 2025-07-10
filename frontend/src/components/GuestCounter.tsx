"use client";

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestCounterProps {
  label: string;
  desc: string;
  countKey: keyof GuestCounts;
  guestCounts: GuestCounts;
  setGuestCounts: React.Dispatch<React.SetStateAction<GuestCounts>>;
}

export default function GuestCounter({ label, desc, countKey, guestCounts, setGuestCounts }: GuestCounterProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            setGuestCounts((prev) => ({ ...prev, [countKey]: Math.max(prev[countKey] - 1, 0) }));
          }}
          disabled={guestCounts[countKey] === 0}
          aria-label={`Decrease ${label} count`}
        >
          –
        </button>
        <span className="w-6 text-center">{guestCounts[countKey]}</span>
        <button
          className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setGuestCounts((prev) => ({ ...prev, [countKey]: prev[countKey] + 1 }));
          }}
          aria-label={`Increase ${label} count`}
        >
          +
        </button>
      </div>
    </div>
  );
}