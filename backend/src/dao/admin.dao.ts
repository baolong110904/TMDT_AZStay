import prisma from "../prisma/client.prisma";

export class AdminDAO {
  static async viewRevenueByFiltering(data: { year: number; month: number }) {
    const { year, month } = data;
    const bookingReveue = await prisma.booking.aggregate({
      _sum: {
        total_price: true,
      },
      where: {
        created_at: {
          gte: new Date(year, month, 1),
          lt: new Date(year, month + 1, 1),
        },
        status: "completed",
      },
    });
    const auctionRevenue = await prisma.auction.aggregate({
      _sum: {
        final_price: true,
      },
      where: {
        created_at: {
          gte: new Date(year, month, 1),
          lt: new Date(year, month + 1, 1),
        },
        status: "completed",
      },
    });

    const totalBooking = Number(bookingReveue._sum.total_price || 0);
    const totalAuction = Number(auctionRevenue._sum.final_price || 0);

    return {
      bookingRevenue: totalBooking,
      auctionRevenue: totalAuction,
      totalRevenue: totalBooking + totalAuction,
    };
  }

  static async getAllUserInfo(data: { page: number }) {
    const page = Number(data.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const [userData, total] = await Promise.all([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        where: {
          role_id: {not: 1}
        }
      }),
      prisma.user.count({
        where: {
          role_id: {not: 1}
        }
      }),
    ]);

    return {
      userData,
      total,
      totalPages: Math.ceil(total / limit),
      currenPage: page,
    }
  }
}
