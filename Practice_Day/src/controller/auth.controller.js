import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!username || !email || !password)
			return res.status(400).json({
				success: false,
				message: "email,username and password are required",
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

		res.cookie(token, "token");
		res.send("hello");
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

export default register;
