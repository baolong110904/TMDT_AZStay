import axios from 'axios';

export async function geocodeAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'YourAppName/1.0 (your@email.com)'
    }
  });

  if (!res.data || res.data.length === 0) {
    throw new Error('No results found for the given address');
  }

  const { lat, lon } = res.data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}
