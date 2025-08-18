import prisma from "../prisma/client.prisma";

export class AuctionDAO {
  static async createAuction(data: {
    property_id: string;
    start_time: Date;
    end_time: Date;
  }) {
    return prisma.auction.create({
      data: {
        property_id: data.property_id,
        start_time: data.start_time,
        end_time: data.end_time,
        status: "upcoming",
      },
    });
  }
  
  static async getActiveAuctions() {
    const now = new Date();
    return prisma.auction.findMany({
      where: {
        start_time: { lte: now },
        end_time: { gte: now },
        status: "active",
      },
      include: {
        property: true,
      },
    });
  }

  static async updateAuction(auction_id: string, newFinalPrice: number, newBidderId: string) {
    return prisma.auction.update({
      where: { auction_id },
      data: {
        final_price: newFinalPrice,
        winner_id: newBidderId,
        updated_at: new Date(),
      },
    });
  }

  static async getAuctionsByWinner(userId: string) {
    try {
      console.log("[getAuctionsByWinner] userId =", userId);
  
      const auctions = await prisma.auction.findMany({
        where: { winner_id: userId },
        include: {
          property: true,
          user: true,
          userbid: {
            where: { bidder_id: userId },
          },
        },
        orderBy: { end_time: "desc" },
      });
  
      console.log("[getAuctionsByWinner] raw auctions count =", auctions.length);
  
      // lọc lại để chỉ giữ bid thắng
      const result = auctions.map((a) => {
        const filteredBids = a.userbid.filter(
          (b) => b.bid_amount?.toString() === a.final_price?.toString()
        );
  
        console.log(
          `[getAuctionsByWinner] auctionId=${a.auction_id}, final_price=${a.final_price}, filteredBids=${filteredBids.length}`
        );
  
        return { ...a, userbid: filteredBids };
      });
  
      return result;
    } catch (err) {
      console.error("[getAuctionsByWinner] ERROR:", err);
      throw err;
    }
  }
}
