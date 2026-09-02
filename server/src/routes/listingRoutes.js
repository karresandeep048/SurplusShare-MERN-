import express from 'express';
import { createListing, getAllListings, getMyListings, updateListing, deleteListing, getListingById } from '../controllers/listingController.js';
import { authenticate, requireSupplier } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/my', authenticate, requireSupplier, getMyListings);
router.get('/:id', getListingById);
router.post('/', authenticate, requireSupplier, createListing);
router.put('/:id', authenticate, requireSupplier, updateListing);
router.patch('/:id', authenticate, requireSupplier, updateListing);
router.delete('/:id', authenticate, requireSupplier, deleteListing);

export default router;
