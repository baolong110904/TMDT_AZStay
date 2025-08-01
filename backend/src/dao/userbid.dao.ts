import prisma from "../prisma/client.prisma";

type UserBid = Awaited<ReturnType<typeof prisma.userbid.create>>;

export class UserBidDAO {
  private auction_id: string;
  private bidder_id: string;
  private bid_amount: number;

  constructor({
    auction_id,
    bidder_id,
    bid_amount,
  }: {
    auction_id: string;
    bidder_id: string;
    bid_amount: number;
  }) {
    this.auction_id = auction_id;
    this.bidder_id = bidder_id;
    this.bid_amount = bid_amount;
  }

  async validate(): Promise<void> {
    // 1. Check if bid amount is positive
    if (this.bid_amount <= 0) {
      throw new Error("Bid amount must be greater than zero.");
    }

    // 2. Optionally, ensure bid is higher than current highest
    const highest = await UserBidDAO.getHighestBid(this.auction_id);
    if (highest?.bid_amount && this.bid_amount <= highest.bid_amount.toNumber()) {
      throw new Error("Bid must be higher than the current highest bid.");
    }

    // 3. Check for duplicate (optional business logic)
    const existing = await prisma.userbid.findFirst({
      where: {
        auction_id: this.auction_id,
        bidder_id: this.bidder_id,
        bid_amount: this.bid_amount,
      },
    });
    if (existing) {
      throw new Error("Duplicate bid already exists.");
    }
  }

  async save(): Promise<UserBid> {
    await this.validate(); // validate before saving

    return await prisma.userbid.create({
      data: {
        auction_id: this.auction_id,
        bidder_id: this.bidder_id,
        bid_amount: this.bid_amount,
        bid_time: new Date(),
        status: "pending",
      },
    });
  }

  static async getAllBidsForAuction(auctionId: string) {
    return await prisma.userbid.findMany({
      where: { auction_id: auctionId },
      orderBy: { bid_time: "desc" },
    });
  }

  static async getHighestBid(auctionId: string) {
    return await prisma.userbid.findFirst({
      where: { auction_id: auctionId },
      orderBy: { bid_amount: "desc" },
    });
  }

  static async markAsWinningBid(bidId: string): Promise<UserBid> {
    // Optional: mark all others as "lost"
    await prisma.userbid.updateMany({
      where: {
        bid_id: { not: bidId },
      },
      data: {
        status: "lost",
      },
    });

    return await prisma.userbid.update({
      where: { bid_id: bidId },
      data: {
        status: "won",
      },
    });
  }

  static toJSON(bid: UserBid) {
    return {
      bid_id: bid.bid_id,
      auction_id: bid.auction_id,
      bidder_id: bid.bidder_id,
      bid_amount: bid.bid_amount,
      bid_time: bid.bid_time,
      status: bid.status,
    };
  }

  static async placeBid({
    auction_id,
    bidder_id,
    bid_amount,
  }: {
    auction_id: string;
    bidder_id: string;
    bid_amount: number;
  }) {
    // Kiểm tra xem auction có tồn tại không
    const auction = await prisma.auction.findUnique({
      where: { auction_id },
    });
  
    if (!auction) {
      throw new Error("Auction not found");
    }
  
    // Kiểm tra thời gian hợp lệ
    const now = new Date();
    if (!auction.start_time || !auction.end_time) {
      throw new Error("Auction time not properly set");
    }
  
    if (auction.start_time > now || auction.end_time < now) {
      throw new Error("Auction not active");
    }
  
    // Tạo đối tượng DAO instance và lưu
    const bidDAO = new UserBidDAO({ auction_id, bidder_id, bid_amount });
    const savedBid = await bidDAO.save();
    return this.toJSON(savedBid);
  }
}
