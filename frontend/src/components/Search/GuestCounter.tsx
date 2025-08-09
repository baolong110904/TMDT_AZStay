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

export default function GuestCounter({
  label,
  desc,
  countKey,
  guestCounts,
  setGuestCounts,
}: GuestCounterProps) {
  const handleChange = (amount: number) => {
    setGuestCounts((prev) => {
      const updated = { ...prev, [countKey]: Math.max(prev[countKey] + amount, 0) };
      localStorage.setItem("guestCounts", JSON.stringify(updated));
      return updated;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), 0);
    const updated = { ...guestCounts, [countKey]: value };
    setGuestCounts(updated);
    localStorage.setItem("guestCounts", JSON.stringify(updated));
  };

  return (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => handleChange(-1)}
          disabled={guestCounts[countKey] === 0}
          aria-label={`Decrease ${label} count`}
        >
          –
        </button>
        <input
          type="number"
          min={0}
          value={guestCounts[countKey]}
          onChange={handleInputChange}
          className="w-12 text-center border rounded-md"
        />
        <button
          className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:bg-gray-100"
          onClick={() => handleChange(1)}
          aria-label={`Increase ${label} count`}
        >
        
        </button>
      </div>
    </div>
  );
}
