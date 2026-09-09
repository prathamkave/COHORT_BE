import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
	await mongoose.connect(config.MONGO_URI);
	console.log("Connected to the database");
}

export default connectDB;
