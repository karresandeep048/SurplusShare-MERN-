import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import Reservation from '../models/Reservation.js';

dotenv.config();

export const seedDB = async (isStandalone = true) => {
    try {
        if (isStandalone) {
            const SEED_DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/surplusshare';
            await mongoose.connect(SEED_DB_URI);
            console.log('Connecting to MongoDB...');
            console.log('Connected successfully.');
        }

        console.log('Seeding Users...');
        let usersCreated = 0;
        let foodCreated = 0;
        let reservationsCreated = 0;

        const hashedPass = await bcrypt.hash('password123', 10);

        const upsertUser = async (email, data) => {
            const user = await User.findOneAndUpdate(
                { email },
                { $set: data },
                { new: true, upsert: true }
            );
            return user;
        };

        // SUPPLIERS
        const greenBowl = await upsertUser('demo.supplier@surplusshare.com', { name: 'Green Bowl Restaurant', password: hashedPass, role: 'supplier', profileImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=150&auto=format&fit=crop', location: 'Bengaluru, India' });
        const sunriseBakery = await upsertUser('sunrise@demo.com', { name: 'Sunrise Bakery', password: hashedPass, role: 'supplier', profileImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150&auto=format&fit=crop', location: 'Bengaluru, India' });
        const campusCanteen = await upsertUser('campus@demo.com', { name: 'Campus Canteen', password: hashedPass, role: 'supplier', location: 'Bengaluru, India' });
        const freshHarvest = await upsertUser('fresh@demo.com', { name: 'Fresh Harvest Grocery', password: hashedPass, role: 'supplier', location: 'Bengaluru, India' });
        const cityCafe = await upsertUser('citycafe@demo.com', { name: 'City Cafe', password: hashedPass, role: 'supplier', location: 'Bengaluru, India' });
        const grandEvents = await upsertUser('grandevents@demo.com', { name: 'Grand Events Catering', password: hashedPass, role: 'supplier', location: 'Bengaluru, India' });
        usersCreated += 6;

        // RECEIVERS
        const arjun = await upsertUser('demo.receiver@surplusshare.com', { name: 'Arjun', password: hashedPass, role: 'receiver', mealsRescued: 25, profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop', dietaryPreferences: ['Vegetarian'], location: 'Bengaluru, India' });
        const priya = await upsertUser('priya@demo.com', { name: 'Priya', password: hashedPass, role: 'receiver', mealsRescued: 18, dietaryPreferences: ['Vegan'], location: 'Bengaluru, India' });
        const rahul = await upsertUser('rahul@demo.com', { name: 'Rahul', password: hashedPass, role: 'receiver', dietaryPreferences: ['Vegetarian'], location: 'Bengaluru, India' });
        const sneha = await upsertUser('sneha@demo.com', { name: 'Sneha', password: hashedPass, role: 'receiver', location: 'Bengaluru, India' });
        const communityKitchen = await upsertUser('community@demo.com', { name: 'Community Kitchen', password: hashedPass, role: 'receiver', location: 'Bengaluru, India' });
        const helpingHands = await upsertUser('helpinghands@demo.com', { name: 'Helping Hands NGO', password: hashedPass, role: 'receiver', mealsRescued: 105, location: 'Bengaluru, India' });
        usersCreated += 6;

        // ADMIN
        const admin = await upsertUser('demo.admin@surplusshare.com', { name: 'Demo Admin', password: hashedPass, role: 'admin', location: 'Bengaluru, India' });
        usersCreated += 1;

        console.log(`✓ Users created/updated: ${usersCreated}`);

        console.log('Seeding Food Listings...');

        const now = new Date();
        const addHours = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);
        const subHours = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000);

        const upsertListing = async (foodName, data) => {
            // Find by foodName to remain idempotent (assuming names are unique in demo)
            const listing = await FoodListing.findOneAndUpdate(
                { foodName },
                { $set: data },
                { new: true, upsert: true }
            );
            return listing;
        };

        const listingsData = [
            { supplier: greenBowl._id, foodName: 'Vegetable Biryani', description: 'Surplus lunch buffet. Freshly packed!', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600', quantity: 20, availableQuantity: 15, unit: 'meals', foodType: 'Vegetarian', dietaryInformation: ['No Dairy'], pickupStart: now, pickupEnd: addHours(3), expiryTime: addHours(4), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9352, lng: 77.6245 }, status: 'AVAILABLE' },
            { supplier: sunriseBakery._id, foodName: 'Fresh Bread Basket', description: 'Assorted artisan breads.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600', quantity: 10, availableQuantity: 0, unit: 'baskets', foodType: 'Vegetarian', dietaryInformation: [], pickupStart: subHours(1), pickupEnd: addHours(1), expiryTime: addHours(2), location: 'Indiranagar, Bengaluru', coordinates: { lat: 12.9716, lng: 77.6411 }, status: 'COLLECTED' },
            { supplier: freshHarvest._id, foodName: 'Mixed Fruit Basket', description: 'Perfectly edible apples and bananas.', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600', quantity: 5, availableQuantity: 5, unit: 'kg', foodType: 'Vegan', dietaryInformation: ['Organic'], pickupStart: now, pickupEnd: addHours(5), expiryTime: addHours(24), location: 'Jayanagar, Bengaluru', coordinates: { lat: 12.9279, lng: 77.5871 }, status: 'AVAILABLE' },
            { supplier: greenBowl._id, foodName: 'Dal Tadka & Rice', description: 'Classic comfort food.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600', quantity: 15, availableQuantity: 5, unit: 'meals', foodType: 'Vegetarian', dietaryInformation: ['Gluten-Free'], pickupStart: addHours(1), pickupEnd: addHours(3), expiryTime: addHours(4), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9360, lng: 77.6250 }, status: 'PARTIALLY_RESERVED' },
            { supplier: sunriseBakery._id, foodName: 'Assorted Muffins', description: 'Blueberry and chocolate chip muffins.', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600', quantity: 24, availableQuantity: 10, unit: 'items', foodType: 'Vegetarian', dietaryInformation: ['Contains Nuts'], pickupStart: now, pickupEnd: addHours(2), expiryTime: addHours(5), location: 'Indiranagar, Bengaluru', coordinates: { lat: 12.9720, lng: 77.6400 }, status: 'PARTIALLY_RESERVED' },
            { supplier: greenBowl._id, foodName: 'Paneer Curry', description: 'Rich paneer butter masala.', image: 'https://images.unsplash.com/photo-1589301773099-dc30bd47a7b9?q=80&w=600', quantity: 10, availableQuantity: 0, unit: 'portions', foodType: 'Vegetarian', dietaryInformation: ['Contains Dairy'], pickupStart: subHours(10), pickupEnd: subHours(8), expiryTime: subHours(5), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9352, lng: 77.6245 }, status: 'EXPIRED' },
            { supplier: freshHarvest._id, foodName: 'Seasonal Vegetables Box', description: 'Tomatoes, onions, potatoes.', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=600', quantity: 8, availableQuantity: 8, unit: 'boxes', foodType: 'Vegan', dietaryInformation: ['Organic'], pickupStart: now, pickupEnd: addHours(8), expiryTime: addHours(48), location: 'Jayanagar, Bengaluru', coordinates: { lat: 12.9279, lng: 77.5871 }, status: 'AVAILABLE' },
            { supplier: grandEvents._id, foodName: 'Event Catering Meals', description: 'Leftover premium event catering meals.', image: 'https://images.unsplash.com/photo-1626778937989-18ba4d84f23b?q=80&w=600', quantity: 50, availableQuantity: 50, unit: 'meals', foodType: 'Vegetarian', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(5), expiryTime: addHours(8), location: 'Whitefield, Bengaluru', coordinates: { lat: 12.9698, lng: 77.7499 }, status: 'AVAILABLE' },
            { supplier: campusCanteen._id, foodName: 'Chapati Pack', description: 'Freshly made chapatis.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600', quantity: 30, availableQuantity: 30, unit: 'packs', foodType: 'Vegetarian', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(4), expiryTime: addHours(6), location: 'C V Raman Nagar, Bengaluru', coordinates: { lat: 12.9859, lng: 77.6625 }, status: 'AVAILABLE' },
            { supplier: sunriseBakery._id, foodName: 'Fresh Croissants', description: 'Buttery croissants from morning batch.', image: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?q=80&w=600', quantity: 15, availableQuantity: 15, unit: 'pieces', foodType: 'Vegetarian', dietaryInformation: ['Contains Dairy', 'Contains Gluten'], pickupStart: now, pickupEnd: addHours(1), expiryTime: addHours(2), location: 'Indiranagar, Bengaluru', coordinates: { lat: 12.9716, lng: 77.6411 }, status: 'AVAILABLE' }, // urgent soon
            { supplier: cityCafe._id, foodName: 'Pasta Boxes', description: 'Arrabbiata pasta.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600', quantity: 12, availableQuantity: 0, unit: 'boxes', foodType: 'Vegetarian', dietaryInformation: ['Contains Gluten'], pickupStart: now, pickupEnd: addHours(3), expiryTime: addHours(5), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9340, lng: 77.6250 }, status: 'RESERVED' },
            { supplier: freshHarvest._id, foodName: 'Salad Bowls', description: 'Greek salad without dressing.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600', quantity: 8, availableQuantity: 8, unit: 'bowls', foodType: 'Vegetarian', dietaryInformation: ['Contains Dairy'], pickupStart: now, pickupEnd: addHours(2), expiryTime: addHours(3), location: 'Jayanagar, Bengaluru', coordinates: { lat: 12.9279, lng: 77.5871 }, status: 'AVAILABLE' },
            { supplier: cityCafe._id, foodName: 'Vegetable Wraps', description: 'Grilled vegetable and hummus wraps.', image: 'https://images.unsplash.com/photo-1626779435860-f1db4281f621?q=80&w=600', quantity: 20, availableQuantity: 20, unit: 'wraps', foodType: 'Vegan', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(4), expiryTime: addHours(6), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9340, lng: 77.6250 }, status: 'AVAILABLE' },
            { supplier: campusCanteen._id, foodName: 'Lemon Rice', description: 'South Indian lemon rice.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600', quantity: 25, availableQuantity: 5, unit: 'meals', foodType: 'Vegan', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(3), expiryTime: addHours(5), location: 'C V Raman Nagar, Bengaluru', coordinates: { lat: 12.9859, lng: 77.6625 }, status: 'PARTIALLY_RESERVED' },
            { supplier: grandEvents._id, foodName: 'Bakery Assortment', description: 'Desserts from yesterday\'s event.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600', quantity: 15, availableQuantity: 0, unit: 'boxes', foodType: 'Vegetarian', dietaryInformation: ['Contains Dairy', 'Contains Sugar'], pickupStart: subHours(5), pickupEnd: subHours(1), expiryTime: subHours(0.5), location: 'Whitefield, Bengaluru', coordinates: { lat: 12.9698, lng: 77.7499 }, status: 'EXPIRED' },
            { supplier: greenBowl._id, foodName: 'Rice & Curry Meals', description: 'Standard thali packaging.', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600', quantity: 40, availableQuantity: 40, unit: 'meals', foodType: 'Vegetarian', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(5), expiryTime: addHours(8), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9352, lng: 77.6245 }, status: 'AVAILABLE' },
            { supplier: freshHarvest._id, foodName: 'Fresh Bananas', description: 'Slightly spotted but good.', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=600', quantity: 40, availableQuantity: 40, unit: 'items', foodType: 'Vegan', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(12), expiryTime: addHours(48), location: 'Jayanagar, Bengaluru', coordinates: { lat: 12.9279, lng: 77.5871 }, status: 'AVAILABLE' },
            { supplier: campusCanteen._id, foodName: 'Vegetable Pulao', description: 'Flavorful pulao made in bulk.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600', quantity: 30, availableQuantity: 30, unit: 'plates', foodType: 'Vegetarian', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(2), expiryTime: addHours(4), location: 'C V Raman Nagar, Bengaluru', coordinates: { lat: 12.9859, lng: 77.6625 }, status: 'AVAILABLE' },
            { supplier: sunriseBakery._id, foodName: 'Vegetable Sandwiches', description: 'Cheese and veggie sandwiches.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600', quantity: 15, availableQuantity: 0, unit: 'sandwiches', foodType: 'Vegetarian', dietaryInformation: ['Contains Dairy', 'Contains Gluten'], pickupStart: subHours(1), pickupEnd: addHours(2), expiryTime: addHours(3), location: 'Indiranagar, Bengaluru', coordinates: { lat: 12.9716, lng: 77.6411 }, status: 'CANCELLED' },
            { supplier: grandEvents._id, foodName: 'Snack Boxes', description: 'Assorted fried snacks.', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=600', quantity: 10, availableQuantity: 0, unit: 'boxes', foodType: 'Vegetarian', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(3), expiryTime: addHours(6), location: 'Whitefield, Bengaluru', coordinates: { lat: 12.9698, lng: 77.7499 }, status: 'COLLECTED' },
            { supplier: cityCafe._id, foodName: 'Chocolate Brownies', description: 'Assorted walnut and plain brownies.', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600', quantity: 15, availableQuantity: 15, unit: 'pieces', foodType: 'Vegetarian', dietaryInformation: ['Contains Dairy', 'Contains Gluten'], pickupStart: now, pickupEnd: addHours(3), expiryTime: addHours(24), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9340, lng: 77.6250 }, status: 'AVAILABLE' },
            { supplier: greenBowl._id, foodName: 'Idli Sambar', description: 'Leftover breakfast batch.', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=600', quantity: 20, availableQuantity: 20, unit: 'portions', foodType: 'Vegan', dietaryInformation: [], pickupStart: subHours(1), pickupEnd: addHours(1), expiryTime: addHours(3), location: 'Koramangala, Bengaluru', coordinates: { lat: 12.9352, lng: 77.6245 }, status: 'AVAILABLE' },
            { supplier: freshHarvest._id, foodName: 'Mangoes Box', description: 'Ripe Alphonso mangoes.', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600', quantity: 12, availableQuantity: 12, unit: 'kgs', foodType: 'Vegan', dietaryInformation: [], pickupStart: now, pickupEnd: addHours(10), expiryTime: addHours(48), location: 'Jayanagar, Bengaluru', coordinates: { lat: 12.9279, lng: 77.5871 }, status: 'AVAILABLE' },
            { supplier: grandEvents._id, foodName: 'Mini Pizzas', description: 'Leftover event starters.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600', quantity: 40, availableQuantity: 40, unit: 'pieces', foodType: 'Vegetarian', dietaryInformation: ['Contains Gluten', 'Contains Dairy'], pickupStart: now, pickupEnd: addHours(2), expiryTime: addHours(5), location: 'Whitefield, Bengaluru', coordinates: { lat: 12.9698, lng: 77.7499 }, status: 'AVAILABLE' }
        ];

        let listings = [];
        for (const data of listingsData) {
            const doc = await upsertListing(data.foodName, data);
            listings.push(doc);
            foodCreated++;
        }

        console.log(`✓ Food listings created/updated: ${foodCreated}`);

        console.log('Seeding Reservations...');

        const upsertReservation = async (reservationData) => {
            return await Reservation.findOneAndUpdate(
                { pickupCode: reservationData.pickupCode }, // idempotent by pickupCode
                { $set: reservationData },
                { new: true, upsert: true }
            );
        };

        const res1 = await upsertReservation({
            foodListing: listings[0]._id, // Vegetable Biryani
            receiver: arjun._id,
            quantity: 5,
            pickupCode: '482731',
            status: 'RESERVED',
            reservedAt: subHours(1)
        });
        if (res1) reservationsCreated++;

        const res2 = await upsertReservation({
            foodListing: listings[1]._id, // Fresh Bread Basket
            receiver: arjun._id,
            quantity: 10,
            pickupCode: '192837',
            status: 'COLLECTED',
            reservedAt: subHours(5),
            collectedAt: subHours(2)
        });
        if (res2) reservationsCreated++;

        const res3 = await upsertReservation({
            foodListing: listings[3]._id, // Dal Tadka & Rice
            receiver: priya._id,
            quantity: 10,
            pickupCode: '556677',
            status: 'RESERVED',
            reservedAt: subHours(0.5)
        });
        if (res3) reservationsCreated++;

        const res4 = await upsertReservation({
            foodListing: listings[18]._id, // Vegetable Sandwiches
            receiver: rahul._id,
            quantity: 3,
            pickupCode: '998877',
            status: 'CANCELLED',
            reservedAt: subHours(4)
        });
        if (res4) reservationsCreated++;

        const res5 = await upsertReservation({
            foodListing: listings[10]._id, // Pasta Boxes
            receiver: sneha._id,
            quantity: 5,
            pickupCode: '223344',
            status: 'RESERVED',
            reservedAt: subHours(1.5)
        });
        if (res5) reservationsCreated++;

        const res6 = await upsertReservation({
            foodListing: listings[2]._id, // Mixed Fruit Basket
            receiver: communityKitchen._id,
            quantity: 3,
            pickupCode: '665544',
            status: 'RESERVED',
            reservedAt: subHours(0.2)
        });
        if (res6) reservationsCreated++;

        console.log(`✓ Reservations created/updated: ${reservationsCreated}`);

        console.log('Seeding Complete! Demo accounts ready.');

        if (isStandalone) process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        if (isStandalone) process.exit(1);
        throw err;
    }
};

const isMain = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isMain) {
    seedDB(true);
}
