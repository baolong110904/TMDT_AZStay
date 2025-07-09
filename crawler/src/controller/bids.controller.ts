import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const placeBid = async (req: Request, res: Response) => {
  const { listingId, bidderId, amount } = req.body;
  const bid = await prisma.bid.create({
    data: { listingId, bidderId, amount }
  });
  res.json(bid);
};

export const getBidsForListing = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const bids = await prisma.bid.findMany({
    where: { listingId },
    include: { bidder: true }
  });
  res.json(bids);
};
