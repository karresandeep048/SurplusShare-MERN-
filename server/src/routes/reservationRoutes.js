import express from 'express';
import { 
    createReservation, 
    getMyReservations, 
    getSupplierReservations, 
    getReservationByCode,
    notifyArrival, 
    notifyDonorByEmail,
    verifyPickupCode, 
    markCollected,
    cancelReservation
} from '../controllers/reservationController.js';
import { authenticate, requireSupplier } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authenticate, getMyReservations);
router.get('/supplier', authenticate, requireSupplier, getSupplierReservations);
router.get('/track/:code', authenticate, getReservationByCode);
router.post('/', authenticate, createReservation);
router.post('/notify-arrival', authenticate, notifyArrival);
router.post('/notify-donor-email', authenticate, notifyDonorByEmail);
router.post('/verify-code', authenticate, requireSupplier, verifyPickupCode);
router.post('/:id/collect', authenticate, requireSupplier, markCollected);
router.post('/:id/cancel', authenticate, cancelReservation);

export default router;
