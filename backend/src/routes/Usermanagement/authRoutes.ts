import { Router } from "express";
import { validate } from "../../middleware/validation";
import { authenticateToken } from "../../middleware/auth";
import { loginSchema, registerSchema } from "../../validation/Usermanagement/authValidation";
import {
	login,
	logout,
	me,
	refresh,
	register,
} from "../../controllers/Usermanagement/authController";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticateToken, me);

export default router;