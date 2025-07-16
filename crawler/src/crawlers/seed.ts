import { fetchAirbnbListings } from './crawler';
import { PrismaClient } from '@prisma/client';
import { migrateToPostgres } from './migrate';

const prisma = new PrismaClient();

export async function seed(city: string) {
  const listings = await fetchAirbnbListings(city);
  console.log(`🌆 Seeding for city: ${city} (${listings.length} listings)`);

  for (const item of listings) {
    const existingListing = await prisma.listing.findUnique({
      where: { link: item.link }
    });

    if (existingListing) {
      console.log(`⚠️  Skipped existing listing: ${item.link}`);
      continue;
    }

    const listing = await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        link: item.link,
        checkInDate: item.checkInDate ? new Date(item.checkInDate) : undefined,
        checkOutDate: item.checkOutDate ? new Date(item.checkOutDate) : undefined,
        createdAt: new Date()
      }
    });

    if (item.imageUrl) {
      await prisma.image.create({
        data: {
          url: item.imageUrl,
          listingId: listing.id
        }
      });
    }

    if (item.rating && item.reviewCount) {
      await prisma.reviewStat.create({
        data: {
          rating: item.rating,
          count: item.reviewCount,
          listingId: listing.id
        }
      });
    }
    // ✅ Migrate sang PostgreSQL
    await migrateToPostgres({ listing, imageUrl: item.imageUrl });
  }

  console.log(`✅ Done seeding and migrating ${listings.length} listings for ${city}`);
}
