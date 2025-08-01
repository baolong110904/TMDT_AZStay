import express from "express";
import * as AuctionController from "../controllers/auction.controllers";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = express.Router();

router.post("/", verifyToken, AuctionController.createAuction);
router.get("/active", AuctionController.getActiveAuctions);
router.post("/:auctionId/bid", verifyToken, AuctionController.placeBid);
router.get("/:auctionId/bids", AuctionController.getBids);
router.patch("/:auctionId/end", verifyToken, AuctionController.endAuction);

export default router;