import mongoose from "mongoose";
import { env } from "./env";

// Function to connect to MongoDB
export const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log(`MongoDB connected: ${mongoose.connection.name}`);
    }catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit with failure
    }
}