import express from 'express';
import { createListing, getAllListings, getMyListings, updateListing, getListingById } from '../controllers/listingController.js';
import { authenticate, requireSupplier } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/my', authenticate, requireSupplier, getMyListings);
router.get('/:id', getListingById);
router.post('/', authenticate, requireSupplier, createListing);
router.patch('/:id', authenticate, requireSupplier, updateListing);

export default router;
