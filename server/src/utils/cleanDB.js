import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import Reservation from '../models/Reservation.js';

dotenv.config();

export const cleanDB = async () => {
    try {
        const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/surplusshare';
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(DB_URI);
        console.log('✓ Connected successfully.');

        // 1. Delete all Food Listings
        const listingResult = await FoodListing.deleteMany({});
        console.log(`✓ Deleted ${listingResult.deletedCount} food listing items.`);

        // 2. Delete all Reservations
        const reservationResult = await Reservation.deleteMany({});
        console.log(`✓ Deleted ${reservationResult.deletedCount} reservation items.`);

        // 3. Remove demo accounts (e.g., demo.* and *@demo.com)
        const demoUserResult = await User.deleteMany({
            $or: [
                { email: { $regex: /@demo\.com$/i } },
                { email: { $regex: /^demo\./i } }
            ]
        });
        console.log(`✓ Deleted ${demoUserResult.deletedCount} demo user accounts.`);

        // 4. Reset rescue metrics on remaining registered user accounts
        const resetResult = await User.updateMany({}, { $set: { mealsRescued: 0 } });
        console.log(`✓ Reset rescue metrics on ${resetResult.modifiedCount} registered user accounts.`);

        const remainingUsers = await User.find({}, 'name email role');
        console.log('\nRemaining active registered users:');
        remainingUsers.forEach(u => console.log(` - ${u.name} (${u.email}) [${u.role}]`));

        console.log('\n✅ Successfully removed all test items from the database!');
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
