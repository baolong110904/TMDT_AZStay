import { fetchAirbnbListings } from './crawler';
import { PrismaClient } from '@prisma/client';

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
  
    const hostProfile = await prisma.hostProfile.upsert({
      where: { userId: hostUser.id },
      update: {},
      create: { userId: hostUser.id }
    });
  
    const existingListing = await prisma.listing.findUnique({
      where: { link: item.link }
    });
  
    if (existingListing) {
      console.log(`⚠️  Skipped listing (already exists): ${item.link}`);
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
        hostId: hostProfile.id,
        createdAt: new Date()
      }
    });
  
    if (item.imageUrl) {
      const existingImage = await prisma.image.findFirst({
        where: {
          listingId: listing.id,
          url: item.imageUrl
        }
      });
  
      if (!existingImage) {
        await prisma.image.create({
          data: {
            url: item.imageUrl,
            listingId: listing.id
          }
        });
      }
    }
  
    if (item.rating && item.reviewCount) {
      const existingReview = await prisma.reviewStat.findUnique({
        where: {
          listingId: listing.id
        }
      });
  
      if (!existingReview) {
        await prisma.reviewStat.create({
          data: {
            rating: item.rating,
            count: item.reviewCount,
            listingId: listing.id
          }
        });
      }
    }
  
    const bidCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < bidCount; i++) {
      const randomBidder = bidders[Math.floor(Math.random() * bidders.length)];
  
      const existingBid = await prisma.bid.findFirst({
        where: {
          listingId: listing.id,
          bidderId: randomBidder.id
        }
      });
  
      if (!existingBid) {
        await prisma.bid.create({
          data: {
            amount: item.price + Math.floor(Math.random() * 1000000),
            listingId: listing.id,
            bidderId: randomBidder.id
          }
        });
      }
    }
  }  
  console.log(`✅ Seeded ${listings.length} listings for ${city}`);
}
