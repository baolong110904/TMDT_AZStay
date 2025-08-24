import express from "express";
import * as AuctionController from "../controllers/auction.controllers";
import { Roles, authorizeRoles, verifyToken } from "../middlewares/auth.middlewares";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER), AuctionController.createAuction);
router.get("/active", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER), AuctionController.getActiveAuctions);
router.post("/:auctionId/bid", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER), AuctionController.placeBid);
router.get("/:auctionId/bids", AuctionController.getBids);
router.patch("/:auctionId/end", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER),
async (req, res) => {
    try {
      const result = await (AuctionController as any).endAuction(req.params.auctionId);
      res.status(200).json(result);
    } catch (e: any) {
      res.status(400).json({ message: "Failed to end auction", error: e?.message });
    }
  }
);
router.get(
    "/my-wins",
    verifyToken,
    authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER, Roles.CUSTOMER),
    AuctionController.getMyWinningAuctions
  );

export default router;