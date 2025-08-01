import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middlewares';
import { AuctionDAO } from '../dao/auction.dao'
import { AuctionService } from '../services/auction.service'
import prisma from "../prisma/client.prisma";

export const createAuction = async (req: Request, res: Response) => {
    const { property_id, start_time, end_time } = req.body;
    const auction = await AuctionDAO.createAuction({ property_id, start_time, end_time });
    res.status(201).json(auction);
  };

export const getActiveAuctions = async (_req: Request, res: Response) => {
  const auctions = await AuctionDAO.getActiveAuctions();
  res.status(200).json(auctions);
};

export const placeBid = async (req: AuthRequest, res: Response) => {
  const { auctionId } = req.params;
  const { bid_amount } = req.body;
  const bidder_id = req.user.user_id; // from auth middleware

  const bid = await AuctionService.placeBid(auctionId, bidder_id, bid_amount);
  res.status(201).json(bid);
};

export const getBids = async (req: Request, res: Response) => {
  const { auctionId } = req.params;
  const bids = await prisma.userbid.findMany({
    where: { auction_id: auctionId },
    orderBy: { bid_time: "desc" },
    include: { user: true },
  });
  res.json(bids);
};

export const endAuction = async (auctionId: string) => {
  const highestBid = await prisma.userbid.findFirst({
    where: { auction_id: auctionId },
    orderBy: { bid_amount: "desc" },
  });

  return prisma.auction.update({
    where: { auction_id: auctionId },
    data: {
      status: "ended",
      winner_id: highestBid?.bidder_id ?? null,
      final_price: highestBid?.bid_amount ?? null,
    },
  });
};