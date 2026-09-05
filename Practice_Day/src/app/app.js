import express from "express";

const app = express();

app.get("/", (req, res) => {
	res.status(200).json({
		message: "App is running",
	});
});

export default app;
