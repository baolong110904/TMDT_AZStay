import express from "express";
import * as AdminController from "../controllers/admin.controllers";
import * as AuctionController from "../controllers/auction.controllers";
import { authenticateJWT, authorizeRoles, Roles } from "../middlewares/auth.middlewares";

const gei = express.Router();

gei.post('/get-revenue', /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AdminController.getRevenue);
gei.post('/get-user', /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AdminController.getUserInfo);
gei.post('/change-role', /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AdminController.changeUserRole);
gei.get('/get-dashboard', /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AdminController.getDashboardData);
gei.get('/get-active-auction', /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AuctionController.getActiveAuctions);
gei.post('/change-ban', /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AdminController.changeUserBanStatus);
gei.get("/search-user", /*authenticateJWT('access'), authorizeRoles(Roles.ADMIN),*/ AdminController.searchUser);

export default gei;