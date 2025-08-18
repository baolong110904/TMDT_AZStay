import express from "express";
import * as AuctionController from "../controllers/auction.controllers";
import { Roles, authorizeRoles, verifyToken } from "../middlewares/auth.middlewares";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER), AuctionController.createAuction);
router.get("/active", AuctionController.getActiveAuctions);
router.post("/:auctionId/bid", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER), AuctionController.placeBid);
router.get("/:auctionId/bids", AuctionController.getBids);
router.patch("/:auctionId/end", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER),AuctionController.endAuction);
router.get(
    "/my-wins",
    verifyToken,
    authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER),
    AuctionController.getMyWinningAuctions
  );

export default router;