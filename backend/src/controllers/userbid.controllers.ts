import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import { UserBidDAO } from "../dao/userbid.dao";

export const getBidById = async (req: Request, res: Response) => {
    const { bidId } = req.params;
    try {
      const bid = await UserBidDAO.getBidById(bidId);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      res.status(200).json(bid);
    } catch (err) {
      const error = err as Error;
      res
        .status(500)
        .json({ message: "Failed to fetch Bid", error: error.message });
    }
  };