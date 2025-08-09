// // pages/api/search.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import Footer from "@/components/Footer";
// import Header from "@/components/Header";

// export interface GeoNamesPlace {
//   name: string;
//   countryName: string;
//   adminName1?: string;
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { query } = req.query;

//   if (!query || typeof query !== "string") {
//     return res.status(400).json({ error: "Query parameter is required" });
//   }

//   const username = process.env.GEONAMES_USER;

//   if (!username) {
//     return res.status(500).json({ error: "GeoNames username not set in environment variables" });
//   }

//   try {
//     const geoRes = await fetch(
//       `https://secure.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(
//         query
//       )}&maxRows=5&username=${username}`
//     );

//     const data = await geoRes.json();

//     if (!data?.geonames) return res.status(200).json([]);

//     const results = data.geonames.map((place: GeoNamesPlace) => {
//       const parts = [place.name, place.adminName1, place.countryName].filter(Boolean);
//       return parts.join(", ");
//     });

//     return res.status(200).json(results);
//   } catch (err) {
//     console.error("GeoNames API error:", err);
//     return res.status(500).json({ error: "Failed to fetch data from GeoNames" });
//   }
// }
