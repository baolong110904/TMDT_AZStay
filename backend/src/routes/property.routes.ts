import express from "express";
import * as PropertyController from "../controllers/property.controllers";
import * as UploadPropertyImagesController from "../controllers/uploadPropertyImages.controllers";
import { authorizeRoles, Roles, verifyToken } from "../middlewares/auth.middlewares";
import {upload} from "../middlewares/upload.middlewares";
const router = express.Router();

// router.post("/create-property", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER), upload.array('images'), PropertyController.createProperty);
router.get("/", PropertyController.getAllProperties);
// get property by user_id (place before dynamic :propertyId route)
router.get('/get-property-by-user-id',
            verifyToken,
            authorizeRoles(Roles.PROPERTY_OWNER, Roles.PROPERTY_OWNER_AND_CUSTOMER),
            PropertyController.getPropertyByUserId);

router.get("/:propertyId", PropertyController.getPropertyById);
router.patch("/:propertyId", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER),PropertyController.updateProperty);
router.delete("/:propertyId", verifyToken, authorizeRoles(Roles.PROPERTY_OWNER_AND_CUSTOMER, Roles.PROPERTY_OWNER), PropertyController.deleteProperty);
router.post('/create-property', 
            verifyToken,
            authorizeRoles(Roles.PROPERTY_OWNER, Roles.CUSTOMER, Roles.PROPERTY_OWNER_AND_CUSTOMER), 
            upload.array('images'),
            PropertyController.createProperty);
// upload images for an existing property
router.post('/upload-images',
            verifyToken,
            authorizeRoles(Roles.PROPERTY_OWNER, Roles.PROPERTY_OWNER_AND_CUSTOMER),
            upload.array('images'),
            UploadPropertyImagesController.uploadPropertyImagesController);

export default router;