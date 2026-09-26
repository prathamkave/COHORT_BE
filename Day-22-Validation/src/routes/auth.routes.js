import { Router } from "express";
import { register } from "../controller/auth.controller.js";
import { registerValidation } from "../validators/auth.validation.js";

const router = Router();

router.post("/register", registerValidation, register);

export default router;
