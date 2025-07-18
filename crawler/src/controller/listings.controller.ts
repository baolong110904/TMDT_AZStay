import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/listings
export const getListings = async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        image: true,
        reviewStat: true
      },
      where: {
        isActive: true
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
      address,
      latitude,
      longitude,
      imageUrl,
      checkInDate,
      checkOutDate,
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
        address,
        latitude,
        longitude,
        checkInDate: checkInDate ? new Date(checkInDate) : undefined,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
        image: imageUrl
          ? {
              create: {
                url: imageUrl
              }
            }
          : undefined,
        reviewStat:
          rating && reviewCount
            ? {
                create: {
                  rating,
                  count: reviewCount
                }
              }
            : undefined
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
