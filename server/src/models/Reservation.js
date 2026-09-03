import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    foodListing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    pickupCode: { type: String, required: true },
    status: { type: String, enum: ['RESERVED', 'COLLECTED', 'CANCELLED', 'EXPIRED'], default: 'RESERVED' },
    pickerArrived: { type: Boolean, default: false },
    arrivedAt: { type: Date },
    reservedAt: { type: Date, default: Date.now },
    collectedAt: { type: Date },
    receiverLocation: {
        lat: { type: Number },
        lng: { type: Number },
        updatedAt: { type: Date }
    }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
