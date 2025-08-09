// import type { NextApiRequest, NextApiResponse } from 'next';
// import { calculateDistance } from '@/utils/distance';

// const GEONAMES_USER = process.env.GEONAMES_USER;

// interface GeoCity {
//   name: string;
//   lat: number;
//   lng: number;
//   distance: number;
//   [key: string]: any; // other GeoNames fields
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { lat, lng, radius = '20' } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ error: 'Missing lat or lng' });
//   }

//   if (!GEONAMES_USER) {
//     return res.status(500).json({ error: 'Missing GEONAMES_USER env variable' });
//   }

//   try {
//     const latNum = parseFloat(lat as string);
//     const lngNum = parseFloat(lng as string);
//     const R = 6371;
//     const d = parseFloat(radius as string);

//     // 1. Bounding box
//     const latDelta = (d / R) * (180 / Math.PI);
//     const lonDelta = (d / R) * (180 / Math.PI) / Math.cos((latNum * Math.PI) / 180);
//     const north = latNum + latDelta;
//     const south = latNum - latDelta;
//     const east = lngNum + lonDelta;
//     const west = lngNum - lonDelta;

//     // 2. Fetch nearby cities
//     const nearbyUrl = `http://api.geonames.org/citiesJSON?north=${north}&south=${south}&east=${east}&west=${west}&minPopulation=100000&username=${GEONAMES_USER}`;
//     const nearbyRes = await fetch(nearbyUrl);
//     if (!nearbyRes.ok) throw new Error(`GeoNames nearby cities error ${nearbyRes.status}`);
//     const nearbyData = await nearbyRes.json();
//     const cities = nearbyData.geonames || [];

//     if (!cities.length) throw new Error('No nearby cities found');

//     // 3. Map with distances
//     const withDistance: GeoCity[] = cities.map((city: any) => ({
//       ...city,
//       distance: calculateDistance(latNum, lngNum, parseFloat(city.lat), parseFloat(city.lng)),
//     }));

//     // 4. Sort by distance (typed)
//     const sorted = withDistance.sort((a: GeoCity, b: GeoCity) => a.distance - b.distance);

//     // 5. Nearest city
//     const city = sorted[0].name;

//     res.status(200).json({
//       city,
//       nearby: sorted,
//     });
//   } catch (err: any) {
//     console.error('Location API error:', err);
//     res.status(200).json({ city: 'Ho Chi Minh City', nearby: [] });
//   }
// }
