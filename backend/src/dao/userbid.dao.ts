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
    stay_start,
    stay_end
  }: {
    auction_id: string;
    bidder_id: string;
    bid_amount: number;
    stay_start: Date;
    stay_end: Date;
  }) {
    // Lấy thông tin auction + property
    const auction = await prisma.auction.findUnique({
      where: { auction_id },
      include: { property: true }
    });
  
    if (!auction) {
      throw new Error("Auction not found");
    }
  
    const now = new Date();
  
    // Kiểm tra thời gian đấu giá
    if (!auction.start_time || !auction.end_time) {
      throw new Error("Auction time not properly set");
    }
    if (auction.start_time > now || auction.end_time < now) {
      throw new Error("Auction not active");
    }
  
    // Kiểm tra giá
    const highestBid = await prisma.userbid.findFirst({
      where: { auction_id },
      orderBy: { bid_amount: "desc" }
    });
  
    const highestBidAmount = highestBid?.bid_amount
      ? Number(highestBid.bid_amount)
      : null;
  
    const minBid = highestBidAmount !== null
      ? highestBidAmount + 10000
      : Number(auction.final_price) || 0;
  
    if (bid_amount < minBid) {
      throw new Error(`Bid amount must be at least ${minBid}`);
    }
  
    // Kiểm tra ngày lưu trú
    const availableStart = auction.property?.checkin_date ?? null;
    const availableEnd = auction.property?.checkout_date ?? null;
  
    if (!availableStart || !availableEnd) {
      throw new Error("Property available dates are not set");
    }
  
    console.log(availableStart);
    console.log(availableEnd);
    if (stay_end < availableStart || stay_start > availableEnd) {
      throw new Error("Stay dates must be within available period");
    }
    if (stay_start >= stay_end) {
      throw new Error("stay_start must be before stay_end");
    }
  
    // Lưu bid
    const savedBid = await prisma.userbid.create({
      data: {
        auction_id,
        bidder_id,
        bid_amount,
        stay_start,
        stay_end,
      }
    });
  
    return savedBid;
  }  
  static async updateStatusByBookingId(bookingId: string, status: string) {
    return prisma.userbid.updateMany({
      where: {
        booking_id: bookingId// booking có quan hệ 1-1 với userbid
      },
      data: { status },
    });
  }
  static async getBidById(bid_id: string) {
    return prisma.userbid.findUnique({
      where: { bid_id },
      include: {
        user: true, // thông tin người bid
        auction: {
          include: {
            property: true, // thông tin property liên quan
          },
        },
      },
    });
  }
  static async updateBookingId(bidId: string, bookingId: string) {
    return prisma.userbid.update({
      where: { bid_id: bidId },
      data: { booking_id: bookingId },
    });
  }
}
