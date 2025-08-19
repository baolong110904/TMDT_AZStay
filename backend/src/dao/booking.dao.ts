import prisma from "../prisma/client.prisma";
import { Prisma } from "@prisma/client";

interface CreateBookingInput {
  property_id: string;
  renter_id: string;
  bid_id: string;
  start_date: Date;
  end_date: Date;
  total_price: Prisma.Decimal | number;
  status: string;
}

export class BookingDAO {
  static getAllPendingBookings() {
    return prisma.booking.findMany({});
  }
  /**
   * Tạo booking mới
   */
  static async createBooking(data: CreateBookingInput) {
    return prisma.booking.create({
      data: {
        property_id: data.property_id,
        renter_id: data.renter_id,
        bid_id: data.bid_id,
        start_date: data.start_date,
        end_date: data.end_date,
        total_price: typeof data.total_price === "number" ? new Prisma.Decimal(data.total_price) : data.total_price,
        status: data.status,
      },
    });
  }

  /**
   * Lấy booking theo booking_id
   */
  static async getBookingById(bookingId: string) {
    return prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: {
        property: true,
        user: true,
        payment: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái booking
   */
  static async updateBookingStatus(bookingId: string, status: string) {
    return prisma.booking.update({
      where: { booking_id: bookingId },
      data: { status, updated_at: new Date() },
    });
  }

  /**
   * Lấy tất cả booking của một user
   */
  static async getBookingsByUser(userId: string) {
    return prisma.booking.findMany({
      where: { renter_id: userId },
      include: { property: true, payment: true },
      orderBy: { created_at: "desc" },
    });
  }
}
