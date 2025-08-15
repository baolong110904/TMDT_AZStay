import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pg = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pg.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

export async function migrateToPostgres({
  listing,
  imageUrl,
}: {
  listing: any;
  imageUrl?: string;
}) {
  try {
    const propertyId = uuidv4();
    const maxGuests = Math.floor(Math.random() * 4) + 1; // random 1-4

    console.log('📦 Migrating listing:', {
      title: listing?.title,
      description: listing?.description,
      address: listing?.address,
      longitude: listing?.longitude,
      latitude: listing?.latitude,
      price: listing?.price,
      checkInDate: listing?.checkInDate,
      checkOutDate: listing?.checkOutDate,
      maxGuests,
      reviewStat: listing?.reviewStat,
      imageUrl,
    });

    // 1️⃣ Insert property
    const res1 = await pg.query(
      `
      INSERT INTO property (
        property_id,
        title,
        description,
        address,
        longitude,
        latitude,
        min_price,
        is_available,
        owner_id,
        max_guest,
        checkin_date,
        checkout_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, TRUE, null, $8, $9, $10
      )
      ON CONFLICT DO NOTHING
      RETURNING *
      `,
      [
        propertyId,
        listing.title,
        listing.description,
        listing.address ?? null,
        listing.longitude ?? null,
        listing.latitude ?? null,
        listing.price,
        maxGuests,
        listing.checkInDate ? new Date(listing.checkInDate) : null,
        listing.checkOutDate ? new Date(listing.checkOutDate) : null,
      ]
    );

    console.log(`🏠 Property inserted: ${res1.rowCount} row(s)`);

    if (res1.rowCount === 0) {
      console.warn('⚠️ Property already exists, skipping insert.');
      return;
    }

    // 2️⃣ Insert image
    if (imageUrl) {
      const imageId = uuidv4();
      const res2 = await pg.query(
        `
        INSERT INTO propertyimage (
          image_id,
          property_id,
          image_url,
          is_cover
        ) VALUES (
          $1, $2, $3, TRUE
        )
        RETURNING *
        `,
        [imageId, propertyId, imageUrl]
      );
      console.log(`🖼️ Image inserted: ${res2.rowCount} row(s)`);
    }
    console.log(`✅ Migrated listing to PostgreSQL: ${listing.title}`);
  } catch (err: any) {
    console.error(`❌ PostgreSQL migration failed for: ${listing?.title ?? '[NO TITLE]'}`);
    console.error(err.stack || err);
  }
}
