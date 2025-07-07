import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/listings
export const getListings = async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        host: {
          include: {
            user: true, // host.user.name, host.user.email
          }
        },
        bids: {
          include: {
            bidder: true
          }
        },
        reviewStat: true,
        image: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(listings);
  } catch (err) {
    console.error('❌ Error getting listings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /api/listings
export const createListing = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      currency,
      link,
      imageUrl,
      checkInDate,
      checkOutDate,
      hostId, // hostProfileId
      rating,
      reviewCount
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        currency,
        link,
        checkInDate: checkInDate ? new Date(checkInDate) : undefined,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
        hostId,
        image: imageUrl ? {
          create: { url: imageUrl }
        } : undefined,
        reviewStat: (rating && reviewCount) ? {
          create: {
            rating,
            count: reviewCount
          }
        } : undefined
      },
      include: {
        image: true,
        reviewStat: true
      }
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error('❌ Error creating listing:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};
