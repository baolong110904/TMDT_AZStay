"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DateRangePicker } from "react-date-range";
import { RangeKeyDict } from 'react-date-range';
import GuestCounter from "./GuestCounter";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
  placeholder?: string;
}

export default function DesktopSearchBar({ showSearchBar, placeholder }: DesktopSearchBarProps) {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [isWhereOpen, setIsWhereOpen] = useState(false);
  const [isWhoOpen, setIsWhoOpen] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const whereRef = useRef<HTMLDivElement>(null);
  const whoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (calendarRef.current && !calendarRef.current.contains(target)) setShowCalendar(false);
      if (whereRef.current && !whereRef.current.contains(target)) setIsWhereOpen(false);
      if (whoRef.current && !whoRef.current.contains(target)) setIsWhoOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      if (searchInput.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const q = encodeURIComponent(searchInput.trim());
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&addressdetails=1&limit=6`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`OSM search failed: ${res.status}`);
        const data = await res.json();
        const names = (data || []).map((d: any) => d.display_name).filter(Boolean);
        setSuggestions(names);
      } catch (error: any) {
        if (error.name === 'AbortError') return; // expected when cancelled
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300);
    return () => {
      clearTimeout(debounce);
      try { controller.abort(); } catch (_) {}
    };
  }, [searchInput]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selectedRange = ranges.selection;
    if (!selectedRange.startDate || !selectedRange.endDate) return;
    
    setDateRange({
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate,
      key: "selection",
    });
  };


  const totalGuests = Object.values(guestCounts).reduce((a, b) => a + b, 0);

  const handleSearch = () => {
    const location = searchInput.trim() === "" ? "Nearby" : searchInput;
    // Encode city for URL, keep spaces as %20
    const citySlug = encodeURIComponent(location.trim());
    const query = new URLSearchParams({
      checkin: dateRange.startDate.toISOString(),
      checkout: dateRange.endDate.toISOString(),
      guests: totalGuests.toString(),
    }).toString();
    router.push(`/search/${citySlug}?${query}`);
  };

  return (
    <div
      className={`hidden md:flex justify-center px-4 py-5 transition-all duration-500 ease-in-out transform ${showSearchBar ? "opacity-100 translate-y-0 max-h-24" : "opacity-0 -translate-y-4 max-h-0 overflow-hidden"
        }`}
    >
      <div className="flex items-center bg-white border border-gray-300/50 rounded-full shadow-[0_8px_20px_rgba(59,130,246,0.3)] p-0.5 max-w-3xl w-full relative">
        {/* WHERE SECTION */}
        <div
          ref={whereRef}
          className="flex-2 px-3 py-1 cursor-pointer hover:bg-gray-100 rounded-full w-full"
          onClick={() => {
            setIsWhereOpen(!isWhereOpen);
            setShowCalendar(false);
            setIsWhoOpen(false);
            if (inputRef.current) inputRef.current.focus();
          }}
        >
          <p className="text-xs font-medium text-gray-700">Where</p>
          <input
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder={placeholder || "Search destinations"}
            className="bg-transparent placeholder-gray-500 outline-none w-full text-sm text-gray-800"
          />
          {isWhereOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-lg p-4 w-80 z-50">
              <p className="font-semibold text-gray-700 mb-2">Suggested destinations</p>
              <ul className="space-y-1 text-sm text-gray-700 max-h-60 overflow-y-auto">
                {(suggestions.length > 0
                  ? suggestions
                  : [
                    "Nearby",
                    "Bangkok, Thailand",
                    "Hanoi, Vietnam",
                    "Paris, France",
                    "Melbourne, Australia",
                    "Vũng Tàu, Vietnam",
                    "Dalat, Vietnam",
                  ]
                ).map((loc) => (
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

        {/* DATE PICKER SECTION */}
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

        {/* WHO SECTION */}
        <div
          ref={whoRef}
          className="flex-1 px-4 py-2 hover:bg-gray-100 rounded-full relative"
          onClick={(e) => {
            if (!(e.target as HTMLElement).closest(".who-popup")) {
              setIsWhoOpen(!isWhoOpen);
              setIsWhereOpen(false);
              setShowCalendar(false);
            }
          }}
        >
          <p className="text-xs font-medium text-gray-700">Who</p>
          <p className="text-sm text-gray-800 truncate">
            {totalGuests > 0 ? `${totalGuests} guests` : "Add guests"}
          </p>
          {isWhoOpen && (
            <div
              className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg p-4 w-80 z-50 who-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <GuestCounter
                label="Adults"
                desc="Ages 13 or above"
                countKey="adults"
                guestCounts={guestCounts}
                setGuestCounts={setGuestCounts}
              />
              <GuestCounter
                label="Children"
                desc="Ages 2–12"
                countKey="children"
                guestCounts={guestCounts}
                setGuestCounts={setGuestCounts}
              />
              <GuestCounter
                label="Infants"
                desc="Under 2"
                countKey="infants"
                guestCounts={guestCounts}
                setGuestCounts={setGuestCounts}
              />
              <GuestCounter
                label="Pets"
                desc="Bringing a service animal?"
                countKey="pets"
                guestCounts={guestCounts}
                setGuestCounts={setGuestCounts}
              />
              <button
                className="w-full mt-4 bg-blue-500 text-white py-2 rounded-full font-medium hover:bg-blue-600 transition"
                onClick={() => setIsWhoOpen(false)}
              >
                Confirm
              </button>
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full ml-2 transition"
          onClick={handleSearch}
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* CALENDAR PICKER */}
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
            onClick={() => setShowCalendar(false)}
          >
            Confirm Dates
          </button>
        </div>
      )}
    </div>
  );
}