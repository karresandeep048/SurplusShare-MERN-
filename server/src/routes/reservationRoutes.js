import express from 'express';
import { 
    createReservation, 
    getMyReservations, 
    getSupplierReservations, 
    notifyArrival, 
    verifyPickupCode, 
    markCollected,
    cancelReservation,
    resendEmailPass,
    sendCustomTestEmail
} from '../controllers/reservationController.js';
import { authenticate, requireSupplier } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authenticate, getMyReservations);
router.get('/supplier', authenticate, requireSupplier, getSupplierReservations);
router.post('/', authenticate, createReservation);
router.post('/notify-arrival', authenticate, notifyArrival);
router.post('/resend-email', authenticate, resendEmailPass);
router.post('/test-email', authenticate, sendCustomTestEmail);
router.post('/verify-code', authenticate, requireSupplier, verifyPickupCode);
router.post('/:id/collect', authenticate, requireSupplier, markCollected);
router.post('/:id/cancel', authenticate, cancelReservation);

export default router;
