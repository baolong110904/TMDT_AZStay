import express from 'express';
import { placeBid, getBidsForListing } from '../controller/bids.controller';

const router = express.Router();

router.post('/', placeBid);
router.get('/:listingId', getBidsForListing);

export default router;
