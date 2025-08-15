import express from "express";
import * as PropertyController from "../controllers/property.controllers";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = express.Router();

router.post("/", verifyToken, PropertyController.createProperty);

import { authorizeRoles, Roles, verifyToken } from "../middlewares/auth.middlewares";
import {upload} from "../middlewares/upload.middlewares";
const router = express.Router();

// router.post("/create-property", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER), upload.array('images'), PropertyController.createProperty);
router.get("/", PropertyController.getAllProperties);
router.get("/:propertyId", PropertyController.getPropertyById);
router.patch("/:propertyId", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER),PropertyController.updateProperty);
router.delete("/:propertyId", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER), PropertyController.deleteProperty);

export default router;
