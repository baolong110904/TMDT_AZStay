import { Request, Response } from "express";
import qs from "qs";
import crypto from "crypto"
import { AuthRequest } from "../middlewares/auth.middlewares";
import { BookingDAO } from "../dao/booking.dao";
import { PaymentDAO } from "../dao/payment.dao";
import { UserBidDAO } from "../dao/userbid.dao";
import { createVnpayPaymentUrl } from "../utils/vnpay.utils";
import { Prisma } from "@prisma/client";

// Hàm helper để lấy IP address (theo demo VNPay)
const getClientIp = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
};

export const createPaymentSession = async (req: AuthRequest, res: Response) => {
  try {
    const { bidId, amount } = req.body;
    const userId = req.user.sub;
    const vnp_return_Url = "http://localhost:3000/callback"; 

    if (!bidId || !amount) {
      return res.status(400).json({ message: "Missing bidId or amount" });
    }

    const bid = await UserBidDAO.getBidById(bidId);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    // Chuyển amount từ number/string sang Prisma.Decimal
    const totalAmount = new Prisma.Decimal(amount);

    // Tạo booking
    const booking = await BookingDAO.createBooking({
      property_id: bid.auction?.property_id!,
      renter_id: userId,
      bid_id: bidId,
      start_date: bid.stay_start!,
      end_date: bid.stay_end!,
      total_price: totalAmount,
      status: "PENDING_PAYMENT",
    });

    // Tạo payment
    const payment = await PaymentDAO.createPayment({
      user_id: userId,
      booking_id: booking.booking_id,
      amount: totalAmount,
      status: "PENDING",
    });

    await UserBidDAO.updateBookingId(bidId, booking.booking_id);
    // Lấy IP của client
    const clientIp = getClientIp(req);
    
    // Tạo URL thanh toán VNPay
    const paymentUrl = createVnpayPaymentUrl(
      booking.booking_id,
      totalAmount.toNumber(),
      vnp_return_Url,
      clientIp
    );

    res.status(200).json({ paymentUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const vnp_Params = req.body.vnp_Params || {};
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Xóa field không hash
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // Sort theo key
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const secretKey = process.env.VNP_HASH_SECRET!;
    const signData = qs.stringify(sortedParams, { encode: false });
    const checkSum = crypto
      .createHmac("sha512", secretKey)
      .update(signData, "utf-8")
      .digest("hex");

    if (secureHash !== checkSum) {
      return res.json({ success: false, message: "Sai chữ ký" });
    }

    const responseCode = vnp_Params["vnp_ResponseCode"];
    const txnRef = vnp_Params["vnp_TxnRef"]; // bookingId
    const amount = Number(vnp_Params["vnp_Amount"]) / 100;

    if (responseCode === "00") {
      // ✅ Thành công
      await PaymentDAO.updatePaymentStatusByBookingId(txnRef, "SUCCESS");
      await BookingDAO.updateBookingStatus(txnRef, "CONFIRMED");
      await UserBidDAO.updateStatusByBookingId(txnRef, "COMPLETED");

      return res.json({
        success: true,
        message: "Thanh toán thành công",
        bookingId: txnRef,
        amount,
      });
    } else {
      // ❌ Thất bại
      await PaymentDAO.updatePaymentStatusByBookingId(txnRef, "FAILED");
      await BookingDAO.updateBookingStatus(txnRef, "FAILED");
      await UserBidDAO.updateStatusByBookingId(txnRef, "CANCELLED");

      return res.json({
        success: false,
        message: "Thanh toán thất bại",
        bookingId: txnRef,
        amount,
      });
    }
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi verify" });
  }
};