import prisma from "../prisma/client.prisma";
import { Prisma } from "@prisma/client";

export class PaymentDAO {
  static async getPaymentByBookingId(booking_id: string) {
    return prisma.payment.findFirst({
      where: { booking_id: booking_id }
    });
  }

  static async updatePaymentStatusByBookingId(booking_id: string, status: string) {
    return prisma.payment.update({
      where: { booking_id: booking_id },
      data: {status, updated_at: new Date() },
    });
  }

  static async createPayment(data: {
    user_id: string;
    booking_id?: string;
    amount: Prisma.Decimal;
    status?: string;
  }) {
    return prisma.payment.create({
      data: {
        user_id: data.user_id,
        booking_id: data.booking_id,
        amount: data.amount,
        status: data.status || "PENDING",
      },
    });
  }

  static async getPaymentById(payment_id: string) {
    return prisma.payment.findUnique({
      where: { payment_id },
      include: { booking: true, user: true, method: true },
    });
  }

  static async updatePaymentStatus(payment_id: string, status: string) {
    return prisma.payment.update({
      where: { payment_id },
      data: { status, updated_at: new Date() },
    });
  }
}
