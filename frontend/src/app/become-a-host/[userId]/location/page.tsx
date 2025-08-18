"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useHostFlow } from "@/components/HostFlowProvider";
import MapDisplay from "@/components/Room/MapDisplay";

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: any;
}

export default function LocationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const propertyId = searchParams?.get("property_id");

  const totalSteps = 7;
  const currentStep = 3; // about -> structure -> location

  const [query, setQuery] = useState("Hà Nội, Việt Nam");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: map+search, 2: address form
  const [showOptions, setShowOptions] = useState(false);

  const [address, setAddress] = useState<string>("Hà Nội, Việt Nam");
  const [ward, setWard] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>("Viet Nam");
  const [latitude, setLatitude] = useState<number>(21.028333);
  const [longitude, setLongitude] = useState<number>(105.854041);

  // debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (!query) return setSuggestions([]);
      setLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=6`
      )
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data || []);
        })
        .catch((e) => {
          console.error("OSM search error", e);
          setSuggestions([]);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const selectSuggestion = (s: Suggestion) => {
    setAddress(s.display_name);
    setLatitude(parseFloat(s.lat));
    setLongitude(parseFloat(s.lon));

    // fill ward/province/country when available
    const a = s.address || {};
    setWard((a.suburb && String(a.suburb)) || (a.quarter && String(a.quarter)) || null);
    setProvince((a.state && String(a.state)) || (a.county && String(a.county)) || null);
    setCountry((a.country && String(a.country)) || null);
    setSuggestions([]);
    // advance to form step after picking a place
    setStep(2);
  };

  const handleUseMyLocation = () => {
    if (!navigator?.geolocation) {
      alert("Geolocation is not available in your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`
          );
          const data = await res.json();
          if (data) {
            setAddress(data.display_name || `${lat}, ${lon}`);
            const a = data.address || {};
            console.log(a);
            setWard((a.suburb && String(a.suburb)) || (a.quarter && String(a.quarter)) || null);
            setProvince((a.state && String(a.state)) || (a.county && String(a.county)) || (a.city && String(a.city)) || null);
            setCountry((a.country && String(a.country)) || null);
          }
        } catch (e) {
          console.error('reverse geocode failed', e);
        } finally {
          setLoading(false);
          setStep(2);
        }
      },
      (err) => {
        console.error('geolocation error', err);
        alert('Unable to get your location');
        setLoading(false);
      }
    );
  };

  const handleSave = useCallback(async () => {
    try {
      if (!propertyId) {
        alert("No property_id provided in query. The location will not be saved to backend.");
        return;
      }

      const token = localStorage.getItem("token");
      await api.patch(
        `/properties/${propertyId}`,
        {
          address,
          ward,
          province,
          country,
          longitude: String(longitude),
          latitude: String(latitude),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      alert("Location saved");
      // advance to next step if needed (preserve property_id if present)
      if (propertyId) {
        router.push(`/become-a-host/${userId}/floor-plan?property_id=${encodeURIComponent(String(propertyId))}`);
      } else {
        router.push(`/become-a-host/${userId}/floor-plan`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save location");
    }
  }, [propertyId, address, ward, province, country, longitude, latitude, router, userId]);

  const { setCanProceed, setNav } = useHostFlow();
  const { setOnNext } = useHostFlow() as any;

  useEffect(() => {
  setNav({ next: `/become-a-host/${userId}/floor-plan`, prev: `/become-a-host/${userId}/structure`, currentStep, totalSteps });
      // Only allow proceeding when all address fields are filled.
      const allFilled = Boolean(
        address && address.toString().trim() !== "" &&
        ward && ward.toString().trim() !== "" &&
        province && province.toString().trim() !== "" &&
        country && country.toString().trim() !== ""
      );
      setCanProceed(allFilled);
      // register onNext so layout's Next button triggers saving from this page
      setOnNext(() => handleSave);
      return () => {
        setCanProceed(false);
        setOnNext(null);
      };
    }, [address, ward, province, country, userId, setCanProceed, setNav, setOnNext, handleSave]);

  return (
    <div className="max-w-4xl mx-auto py-8">
  <h1 className="text-3xl font-bold mb-2">Where is your place located?</h1>
  <h2 className="text-gray-500 mb-4">Your address is only shared with guests after they have made a reservation.</h2>

      {/* Step 1: Map + Search */}
      {step === 1 && (
        <div className="relative mb-6">
          {/* centered pill */}
          <div className="absolute z-30 left-1/2 transform -translate-x-1/2 top-6 w-11/12 md:w-3/4">
              <div className="relative">
                <div className="bg-white rounded-full shadow-2xl ring-1 ring-gray-100 px-4 py-3 flex items-center gap-3">
                {/* location icon */}
                <div className="flex items-center justify-center w-9 h-9 bg-gray-50 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                    <path fillRule="evenodd" d="M12 2a6 6 0 00-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 00-6-6zm0 8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" clipRule="evenodd" />
                  </svg>
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm md:text-base"
                  placeholder="Enter your address"
                    onFocus={() => setShowOptions(true)}
                />
                  <button onClick={() => setShowOptions((s) => !s)} aria-expanded={showOptions} className="ml-2 text-sm text-gray-600">▾</button>
              </div>

                {/* options dropdown (use my location / enter manually) */}
                {showOptions && (
                  <div className="absolute left-0 right-0 mt-3 bg-white rounded-xl shadow-lg ring-1 ring-gray-100">
                    {loading ? (
                      <div className="p-4 flex items-center justify-center">
                        <div className="flex items-end gap-2 h-6">
                          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s', animationFillMode: 'both' }} />
                          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.12s', animationFillMode: 'both' }} />
                          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.24s', animationFillMode: 'both' }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50"
                          onClick={() => {
                            setShowOptions(false);
                            handleUseMyLocation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                          </svg>
                          <span>Use my current location</span>
                        </button>
                        <button
                          className="w-full text-left p-4 flex items-center gap-3 border-t hover:bg-gray-50"
                          onClick={() => {
                            setShowOptions(false);
                            // explicitly go to manual entry view without reverse geocoding
                            setStep(2);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5L7 13v3h3l9.5-9.5" />
                          </svg>
                          <span>Enter address manually</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* suggestions dropdown (search results) */}
                {loading && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="flex items-end gap-2 h-6">
                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationFillMode: 'both' }} />
                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.12s', animationFillMode: 'both' }} />
                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.24s', animationFillMode: 'both' }} />
                    </div>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 mt-3 bg-white rounded-xl shadow-lg max-h-56 overflow-auto ring-1 ring-gray-100">
                    {suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        onClick={() => {
                          setShowOptions(false);
                          selectSuggestion(s);
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>

          <div className="mt-10">
            <div className="h-[520px] rounded-2xl overflow-hidden">
              <MapDisplay latitude={latitude} longitude={longitude} address={address} hideHeader />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Address form */}
      {step === 2 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border-[0.5px] border-gray-400 rounded px-3 py-2" />

              <label className="block text-sm font-medium mt-3 mb-1">Ward</label>
              <input value={ward ?? ""} onChange={(e) => setWard(e.target.value)} className="w-full border-[0.5px] border-gray-400 rounded px-3 py-2" />

              <label className="block text-sm font-medium mt-3 mb-1">Province / State</label>
              <input value={province ?? ""} onChange={(e) => setProvince(e.target.value)} className="w-full border-[0.5px] border-gray-400 rounded px-3 py-2" />

              <label className="block text-sm font-medium mt-3 mb-1">Country</label>
              <input value={country ?? ""} onChange={(e) => setCountry(e.target.value)} className="w-full border-[0.5px] border-gray-400 rounded px-3 py-2" />

              <div className="mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Back to map
                </button>
              </div>
            </div>

            <div>
              <div className="h-full rounded overflow-hidden">
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Your specific location:</h3>
                  <p className="text-sm text-gray-700 mb-1">{address}</p>
                </div>
                <MapDisplay latitude={latitude} longitude={longitude} address={address} hideHeader />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}