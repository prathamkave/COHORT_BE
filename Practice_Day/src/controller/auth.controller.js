import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!username || !email || !password)
			return res.status(400).json({
				success: false,
				message: "Email,Username and Password are required",
			});

		const alreadyRegister = await userModel.findOne({ email });

		if (alreadyRegister)
			return res.status(400).json({
				success: false,
				message: "user already exists",
			});

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await userModel.create({
			username,
			email,
			password: hashedPassword,
		});

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

		res.cookie("token", token);
		return res.status(201).json({
			success: true,
			message: "user is created",
			user,
			token,
		});
	} catch (error) {
		console.log(error.message);
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
		}

		const user = await userModel.findOne({ email });

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

		res.cookie("token", token);
		return res.status(200).json({
			success: true,
			message: "Login successful",
			user,
			token,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
