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

export const changeUserRole = async(req: Request, res: Response) => {
  const {user_id, desire_role} = req.body;
  try {
    const user_data = await getUserById(user_id);
    if (!user_data || user_data.role_id === Roles.ADMIN) { // 1. check user exist
      return res.status(404).json({message: "User not found"});
    }
    const allowedRoles = new Map<string, number>([
      ["customer", Roles.CUSTOMER],
      ["property_owner", Roles.PROPERTY_OWNER],
      ["both", Roles.PROPERTY_OWNER_AND_CUSTOMER]
    ]);
    if (!allowedRoles.has(desire_role)) { // 2. check role exist
      return res.status(400).json({message: "Invalid role. Valid roles are: customer, propertyowner, both"});
    }
  
    const desireRoleId = allowedRoles.get(desire_role);
    // 3. check if user already has that role
    if (user_data.role_id === desireRoleId) {
      return res.status(400).json({message: `User is already in role '${desire_role}'`});
    }
    // 4. update role for that user
    const result = await AdminDAO.updateUserRole(user_id, Number(desireRoleId));
    return res.status(200).json({message: `Updating user with the user_id: '${user_id}' sucessfully`, data: result});
  } catch (error) {
    console.log("Error updating user role as admin:", error);
    return res.status(500).json({
      message: "Internal server error, check terminal log"
    })
  }

}