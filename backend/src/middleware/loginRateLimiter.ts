import rateLimit from "express-rate-limit";
import { rateLimitConfig } from "../config/rateLimitConfig"

export const loginRateLimiter = rateLimit({
  windowMs: rateLimitConfig.login.windowMs,
  max: rateLimitConfig.login.max,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});
