import express from "express";
import * as PaymentController from "../controllers/payment.controllers";
import { Roles, authorizeRoles, verifyToken } from "../middlewares/auth.middlewares";
import { PaymentDAO } from "../dao/payment.dao";

const router = express.Router();

router.post(
  "/vnpay/create-session",
  verifyToken,
  authorizeRoles(Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER),
  PaymentController.createPaymentSession
);

router.post("/vnpay/verify",
    verifyToken,
    authorizeRoles(Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER), 
    PaymentController.verifyPayment);

router.post(
  "/paypal/create-session",
  verifyToken,
  authorizeRoles(Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER),
  PaymentController.createPaypalPaymentSession
);

router.post("/paypal/verify",
    verifyToken,
    authorizeRoles(Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER), 
    PaymentController.verifyPaypalPayment);

export default router;
