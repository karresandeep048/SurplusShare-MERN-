import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    pickupCode: { type: String, required: true },
    status: { type: String, enum: ['RESERVED', 'COLLECTED', 'CANCELLED'], default: 'RESERVED' },
    reservedAt: { type: Date, default: Date.now },
    collectedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
