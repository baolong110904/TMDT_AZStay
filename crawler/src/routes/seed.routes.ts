import express from 'express';
import { manualSeedHandler } from '../controller/seed.controller';
import cron from 'node-cron';
import { seed } from '../crawlers/seed';

const router = express.Router();

// 📌 Manual trigger: POST /api/seed/manual { city: 'London' }
router.post('/seed/manual', manualSeedHandler);

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco',
  'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
  'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
  'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
  'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Mesa',
  'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Miami',
  'Raleigh', 'Omaha', 'Long Beach', 'Virginia Beach', 'Oakland',
  'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans',
  'London', 'Paris', 'Berlin', 'Madrid', 'Rome',
  'Vienna', 'Amsterdam', 'Brussels', 'Zurich', 'Prague',
  'Lisbon', 'Warsaw', 'Budapest', 'Copenhagen', 'Oslo',
  'Stockholm', 'Helsinki', 'Athens', 'Dublin', 'Reykjavik',
  'Tokyo', 'Seoul', 'Beijing', 'Shanghai', 'Bangkok',
  'Singapore', 'Kuala Lumpur', 'Jakarta', 'Manila', 'Taipei',
  'Hong Kong', 'Hanoi', 'Ho Chi Minh City', 'New Delhi', 'Mumbai',
  'Dubai', 'Abu Dhabi', 'Istanbul', 'Cairo', 'Johannesburg',
  'Cape Town', 'Melbourne', 'Sydney', 'Brisbane', 'Auckland',
  'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'
];

function pickRandomCities(count = 5) {
  const shuffled = [...cities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

cron.schedule('4 4 * * *', async () => {
  const selectedCities = pickRandomCities(5);
  console.log('🕒 Daily auto-seed starting...');
  for (const city of selectedCities) {
    try {
      await seed(city);
    } catch (err) {
      console.error(`❌ Failed to seed ${city}`, err);
    }
  }
  console.log('✅ Daily auto-seed completed.');
});

export default router;