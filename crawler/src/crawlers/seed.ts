import { PrismaClient } from '@prisma/client';
import { fetchAirbnbListings } from './crawler';

const prisma = new PrismaClient();

export async function seed(city: string) {
  const listings = await fetchAirbnbListings(city);
  console.log(`🌆 Seeding for city: ${city} (${listings.length} listings)`);

  // Dummy bidders
  const bidderEmails = ['bidder1@example.com', 'bidder2@example.com', 'bidder3@example.com'];
  const bidders = [];

  for (const email of bidderEmails) {
    const bidder = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: email.split('@')[0],
        email,
        password: 'secret'
      }
    });
    bidders.push(bidder);
  }

  for (const item of listings) {
    const hostName = item.host.replace(/^Stay with\s+/i, '') || 'Unknown Host';
    const hostEmail = hostName.toLowerCase().replace(/ /g, '') + '@host.local';

    const hostUser = await prisma.user.upsert({
      where: { email: hostEmail },
      update: {},
      create: {
        name: hostName,
        email: hostEmail,
        password: 'secret'
      }
    });

    const listing = await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        link: item.link,
        checkInDate: item.checkInDate ? new Date(item.checkInDate) : undefined,
        checkOutDate: item.checkOutDate ? new Date(item.checkOutDate) : undefined,
        hostId: hostUser.id,
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

    const bidCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < bidCount; i++) {
      const randomBidder = bidders[Math.floor(Math.random() * bidders.length)];
      await prisma.bid.create({
        data: {
          amount: item.price + Math.floor(Math.random() * 1000000),
          listingId: listing.id,
          bidderId: randomBidder.id
        }
      });
    }
  }

  console.log(`✅ Seeded ${listings.length} listings for ${city}`);
}
