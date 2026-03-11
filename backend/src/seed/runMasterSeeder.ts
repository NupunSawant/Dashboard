import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { seedMasters } from "./seedMasters";

(async () => {
	try {
		await connectDB();

		await seedMasters();

		console.log("Master seeding completed");
		process.exit(0);
	} catch (err) {
		console.error("Seeder failed:", err);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
	}
})();