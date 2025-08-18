import express from "express";
import * as UserBidController from "../controllers/userbid.controllers";
import { authorizeRoles, Roles, verifyToken } from "../middlewares/auth.middlewares";
const router = express.Router();

router.get("/:bidId", UserBidController.getBidById);

export default router;