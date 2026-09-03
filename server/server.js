import dns from 'node:dns';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/authRoutes.js';
import listingRoutes from './src/routes/listingRoutes.js';
import reservationRoutes from './src/routes/reservationRoutes.js';

// Force IPv4 first to prevent ENETUNREACH errors on cloud container hosts like Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const app = express();

// ================================
// CORS
// ================================

const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

// ================================
// Middleware
// ================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ================================
// Health Check
// ================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SurplusShare API is running',
        database: mongoose.connection.readyState === 1
            ? 'MongoDB Atlas connected'
            : 'MongoDB Atlas disconnected'
    });
});

// ================================
// API Routes
// ================================

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/reservations', reservationRoutes);

// ================================
// 404 Handler
// ================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// ================================
// Environment Variables
// ================================

const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGO_URI;

// Make sure MongoDB URI exists
if (!MONGODB_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables.');
    process.exit(1);
}

// ================================
// MongoDB Atlas Connection
// ================================

mongoose
    .connect(MONGODB_URI)
    .then(async () => {
        console.log('✓ Connected to MongoDB Atlas');

        try {
            const User = (await import('./src/models/User.js')).default;

            const count = await User.countDocuments();

            if (count === 0) {
                console.log(
                    '⚠️ MongoDB Atlas database is empty. Run "npm run seed".'
                );
            } else {
                console.log(`✓ Users available: ${count}`);
            }
        } catch (error) {
            console.error('Initialization check failed:', error);
        }

        // ================================
        // Start Server
        // ================================

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✓ SurplusShare server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB Atlas connection error:', error);
        process.exit(1);
    });