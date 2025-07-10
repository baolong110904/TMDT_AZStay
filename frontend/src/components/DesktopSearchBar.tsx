"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRangePicker } from 'react-date-range';
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

interface DesktopSearchBarProps {
  showSearchBar: boolean;
}

export default function DesktopSearchBar({ showSearchBar }: DesktopSearchBarProps) {
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isWhereOpen, setIsWhereOpen] = useState(false);
  const [isWhoOpen, setIsWhoOpen] = useState(false);
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({ adults: 0, children: 0, infants: 0, pets: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const whereRef = useRef<HTMLDivElement>(null);
  const whoRef = useRef<HTMLDivElement>(null);

  const handleSelect = (ranges: any) => {
    setDateRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: 'selection',
    });
  };

  const confirmDateSelection = () => {
    setShowCalendar(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) setShowCalendar(false);
      if (whereRef.current && !whereRef.current.contains(target)) setIsWhereOpen(false);
      if (whoRef.current && !whoRef.current.contains(target)) setIsWhoOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`hidden md:flex justify-center px-4 py-5 transition-all duration-500 ease-in-out transform ${
        showSearchBar ? 'opacity-100 translate-y-0 max-h-24' : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden'
      }`}
    >
      <div className="flex items-center bg-white border border-gray-300/50 rounded-full shadow-[0_8px_20px_rgba(59,130,246,0.3)] p-0.5 max-w-3xl w-full relative">
        <div
          ref={whereRef}
          className="flex-2 px-3 py-1 cursor-pointer hover:bg-gray-100 rounded-full"
          onClick={() => {
            setIsWhereOpen(!isWhereOpen);
            setShowCalendar(false);
            setIsWhoOpen(false);
          }}
        >
          <p className="text-xs font-medium text-gray-700">Where</p>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            placeholder="Search destinations"
            className="bg-transparent placeholder-gray-500 outline-none w-full text-sm text-gray-800"
            aria-label="Search destinations"
          />
          {isWhereOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-lg p-4 w-80 z-50">
              <p className="font-semibold text-gray-700 mb-2">Suggested destinations</p>
              <ul className="space-y-1 text-sm text-gray-700">
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
            </div>
          )}
        </div>
        <div
          className="flex-2 flex divide-x-2 divide-gray-300/50 border-x border-gray-300/50"
          onClick={() => {
            setShowCalendar(!showCalendar);
            setIsWhereOpen(false);
            setIsWhoOpen(false);
          }}
        >
          <div className="flex-1 px-4 py-2 cursor-pointer hover:bg-gray-100">
            <p className="text-xs font-medium text-gray-700">Check in</p>
            <p className="text-sm text-gray-800">{dateRange.startDate.toLocaleDateString()}</p>
          </div>
          <div className="flex-1 px-4 py-2 cursor-pointer hover:bg-gray-100">
            <p className="text-xs font-medium text-gray-700">Check out</p>
            <p className="text-sm text-gray-800">{dateRange.endDate.toLocaleDateString()}</p>
          </div>
        </div>
        <div
          ref={whoRef}
          className="flex-1 px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-full"
          onClick={() => {
            setIsWhoOpen(!isWhoOpen);
            setIsWhereOpen(false);
            setShowCalendar(false);
          }}
        >
          <p className="text-xs font-medium text-gray-700">Who</p>
          <p className="text-sm text-gray-800 truncate">
            {Object.values(guestCounts).reduce((a, b) => a + b, 0) > 0
              ? `${Object.values(guestCounts).reduce((a, b) => a + b, 0)} guests`
              : 'Add guests'}
          </p>
          {isWhoOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg p-4 w-80 z-50">
              <GuestCounter label="Adults" desc="Ages 13 or above" countKey="adults" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
              <GuestCounter label="Children" desc="Ages 2–12" countKey="children" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
              <GuestCounter label="Infants" desc="Under 2" countKey="infants" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
              <GuestCounter label="Pets" desc="Bringing a service animal?" countKey="pets" guestCounts={guestCounts} setGuestCounts={setGuestCounts} />
              <button
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-full font-medium hover:bg-blue-600 transition"
                onClick={() => setIsWhoOpen(false)}
              >
                Confirm
              </button>
            </div>
          )}
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full ml-2 transition">
          <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {showCalendar && (
        <div ref={calendarRef} className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-lg p-4">
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
  );
}