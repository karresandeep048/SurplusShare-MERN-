import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import Reservation from '../models/Reservation.js';
import { seedDB } from './seed.js';

dotenv.config();

export const seedResetDB = async () => {
    try {
        const SEED_DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/surplusshare';
        await mongoose.connect(SEED_DB_URI);
        console.log('Connected to DB for Reset...');

        console.log('⚠️ DESTRUCTIVE RESET: Clearing existing data...');
        await User.deleteMany({});
        await FoodListing.deleteMany({});
        await Reservation.deleteMany({});
        console.log('✅ Cleared all data.');

        // Re-seed using the main idempotent seed function
        await seedDB(false);

        console.log('✅ Reset Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seed reset error:', err);
        process.exit(1);
    }
};

const isMain = process.argv[1] && process.argv[1].endsWith('seedReset.js');
if (isMain) {
    seedResetDB();
}
