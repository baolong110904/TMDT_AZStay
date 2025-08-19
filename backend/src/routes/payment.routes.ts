import express from "express";
import * as PaymentController from "../controllers/payment.controllers";
import { Roles, authorizeRoles, verifyToken } from "../middlewares/auth.middlewares";
import { PaymentDAO } from "../dao/payment.dao";

const router = express.Router();

router.post(
  "/create-session",
  verifyToken,
  authorizeRoles(Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER),
  PaymentController.createPaymentSession
);

router.post("/verify",
    verifyToken,
    authorizeRoles(Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER), 
    PaymentController.verifyPayment);

export default router;
