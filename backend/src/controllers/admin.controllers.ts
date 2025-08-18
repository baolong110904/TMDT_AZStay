import { Request, Response } from "express";
import { AuthRequest, Roles } from "../middlewares/auth.middlewares";
import { AdminDAO } from "../dao/admin.dao";
import { getUserById } from "../dao/user.dao";

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

export const getUserInfo = async (req: Request, res: Response) => {
  const page = req.body;
  if (!page) {
    return res.status(400).json({ error: "Page is required" });
  }
  try {
    const data = await AdminDAO.getAllUserInfo({ page });
    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.log("Error fetching user info as admin:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  const { user_id, desire_role } = req.body;
  if (!user_id || !desire_role) {
    return res.status(401).json({
      message: "Mising one of those require fields: `user_id`, `desire_role`",
    });
  }
  try {
    const user_data = await getUserById(user_id);
    if (!user_data || user_data.role_id === Roles.ADMIN) {
      // 1. check user exist
      return res.status(404).json({ message: "User not found" });
    }
    const allowedRoles = new Map<string, number>([
      ["customer", Roles.CUSTOMER],
      ["property_owner", Roles.PROPERTY_OWNER],
      ["both", Roles.PROPERTY_OWNER_AND_CUSTOMER],
    ]);
    if (!allowedRoles.has(desire_role)) {
      // 2. check role exist
      return res.status(400).json({
        message: "Invalid role. Valid roles are: customer, propertyowner, both",
      });
    }

    const desireRoleId = allowedRoles.get(desire_role);
    // 3. check if user already has that role
    if (user_data.role_id === desireRoleId) {
      return res
        .status(400)
        .json({ message: `User is already in role '${desire_role}'` });
    }
    // 4. update role for that user
    const result = await AdminDAO.updateUserRole(user_id, Number(desireRoleId));
    return res.status(200).json({
      message: `Updating user with the user_id: '${user_id}' sucessfully`,
      data: result,
    });
  } catch (error) {
    console.log("Error updating user role as admin:", error);
    return res.status(500).json({
      message: "Internal server error, check terminal log",
    });
  }
};

export const changeUserBanStatus = async (req: Request, res: Response) => {
  const { user_id, status } = req.body;
  if (!user_id || status === undefined || ![false, true].includes(status)) {
    return res.status(401).json({
      message: "Missing one of those required fields: `user_id`, `status`",
    });
  }
  try {
    // check user exist
    const user_data = await getUserById(user_id);
    if (!user_data || user_data.role_id === Roles.ADMIN) {
      return res.status(404).json({ message: "User not found" });
    }
    // check ban status is overlap
    if (user_data.is_banned === status) {
      return res
        .status(400)
        .json({ message: `User is already in status: ${status}` });
    }
    // change status
    const result = await AdminDAO.updateUserBan(user_data.user_id, status);
    return res.status(200).json({
      message: `Updating user ban status with the user_id: '${user_id}' sucessfully`,
      data: result,
    });
  } catch (error) {}
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const [header, pie, categories, revenue] = await Promise.all([
      AdminDAO.getDataForHeader(),
      AdminDAO.getDataForPie(),
      AdminDAO.getTotalPropertyByCategory(),
      AdminDAO.getTotalRevenue(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        header,
        pie,
        categories,
        revenue,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.query || "");
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await AdminDAO.searchUsers(query, page, limit);

    return res.json({ data: result });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};