import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import Reservation from '../models/Reservation.js';

dotenv.config();

export const cleanDB = async () => {
    try {
        const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(DB_URI);
        console.log('✓ Connected successfully.');

        // 1. Delete all sample food listing items
        const listingResult = await FoodListing.deleteMany({});
        console.log(`✓ Deleted ${listingResult.deletedCount} sample food listing items.`);

        // 2. Delete all sample reservations
        const reservationResult = await Reservation.deleteMany({});
        console.log(`✓ Deleted ${reservationResult.deletedCount} sample reservation items.`);

        // 3. Reset rescue metrics on user accounts
        const resetResult = await User.updateMany({}, { $set: { mealsRescued: 0 } });
        console.log(`✓ Reset rescue metrics on ${resetResult.modifiedCount} user accounts.`);

        // 4. Ensure the demo accounts exist and are ready for 1-click testing
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        await User.findOneAndUpdate(
            { email: 'demo.supplier@surplusshare.com' },
            {
                name: 'Green Bowl Restaurant',
                email: 'demo.supplier@surplusshare.com',
                password: hashedPassword,
                role: 'supplier',
                location: 'Indiranagar, Bengaluru',
                mealsRescued: 0
            },
            { upsert: true, returnDocument: 'after' }
        );

        await User.findOneAndUpdate(
            { email: 'demo.receiver@surplusshare.com' },
            {
                name: 'Arjun',
                email: 'demo.receiver@surplusshare.com',
                password: hashedPassword,
                role: 'receiver',
                location: 'Koramangala, Bengaluru',
                mealsRescued: 0
            },
            { upsert: true, returnDocument: 'after' }
        );

        await User.findOneAndUpdate(
            { email: 'demo.admin@surplusshare.com' },
            {
                name: 'SurplusShare Admin',
                email: 'demo.admin@surplusshare.com',
                password: hashedPassword,
                role: 'admin',
                location: 'Bengaluru, India',
                mealsRescued: 0
            },
            { upsert: true, returnDocument: 'after' }
        );

        const totalUsers = await User.countDocuments();
        const totalListings = await FoodListing.countDocuments();
        const totalReservations = await Reservation.countDocuments();

        console.log(`\n📊 Database State:`);
        console.log(`- Food Listings: ${totalListings}`);
        console.log(`- Reservations: ${totalReservations}`);
        console.log(`- User Accounts: ${totalUsers}`);

        console.log('\n✅ Successfully removed all sample items from MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Clean DB error:', err);
        process.exit(1);
    }
};

const isMain = process.argv[1] && process.argv[1].endsWith('cleanDB.js');
if (isMain) {
    cleanDB();
}
