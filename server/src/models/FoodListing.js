import mongoose from 'mongoose';

const foodListingSchema = new mongoose.Schema({
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // optional simple URL or path
    quantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },
    unit: { type: String, required: true }, // e.g., "meals", "kg", "items"
    foodType: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other'], required: true },
    dietaryInformation: { type: [String] },
    pickupStart: { type: Date, required: true },
    pickupEnd: { type: Date, required: true },
    expiryTime: { type: Date, required: true },
    location: { type: String, required: true },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'COLLECTED', 'EXPIRED', 'CANCELLED'], default: 'AVAILABLE' }
}, { timestamps: true });

export default mongoose.model('FoodListing', foodListingSchema);
