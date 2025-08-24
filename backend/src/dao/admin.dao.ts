import prisma from "../prisma/client.prisma";
import { Roles } from "../middlewares/auth.middlewares";
import { getUserById } from "./user.dao";
import { error, group } from "console";
import { stat } from "fs";

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
    const limit = 15;
    const skip = (page - 1) * limit;
    const [userData, total] = await Promise.all([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        where: {
          role_id: { not: 1 },
        },
        select: {
          user_id: true,
          name: true,
          email: true,
          phone: true,
          role_id: true,
          is_banned: true,
        },
      }),
      prisma.user.count({
        where: {
          role_id: { notIn: [1, 3] },
        },
      }),
    ]);

    return {
      userData,
      total,
      totalPages: Math.ceil(total / limit),
      currenPage: page,
    };
  }

  /// updating role for user
  static async updateUserRole(user_id: string, role_id: number) {
    return prisma.user.update({
      where: { user_id },
      data: { role_id },
    });
  }
  // ban/unbanned user
  static async updateUserBan(user_id: string, status: boolean) {
    return prisma.user.update({
      where: { user_id },
      data: { is_banned: status },
    });
  }

  static async searchUsers(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [userData, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
        select: {
          user_id: true,
          name: true,
          email: true,
          phone: true,
          role_id: true,
          is_banned: true,
        },
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      userData,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // get data for header of dashboard
  static async getDataForHeader() {
    // total properties
    const totalProperties = await prisma.property.aggregate({
      _count: {
        property_id: true,
      },
    });

    // total users
    const totalUsers = await prisma.user.aggregate({
      _count: {
        user_id: true,
      },
    });

    // current number of auction
    const totalCurentAuctions = await prisma.auction.aggregate({
      _count: {
        auction_id: true,
      },
      where: {
        start_time: { lte: new Date() },
        end_time: { gte: new Date() },
        status: "active",
      },
    });

    // total categories
    const totalCategories = await prisma.category.aggregate({
      _count: {
        category_id: true,
      },
    });

    return {
      totalProperties: totalProperties._count.property_id,
      totalUsers: totalUsers._count.user_id,
      totalCurrentAuctions: totalCurentAuctions._count.auction_id,
      totalCategories: totalCategories._count.category_id,
    };
  }
  // get data piechart based on role_id input
  static async getDataForPie() {
    const roles = await prisma.role.findMany({
      select: { role_id: true, role_name: true },
      where: {
        role_id: {
          notIn: [1, 3],
        },
      },
    });

    const grouped = await prisma.user.groupBy({
      by: ["role_id"],
      where: {
        role_id: {
          notIn: [1, 3],
        },
      },
      _count: {
        user_id: true,
      },
    });

    return roles.map((role) => {
      const found = grouped.find((g) => g.role_id === role.role_id);
      return {
        role_name: role.role_name,
        count: found ? found._count.user_id : 0,
      };
    });
  }

  // get total num of each categories
  static async getTotalPropertyByCategory() {
    // 1. group by category_id
    const grouped = await prisma.property.groupBy({
      by: ["category_id"],
      _count: { property_id: true },
    });

    // 2. fetch all categories
    const categories = await prisma.category.findMany({
      select: { category_id: true, category_name: true },
    });

    // 3. merge results
    return categories.map((cat) => {
      const found = grouped.find((g) => g.category_id === cat.category_id);
      return {
        category_name: cat.category_name,
        total: found?._count.property_id || 0,
      };
    });
  }

  // get data for total revenue
  static async getTotalRevenue() {
    const monthlyRevenue = await prisma.$queryRaw<
      { month: string; total: number }[]
    >`
      SELECT TO_CHAR(months.month, 'MM/YYYY') AS month, COALESCE(SUM(p.amount), 0)::float AS total
      FROM generate_series(
        (SELECT MIN(created_at)::date FROM "payment"),
        date_trunc('month', now()),
        interval '1 month'
      ) months(month)
      LEFT JOIN "payment" p
      ON DATE_TRUNC('month', p.created_at) = months.month
      AND p.status = 'success'
      GROUP BY months.month
      ORDER BY months.month;
    `;

    return monthlyRevenue;
  }
}
