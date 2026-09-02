import FoodListing from '../models/FoodListing.js';

export const createListing = async (req, res) => {
    try {
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
        // Basic filter for non-expired, available listings. 
        const listings = await FoodListing.find({ status: 'AVAILABLE', expiryTime: { $gt: new Date() } })
            .populate('supplier', 'name role')
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching listings', error: err.message });
    }
};

export const getMyListings = async (req, res) => {
    try {
        const listings = await FoodListing.find({ supplier: req.user.id }).sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user listings', error: err.message });
    }
};

export const updateListing = async (req, res) => {
    try {
        const listing = await FoodListing.findOneAndUpdate(
            { _id: req.params.id, supplier: req.user.id },
            req.body,
            { new: true }
        );
        if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
        res.json(listing);
    } catch (err) {
        res.status(400).json({ message: 'Error updating listing', error: err.message });
    }
};

export const getListingById = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id).populate('supplier', 'name role');
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching listing', error: err.message });
    }
};
