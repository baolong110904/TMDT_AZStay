"use client";

import { useState, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRangePicker } from 'react-date-range';
import { RangeKeyDict } from 'react-date-range'; // 
import GuestCounter from "./GuestCounter";

interface DateRange {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface MobileSearchDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}


export default function MobileSearchDrawer({ isOpen, setIsOpen }: MobileSearchDrawerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isWhereOpen, setIsWhereOpen] = useState(false);
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({ adults: 0, children: 0, infants: 0, pets: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleSelect = (ranges: RangeKeyDict) => {
    setDateRange({
      startDate: ranges.selection.startDate ?? new Date(),
      endDate: ranges.selection.endDate ?? new Date(),
      key: 'selection',
    });
  };

  const confirmDateSelection = () => {
    setShowCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 bg-white z-50 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setIsOpen(false)}
          aria-label="Close search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold">Search</h2>
        <div className="w-6" />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto">
        <div className="border rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-2">Where</p>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            placeholder="Search destinations"
            className="w-full bg-transparent placeholder-gray-500 outline-none text-lg"
            aria-label="Search destinations"
          />
          {isWhereOpen && (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {[
                'Nearby',
                'Bangkok, Thailand',
                'Hanoi, Vietnam',
                'Paris, France',
                'Melbourne, Australia',
                'Vũng Tàu, Vietnam',
                'Dalat, Vietnam',
              ].map((loc) => (
                <li
                  key={loc}
                  className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchInput(loc);
                    setIsWhereOpen(false);
                  }}
                >
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-2">Check in</p>
          <p
            onClick={() => setShowCalendar(true)}
            className="text-lg text-gray-800 cursor-pointer"
          >
            {dateRange.startDate.toLocaleDateString()}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-2">Check out</p>
          <p
            onClick={() => setShowCalendar(true)}
            className="text-lg text-gray-800 cursor-pointer"
          >
            {dateRange.endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-semibold text-gray-800 mb-2">Who</p>
          <GuestCounter label="Adults" desc="Ages 13 or above" countKey="adults" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
          <GuestCounter label="Children" desc="Ages 2–12" countKey="children" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
          <GuestCounter label="Infants" desc="Under 2" countKey="infants" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
          <GuestCounter label="Pets" desc="Bringing a service animal?" countKey="pets" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
        </div>
        {showCalendar && (
          <div ref={calendarRef} className="border rounded-lg p-4">
            <DateRangePicker
              ranges={[dateRange]}
              minDate={new Date()}
              rangeColors={["#3B82F6"]}
              onChange={handleSelect}
            />
            <button
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-full font-medium hover:bg-blue-600 transition"
              onClick={confirmDateSelection}
            >
              Confirm Dates
            </button>
          </div>
        )}
      </div>
      <button className="w-full bg-blue-500 text-white py-3 rounded-full font-medium hover:bg-blue-600 transition flex items-center justify-center mt-4">
        <MagnifyingGlassIcon className="h-5 w-5 mr-2" aria-hidden="true" />
        Search
      </button>
    </div>
  );
}