import { Router } from "express";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
	generateToken,
	verifyAccessToken,
	verifyRefreshToken,
} from "../utils/auth.js";

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

router.get("/me", async (req, res) => {
	const accessToken = req.headers.authorization?.split(" ")[1];
	try {
		const decoded = verifyAccessToken(accessToken);

		const user = await userModel.findById(decoded.id);

		res.status(200).json({
			message: "User fetched successfully",
			data: {
				users: {
					name: user.name,
					email: user.email,
				},
			},
		});
	} catch (err) {
		return res.status(401).json({
			message: "Unathorized, Invalid or Expired Token",
		});
	}
});

router.post("/refresh", async (req, res) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		return res.status(401).json({
			message: "Unathorized, Invalid or Expired Token",
		});
	}
	try {
		const decoded = await verifyRefreshToken(refreshToken);

		const user = await userModel.findById(decoded.id);

		if (user.refreshToken !== refreshToken) {
			user.refreshToken = null;
			await user.save();

			return res.status(401).json({
				message: "Unathorized, refresh Token mismatch",
			});
		}

		const { accessToken, refreshToken: newRefreshToken } = generateToken({
			userId: user._id,
		});

		res.cookie("refreshToken", refreshToken, { httpOnly: true });

		user.refreshToken = newRefreshToken;
		user.save();

		res.status(200).json({
			message: "Token refresh successfully",
			accessToken,
		});
	} catch (err) {
		return res.status(401).json({
			message: "Unathorized, Invalid or Expired Token",
		});
	}
});

export default router;
