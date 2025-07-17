// /src/database/connection/db.js

import mongoose from 'mongoose';

export async function connectMongoose() {
    await mongoose.connect(process.env.MONGO_URL).catch((err) => {
        console.error('MongoDB connection error:', err);
    });
    console.log('MongoDB connected via Mongoose 🦨');
}