import FoodListing from '../models/FoodListing.js';
import { autoExpireItems } from './reservationController.js';

export const createListing = async (req, res) => {
    try {
        await autoExpireItems();

        const listing = new FoodListing({
            ...req.body,
            supplier: req.user.id,
            availableQuantity: req.body.quantity, // initially available equals requested
            status: 'AVAILABLE'
        });
        await listing.save();
        res.status(201).json(listing);
    } catch (err) {
        res.status(400).json({ message: 'Error creating listing', error: err.message });
    }
};

export const getAllListings = async (req, res) => {
    try {
        await autoExpireItems();

        // Basic filter for non-expired, available listings. 
        const listings = await FoodListing.find({ 
            status: { $in: ['AVAILABLE', 'PARTIALLY_RESERVED'] }, 
            expiryTime: { $gt: new Date() } 
        })
            .populate('supplier', 'name role')
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching listings', error: err.message });
    }
};

export const getMyListings = async (req, res) => {
    try {
        await autoExpireItems();

        const listings = await FoodListing.find({ supplier: req.user.id }).sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user listings', error: err.message });
    }
};

export const updateListing = async (req, res) => {
    try {
        await autoExpireItems();

        const current = await FoodListing.findOne({ _id: req.params.id, supplier: req.user.id });
        if (!current) return res.status(404).json({ message: 'Listing not found or unauthorized' });

        const updates = { ...req.body };
        // If quantity is updated, adjust availableQuantity proportionally
        if (updates.quantity !== undefined && updates.availableQuantity === undefined) {
            const reservedDiff = current.quantity - current.availableQuantity;
            updates.availableQuantity = Math.max(0, updates.quantity - reservedDiff);
            if (updates.availableQuantity > 0 && current.status === 'RESERVED') {
                updates.status = 'PARTIALLY_RESERVED';
            }
        }

        const listing = await FoodListing.findOneAndUpdate(
            { _id: req.params.id, supplier: req.user.id },
            { $set: updates },
            { returnDocument: 'after' }
        );
        res.json(listing);
    } catch (err) {
        res.status(400).json({ message: 'Error updating listing', error: err.message });
    }
};

export const deleteListing = async (req, res) => {
    try {
        const listing = await FoodListing.findOneAndDelete({ _id: req.params.id, supplier: req.user.id });
        if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting listing', error: err.message });
    }
};

export const getListingById = async (req, res) => {
    try {
        await autoExpireItems();

        const listing = await FoodListing.findById(req.params.id).populate('supplier', 'name role profileImage location');
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching listing', error: err.message });
    }
};
