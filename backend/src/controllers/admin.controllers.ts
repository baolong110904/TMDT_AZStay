import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";
import { AdminDAO } from "../dao/admin.dao";

export const getRevenue = async (req: Request, res: Response) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    const result = await AdminDAO.viewRevenueByFiltering({ year, month });
    
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUserInfo = async(req: Request, res: Response) => {
  const page = req.body;
  if (!page) {
    return res.status(400).json({error: "Page is required"});
  }
  try {
    const data = await AdminDAO.getAllUserInfo({page});
    return res.status(200).json({
      data: data
    })
  } catch (error) {
    console.log("Error fetching user info as admin:", error);
    return res.status(500).json({
      message: "Internal server error",
    })
  }
}