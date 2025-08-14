import express from "express";
import * as PropertyController from "../controllers/property.controllers";
import { verifyToken } from "../middlewares/auth.middlewares";
import {upload} from "../middlewares/upload.middlewares";
const router = express.Router();

router.post("/create-property", verifyToken, upload.array('images'), PropertyController.createProperty);
router.get("/", PropertyController.getAllProperties);
router.get("/:propertyId", PropertyController.getPropertyById);
router.patch("/:propertyId", verifyToken, PropertyController.updateProperty);
router.delete("/:propertyId", verifyToken, PropertyController.deleteProperty);

export default router;
