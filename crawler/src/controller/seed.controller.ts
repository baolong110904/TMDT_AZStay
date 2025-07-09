import { Request, Response } from 'express';
import { seed } from '../crawlers/seed';

export const manualSeedHandler = async (req: Request, res: Response) => {
  const city = req.body.city || 'New York';
  try {
    await seed(city);
    res.status(200).json({ message: `✅ Seed completed for ${city}` });
  } catch (err) {
    console.error('❌ Seed error:', err);
    res.status(500).json({ error: '❌ Seed failed', details: err });
  }
};
