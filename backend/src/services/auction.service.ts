import prisma from "../prisma/client.prisma";

export class AuctionService {
  static async placeBid(
    auctionId: string,
    bidder_id: string,
    bid_amount: number
  ) {
    const auction = await prisma.auction.findUnique({
      where: { auction_id: auctionId },
    });

    if (!auction) {
      throw new Error("Auction not found");
    }

    // Ensure start_time and end_time are not null
    if (!auction.start_time || !auction.end_time) {
      throw new Error("Auction time not properly set");
    }

    const now = new Date();
    if (auction.start_time.getTime() > now.getTime() || auction.end_time.getTime() < now.getTime()) {
      throw new Error("Auction not active");
    }

    const highestBid = await prisma.userbid.findFirst({
      where: { auction_id: auctionId },
      orderBy: { bid_amount: "desc" },
    });

    if (highestBid?.bid_amount != null && bid_amount <= Number(highestBid.bid_amount)) {
      throw new Error("Bid too low");
    }

    return prisma.userbid.create({
      data: {
        auction_id: auctionId,
        bidder_id,
        bid_amount,
        bid_time: new Date(),
      },
    });
  }
}
