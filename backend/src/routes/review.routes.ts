import express from "express";
import * as ReviewController from "../controllers/review.controllers";

const router = express.Router();

router.get("/:propertyId", ReviewController.getReviewsByProperty);

export default router;
