import { Router } from "express";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		res.status(400).json({
			message: "All fields are required",
		});
	}

	const userExists = await userModel.findOne({ email });

	if (userExists) {
		return res.status(400).json({
			message: "User already Exists",
			errors: {
				path: "email",
				message: "User already Exists",
			},
		});
	}

	const user = await userModel.create({
		name,
		email,
		passwordHash: await bcrypt.hash(password, 12),
	});

	const { accessToken, refreshToken } = generateToken({ userId: user._id });

	user.refreshToken = refreshToken;
	await user.save();

	res.cookie("refreshToken", refreshToken, { httpOnly: true });

	res.status(201).json({
		message: "User registered successfully",
		data: {
			user: {
				name: user.name,
				email: user.email,
			},
		},
		accessToken,
	});
});

export default router;
