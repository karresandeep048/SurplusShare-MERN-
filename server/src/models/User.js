import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['supplier', 'receiver', 'admin'], required: true },
    profileImage: { type: String },
    dietaryPreferences: { type: [String] },
    location: { type: String },
    mealsRescued: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
