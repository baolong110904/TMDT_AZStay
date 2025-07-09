import express from 'express';
import { getListings, createListing } from '../controller/listings.controller';

const router = express.Router();

router.get('/', getListings);
router.post('/', createListing);

export default router;
