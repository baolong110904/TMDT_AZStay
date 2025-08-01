import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middlewares';
import { AuctionDAO } from '../dao/auction.dao'
import { UserBidDAO } from '../dao/userbid.dao'
import prisma from "../prisma/client.prisma";
import { getIO } from "../utils/socket.utils"

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
  const bidder_id = req.user.sub;

  try {
    const bid = await UserBidDAO.placeBid({
      auction_id: auctionId,
      bidder_id,
      bid_amount,
    });

    const io = getIO();
    io.to(auctionId).emit("new-bid", {
      auctionId,
      bidder_id,
      bid_amount,
      bid_id: bid.bid_id, // nếu có
      timestamp: bid.bid_time || new Date().toISOString(),
    });

    res.status(201).json(bid);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: "Failed to place bid", error: error.message });
  }
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