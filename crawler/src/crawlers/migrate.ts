import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});
    
pg.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

dotenv.config();

export async function migrateToPostgres({ listing, hostUser, imageUrl }: {
  listing: any,
  hostUser: any,
  imageUrl?: string
}) {
  try {
    const userId = uuidv4();
    const propertyId = uuidv4();

    // Insert user if not exists
    await pg.query(`
      INSERT INTO "user" (user_id, name, email, hashed_password)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [userId, hostUser.name, hostUser.email, hostUser.password]);

    // Insert property
    await pg.query(`
      INSERT INTO property (property_id, owner_id, title, description, min_price, is_available)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      ON CONFLICT (title) DO NOTHING
    `, [propertyId, userId, listing.title, listing.description, listing.price]);

    // Insert image if exists
    if (imageUrl) {
      await pg.query(`
        INSERT INTO propertyimage (image_id, property_id, image_url, is_cover)
        VALUES ($1, $2, $3, TRUE)
      `, [uuidv4(), propertyId, imageUrl]);
    }

    console.log(`🔁 Migrated to PostgreSQL: ${listing.title}`);
  } catch (err) {
    console.error(`❌ PostgreSQL migration failed for: ${listing.title}`, err);
  }
}
