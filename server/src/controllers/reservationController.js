import Reservation from '../models/Reservation.js';
import FoodListing from '../models/FoodListing.js';

const generatePickupCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
};

export const createReservation = async (req, res) => {
    try {
        const { listingId, quantity } = req.body;

        // Check if food exists and has quantity
        const listing = await FoodListing.findById(listingId);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.availableQuantity < quantity) return res.status(400).json({ message: 'Not enough quantity available' });
        if (listing.status !== 'AVAILABLE') return res.status(400).json({ message: 'Food is no longer available' });
        if (new Date(listing.expiryTime) < new Date()) return res.status(400).json({ message: 'Food has expired' });

        // Deduct quantity
        listing.availableQuantity -= quantity;
        if (listing.availableQuantity === 0) {
            listing.status = 'RESERVED';
        }
        await listing.save();

        const reservation = new Reservation({
            foodListing: listingId,
            receiver: req.user.id,
            quantity,
            pickupCode: generatePickupCode()
        });

        await reservation.save();
        res.status(201).json(reservation);
    } catch (err) {
        res.status(400).json({ message: 'Error creating reservation', error: err.message });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ receiver: req.user.id })
            .populate({
                path: 'foodListing',
                populate: { path: 'supplier', select: 'name email' }
            })
            .sort({ createdAt: -1 });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reservations', error: err.message });
    }
};

export const markCollected = async (req, res) => {
    try {
        const { id } = req.params;
        const { pickupCode } = req.body;

        const reservation = await Reservation.findById(id).populate('foodListing');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        // Must be supplier to mark as collected in this version
        if (String(reservation.foodListing.supplier) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (reservation.pickupCode !== pickupCode) {
            return res.status(400).json({ message: 'Invalid pickup code' });
        }

        if (reservation.status === 'COLLECTED') {
            return res.status(400).json({ message: 'Already collected' });
        }

        reservation.status = 'COLLECTED';
        reservation.collectedAt = new Date();
        await reservation.save();

        // Optionally update user impact metrics here

        res.json({ message: 'Food successfully collected!', reservation });
    } catch (err) {
        res.status(400).json({ message: 'Error verifying collection', error: err.message });
    }
};
