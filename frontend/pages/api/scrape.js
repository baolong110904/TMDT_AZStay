// const puppeteer = require('puppeteer');
// const fetch = require('node-fetch');

// const GEONAMES_USER = process.env.GEONAMES_USER;

// export default async function handler(req, res) {
//   const { lat, lng, checkin, checkout, guests = '1' } = req.query;
//   let browser;

//   if (!lat || !lng) {
//     return res.status(400).json({ error: 'Missing latitude or longitude' });
//   }

//   if (!GEONAMES_USER) {
//     return res.status(500).json({ error: 'Missing GEONAMES_USER env variable' });
//   }

//   try {
//     // 🔁 Reverse geocode to get location name
//     const cityUrl = `http://api.geonames.org/citiesJSON?north=${parseFloat(lat) + 1}&south=${parseFloat(lat) - 1}&east=${parseFloat(lng) + 1}&west=${parseFloat(lng) - 1}&minPopulation=100000&username=${GEONAMES_USER}`;
//     const cityRes = await fetch(cityUrl);
//     const cityData = await cityRes.json();
//     const cities = cityData.geonames || [];
//     const location = cities.length ? cities[0].name : 'Ho Chi Minh City';

//     console.log('Resolved location:', location);

//     browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
//     const page = await browser.newPage();

//     await page.setGeolocation({ latitude: parseFloat(lat), longitude: parseFloat(lng) });
//     await page.setExtraHTTPHeaders({
//       'Accept-Language': 'en-US,en;q=0.9',
//       'X-Forwarded-For': '113.160.0.0',
//     });

//     const url = `https://www.airbnb.com/s/${encodeURIComponent(location)}/homes?checkin=${checkin}&checkout=${checkout}&adults=${guests}&refinement_paths%5B%5D=%2Fhomes`;
//     console.log('Scraping URL:', url);
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Auto-scroll
//     await page.evaluate(async () => {
//       const distance = 1000;
//       const delay = 500;
//       let previousHeight = 0;
//       let scrollAttempts = 0;
//       const maxAttempts = 5;
//       while (document.body.scrollHeight > previousHeight && scrollAttempts < maxAttempts) {
//         previousHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         await new Promise(r => setTimeout(r, delay));
//         if (previousHeight === document.body.scrollHeight) scrollAttempts++;
//         else scrollAttempts = 0;
//       }
//     });

//     await page.waitForSelector('[itemprop="itemListElement"], div[data-testid="card-container"]', { timeout: 20000 }).catch(() => {
//       console.log('Timeout waiting for listings, proceeding anyway');
//     });

//     const listings = await page.evaluate((searchLocation) => {
//       const cards = Array.from(document.querySelectorAll('[itemprop="itemListElement"], div[data-testid="card-container"]'));
//       if (!cards.length) return [];

//       return cards.map(card => {
//         const imgEl = card.querySelector('img');
//         const titleEl = card.querySelector('[data-testid="listing-card-title"], h3');
//         const priceEl = card.querySelector('[data-testid="price-whole"]') || card.querySelector('div._1jo4hgw span._olc9rf0');
//         const ratingEl = card.querySelector('[aria-label*="Rating"], span[aria-hidden]');
//         const reviewsText = Array.from(card.querySelectorAll('span'))
//           .map(el => el.innerText)
//           .find(t => /\d+\s*reviews?/.test(t));
//         const linkEl = card.querySelector('a');
//         const locationHint = card.querySelector('span[data-testid="listing-location"]')?.innerText || '';

//         return {
//           url: linkEl?.href && (linkEl.href.startsWith('http') ? linkEl.href : `https://www.airbnb.com${linkEl.getAttribute('href')}`) || null,
//           title: titleEl?.innerText.trim() || null,
//           image: imgEl?.src || null,
//           price: priceEl?.innerText.trim().replace(/[^\d.]/g, '') || null,
//           rating: ratingEl?.innerText.trim().match(/\d+\.?\d*/)?.[0] || null,
//           reviews: reviewsText?.match(/\d+/)?.[0] || null,
//           locationHint,
//         };
//       }).filter(listing => listing.url && (listing.locationHint?.toLowerCase().includes(searchLocation.toLowerCase()) || !listing.locationHint));
//     }, location.toLowerCase());

//     const uniqueListings = [...new Map(listings.map(item => [item.url, item])).values()];
//     console.log('Scraped Listings:', uniqueListings.map(l => ({ title: l.title, locationHint: l.locationHint })));

//     res.status(200).json({ listings: uniqueListings });
//   } catch (error) {
//     console.error('Scraping error:', error);
//     res.status(500).json({ error: 'Failed to scrape listings' });
//   } finally {
//     if (browser) await browser.close();
//   }
// }
