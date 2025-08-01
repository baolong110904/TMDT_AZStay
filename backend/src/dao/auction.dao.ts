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
}
