import axios from 'axios';

interface NominatimResult {
  lat: string;
  lon: string;
  [key: string]: any; // thêm nếu muốn linh hoạt hơn
}

export async function geocodeAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const res = await axios.get<NominatimResult[]>(url, {
    headers: {
      'User-Agent': 'AZStay/1.0 (2425.ec03.22httt1@gmail.com)'
    }
  });

  const results = res.data;

  if (!results || results.length === 0) {
    throw new Error('No results found for the given address');
  }

  const { lat, lon } = results[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}
