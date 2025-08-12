import express from 'express';
import { manualSeedHandler } from '../controller/seed.controller';
import cron from 'node-cron';
import { seed } from '../crawlers/seed';

const router = express.Router();

// 📌 Manual trigger: POST /api/seed/manual { city: 'London' }
router.post('/seed/manual', manualSeedHandler);

const cities = [
  "An Giang", "Ba Ria Vung Tau", "Bac Giang", "Bac Kan", "Bac Lieu",
  "Bac Ninh", "Ben Tre", "Binh Dinh", "Binh Duong", "Binh Phuoc",
  "Binh Thuan", "Ca Mau", "Cao Bang", "Can Tho", "Da Nang",
  "Dak Lak", "Dak Nong", "Dien Bien", "Dong Nai", "Dong Thap",
  "Gia Lai", "Ha Giang", "Ha Nam", "Ha Noi", "Ha Tinh",
  "Hai Duong", "Hai Phong", "Hau Giang", "Hoa Binh", "Hung Yen",
  "Khanh Hoa", "Kien Giang", "Kon Tum", "Lai Chau", "Lam Dong",
  "Lang Son", "Lao Cai", "Long An", "Nam Dinh", "Nghe An",
  "Ninh Binh", "Ninh Thuan", "Phu Tho", "Phu Yen", "Quang Binh",
  "Quang Nam", "Quang Ngai", "Quang Ninh", "Quang Tri", "Soc Trang",
  "Son La", "Tay Ninh", "Thai Binh", "Thai Nguyen", "Thanh Hoa",
  "Thua Thien Hue", "Tien Giang", "Ho Chi Minh", "Tra Vinh", "Tuyen Quang",
  "Vinh Long", "Vinh Phuc", "Yen Bai"
];

cron.schedule('30 9 * * *', async () => {
  console.log('🕒 Daily auto-seed starting...');
  for (const city of cities) {
    try {
      await seed(city);
    } catch (err) {
      console.error(`❌ Failed to seed ${city}`, err);
    }
  }
  console.log('✅ Daily auto-seed completed.');
});

export default router;