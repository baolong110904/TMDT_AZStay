import express from "express";
import * as AdminController from "../controllers/admin.controllers";
import { authenticateJWT, authorizeRoles, Roles } from "../middlewares/auth.middlewares";

const gei = express.Router();

gei.post('/get-revenue', authenticateJWT('access'), authorizeRoles(Roles.ADMIN), AdminController.getRevenue);
gei.post('/get-user', authenticateJWT('access'), authorizeRoles(Roles.ADMIN), AdminController.getUserInfo);

export default gei;