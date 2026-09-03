import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
	res.status(200).json({ message: "Welcome to the Authentication API" });
});

app.post("/api/auth/register", (req, res) => {
	const { email, name, password } = req.body;
	const token = jwt.sign(
		{
			email,
			name,
		},
		"11fff6bb93fce87d83934f3849aaa9a5b540ac69bf736cc20a248c82dc788165",
	);

	res.status(201).json({
		message: "User registered successfully",
		data: {
			user: {
				email,
				name,
			},
			token,
		},
	});
});

export default app;
