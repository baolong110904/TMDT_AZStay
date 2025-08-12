import express from "express";
import * as PropertyController from "../controllers/property.controllers";
import { verifyToken } from "../middlewares/auth.middlewares";

const router = express.Router();

router.post("/", verifyToken, PropertyController.createProperty);
router.get("/", PropertyController.getAllProperties);
router.get("/:propertyId", PropertyController.getPropertyById);
router.patch("/:propertyId", verifyToken, PropertyController.updateProperty);
router.delete("/:propertyId", verifyToken, PropertyController.deleteProperty);

export default router;
