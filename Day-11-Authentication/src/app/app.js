import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticate } from "../middleware/auth.middleware.js";
import userModel from "../models/user.model.js";

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
	res.status(200).json({ message: "Welcome to the Authentication API" });
});

app.post("/api/auth/register", async (req, res) => {
	const { email, name, password } = req.body;

	const user = await userModel.create({
		email,
		name,
		password: await bcrypt.hash(password, 10),
	});

	const token = jwt.sign(
		{
			id: user._id,
		},
		process.env.JWT_SECRET,
	);

	res.status(201).json({
		message: "User registered successfully",
		data: {
			user: {
				email,
				name,
				id: user._id,
			},
			token,
		},
	});
});

app.get("/api/auth/me", authenticate, (req, res) => {
	res.status(200).json({
		data: {
			user: req.user,
		},
	});
});

app.post("/api/auth/login", async (req, res) => {
	const { email, password } = req.body;

	const user = await userModel.findOne({ email });

	const isValidPassword = await bcrypt.compare(password, user.password);

	if (!isValidPassword) {
		return res.status(401).json({
			message: "Invalid credentials",
		});
	}

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

	res.status(200).json({
		message: "User logged in successfully",
		data: {
			user: {
				email: user.email,
				name: user.name,
				id: user._id,
			},
			token,
		},
	});
});

export default app;
