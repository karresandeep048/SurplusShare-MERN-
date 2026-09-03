import Reservation from '../models/Reservation.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';
import { sendPickupAlertToDonor } from '../utils/emailService.js';

const generatePickupCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
};

// Helper: Auto-expire food listings and unclaimed reservations past expiry time
export const autoExpireItems = async () => {
    try {
        const now = new Date();
        
        // 1. Mark expired food listings that are still AVAILABLE or PARTIALLY_RESERVED
        await FoodListing.updateMany(
            { 
                expiryTime: { $lt: now },
                status: { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] }
            },
            { $set: { status: 'EXPIRED' } }
        );

        // 2. Mark unclaimed reservations on expired listings as EXPIRED
        const expiredListings = await FoodListing.find({ expiryTime: { $lt: now } }, '_id');
        const expiredListingIds = expiredListings.map(l => l._id);

        if (expiredListingIds.length > 0) {
            await Reservation.updateMany(
                {
                    foodListing: { $in: expiredListingIds },
                    status: 'RESERVED'
                },
                { $set: { status: 'EXPIRED' } }
            );
        }
    } catch (err) {
        console.error('Error running autoExpireItems:', err);
    }
};

export const createReservation = async (req, res) => {
    try {
        await autoExpireItems();

        const { listingId, quantity } = req.body;

        const listing = await FoodListing.findById(listingId).populate('supplier');
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (new Date(listing.expiryTime) < new Date()) {
            listing.status = 'EXPIRED';
            await listing.save();
            return res.status(400).json({ message: 'Food has expired and can no longer be reserved' });
        }
        if (listing.availableQuantity < quantity) return res.status(400).json({ message: 'Not enough quantity available' });
        if (listing.status !== 'AVAILABLE' && listing.status !== 'PARTIALLY_RESERVED') {
            return res.status(400).json({ message: 'Food is no longer available' });
        }

        // Deduct quantity
        listing.availableQuantity -= quantity;
        if (listing.availableQuantity === 0) {
            listing.status = 'RESERVED';
        } else {
            listing.status = 'PARTIALLY_RESERVED';
        }
        await listing.save();

        const pickupCode = generatePickupCode();
        const reservation = new Reservation({
            foodListing: listingId,
            receiver: req.user.id,
            quantity,
            pickupCode
        });

        await reservation.save();

        // Asynchronously dispatch email notification to the Food Poster (Donor)
        const receiver = await User.findById(req.user.id);
        if (listing.supplier && receiver && listing.supplier.email) {
            sendPickupAlertToDonor({
                supplierEmail: listing.supplier.email,
                supplierName: listing.supplier.name || 'Food Donor',
                receiverName: receiver.name || 'Community Member',
                receiverEmail: receiver.email,
                foodName: listing.foodName,
                quantity,
                unit: listing.unit,
                pickupCode,
                pickupLocation: listing.location,
                pickupStart: listing.pickupStart,
                pickupEnd: listing.pickupEnd
            }).catch(e => console.error('Donor email dispatch error:', e));
        }

        res.status(201).json(reservation);
    } catch (err) {
        res.status(400).json({ message: 'Error creating reservation', error: err.message });
    }
};

// Receiver views their own reservations
export const getMyReservations = async (req, res) => {
    try {
        await autoExpireItems();

        const reservations = await Reservation.find({ receiver: req.user.id })
            .populate({
                path: 'foodListing',
                populate: { path: 'supplier', select: 'name email location profileImage' }
            })
            .sort({ createdAt: -1 });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reservations', error: err.message });
    }
};

// Supplier views reservations for all their food donations
export const getSupplierReservations = async (req, res) => {
    try {
        await autoExpireItems();

        // Find all listings posted by this supplier
        const myListings = await FoodListing.find({ supplier: req.user.id }, '_id');
        const listingIds = myListings.map(l => l._id);

        const reservations = await Reservation.find({ foodListing: { $in: listingIds } })
            .populate('foodListing')
            .populate('receiver', 'name email mealsRescued profileImage')
            .sort({ createdAt: -1 });

        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching supplier reservations', error: err.message });
    }
};

// Receiver notifies donor that they have arrived at the pickup location
export const notifyArrival = async (req, res) => {
    try {
        const { pickupCode, reservationId } = req.body;

        const query = pickupCode ? { pickupCode } : { _id: reservationId };
        const reservation = await Reservation.findOne(query)
            .populate({
                path: 'foodListing',
                populate: { path: 'supplier', select: 'name email' }
            })
            .populate('receiver', 'name email');

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.pickerArrived = true;
        reservation.arrivedAt = new Date();
        await reservation.save();

        res.json({
            success: true,
            message: 'Donor notified! You have arrived at the pickup location.',
            reservation
        });
    } catch (err) {
        res.status(400).json({ message: 'Error updating arrival status', error: err.message });
    }
};

// Receiver manually triggers sending/resending verification code email to the food donor / poster
export const notifyDonorByEmail = async (req, res) => {
    try {
        const { pickupCode, reservationId, customDonorEmail } = req.body;
        const query = reservationId ? { _id: reservationId } : { pickupCode };

        const reservation = await Reservation.findOne(query)
            .populate({
                path: 'foodListing',
                populate: { path: 'supplier', select: 'name email location' }
            })
            .populate('receiver', 'name email');

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const targetDonorEmail = customDonorEmail || reservation.foodListing?.supplier?.email;
        if (!targetDonorEmail) {
            return res.status(400).json({ message: 'Food donor email address not found.' });
        }

        const supplierName = reservation.foodListing?.supplier?.name || 'Food Donor';
        const receiverName = reservation.receiver?.name || req.user?.name || 'Community Member';
        const receiverEmail = reservation.receiver?.email || req.user?.email;
        const foodName = reservation.foodListing?.foodName || 'Surplus Food';

        const emailResult = await sendPickupAlertToDonor({
            supplierEmail: targetDonorEmail,
            supplierName,
            receiverName,
            receiverEmail,
            foodName,
            quantity: reservation.quantity,
            unit: reservation.foodListing?.unit || 'portions',
            pickupCode: reservation.pickupCode,
            pickupLocation: reservation.foodListing?.location || 'Designated Venue',
            pickupStart: reservation.foodListing?.pickupStart,
            pickupEnd: reservation.foodListing?.pickupEnd
        });

        const isRealDelivered = emailResult?.delivered === true;

        res.json({
            success: true,
            delivered: isRealDelivered,
            simulated: !isRealDelivered,
            targetDonorEmail,
            message: isRealDelivered 
                ? `🎉 Verification code & pickup alert delivered to food poster (${targetDonorEmail})!`
                : `ℹ️ Pickup pass alert logged for donor (${targetDonorEmail}).`,
            pickupCode: reservation.pickupCode,
            emailResult
        });
    } catch (err) {
        console.error('Error notifying donor by email:', err);
        res.status(500).json({ message: 'Failed to send email to food donor', error: err.message });
    }
};

// Supplier enters and matches 6-digit code to complete food handover
export const verifyPickupCode = async (req, res) => {
    try {
        await autoExpireItems();

        const { pickupCode } = req.body;

        if (!pickupCode || String(pickupCode).trim().length === 0) {
            return res.status(400).json({ message: 'Please provide a 6-digit pickup code' });
        }

        const cleanCode = String(pickupCode).trim();
        const reservation = await Reservation.findOne({ pickupCode: cleanCode })
            .populate('foodListing')
            .populate('receiver', 'name email');

        if (!reservation) {
            return res.status(404).json({ message: 'Invalid pickup code. No matching reservation found.' });
        }

        // Verify supplier ownership
        if (String(reservation.foodListing.supplier) !== String(req.user.id)) {
            return res.status(403).json({ message: 'This pickup code is for a different donor.' });
        }

        if (reservation.status === 'COLLECTED') {
            return res.status(400).json({ message: 'This food reservation has already been collected.' });
        }

        if (reservation.status === 'EXPIRED') {
            return res.status(400).json({ message: 'This reservation has expired.' });
        }

        // Mark reservation collected
        reservation.status = 'COLLECTED';
        reservation.collectedAt = new Date();
        await reservation.save();

        // Update listing status if all portions collected
        const listing = reservation.foodListing;
        if (listing.availableQuantity === 0) {
            listing.status = 'COLLECTED';
            await listing.save();
        }

        // Increment meals rescued for receiver
        await User.findByIdAndUpdate(reservation.receiver._id, {
            $inc: { mealsRescued: reservation.quantity || 1 }
        });

        // Increment meals rescued for supplier
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { mealsRescued: reservation.quantity || 1 }
        });

        res.json({
            success: true,
            message: `🎉 Handover confirmed! ${reservation.quantity} ${listing.unit} collected successfully.`,
            reservation
        });
    } catch (err) {
        res.status(400).json({ message: 'Error verifying pickup code', error: err.message });
    }
};

// Legacy markCollected by ID
export const markCollected = async (req, res) => {
    try {
        const { id } = req.params;
        const { pickupCode } = req.body;

        const reservation = await Reservation.findById(id).populate('foodListing').populate('receiver');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        if (String(reservation.foodListing.supplier) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (String(reservation.pickupCode).trim() !== String(pickupCode).trim()) {
            return res.status(400).json({ message: 'Invalid pickup code' });
        }

        if (reservation.status === 'COLLECTED') {
            return res.status(400).json({ message: 'Already collected' });
        }

        reservation.status = 'COLLECTED';
        reservation.collectedAt = new Date();
        await reservation.save();

        // Increment impact metrics
        await User.findByIdAndUpdate(reservation.receiver._id, {
            $inc: { mealsRescued: reservation.quantity || 1 }
        });

        res.json({ message: 'Food successfully collected!', reservation });
    } catch (err) {
        res.status(400).json({ message: 'Error verifying collection', error: err.message });
    }
};

// Receiver cancels an active reservation, restoring available quantity
export const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id).populate('foodListing');
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Verify ownership (receiver or supplier of the food)
        const isReceiver = String(reservation.receiver) === String(req.user.id);
        const isSupplier = reservation.foodListing && String(reservation.foodListing.supplier) === String(req.user.id);
        
        if (!isReceiver && !isSupplier && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to cancel this reservation' });
        }

        if (reservation.status === 'COLLECTED') {
            return res.status(400).json({ message: 'Cannot cancel an already collected reservation' });
        }

        if (reservation.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Reservation is already cancelled' });
        }

        reservation.status = 'CANCELLED';
        await reservation.save();

        // Restore quantity to listing if listing exists and is not expired
        const listing = reservation.foodListing;
        if (listing && listing.status !== 'EXPIRED') {
            const restoredQty = Math.min(listing.quantity, (listing.availableQuantity || 0) + (reservation.quantity || 1));
            listing.availableQuantity = restoredQty;
            listing.status = restoredQty === listing.quantity ? 'AVAILABLE' : 'PARTIALLY_RESERVED';
            await listing.save();
        }

        res.json({
            success: true,
            message: 'Reservation cancelled successfully and portions returned to community pool.',
            reservation
        });
    } catch (err) {
        res.status(400).json({ message: 'Error cancelling reservation', error: err.message });
    }
};
