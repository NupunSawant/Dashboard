import { Router } from "express";
import { validate } from "../../middleware/validation";
import { authenticateToken } from "../../middleware/auth";
import {
	loginSchema,
	registerSchema,
} from "../../validation/Usermanagement/authValidation";
import {
	login,
	logout,
	me,
	refresh,
	register,
} from "../../controllers/Usermanagement/authController";
import { loginRateLimiter } from "../../middleware/loginRateLimiter";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", loginRateLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticateToken, me);

export default router;
