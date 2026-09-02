import express from 'express';
import { createReservation, getMyReservations, markCollected } from '../controllers/reservationController.js';
import { authenticate, requireSupplier } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authenticate, getMyReservations);
router.post('/', authenticate, createReservation);
router.post('/:id/collect', authenticate, requireSupplier, markCollected);

export default router;
