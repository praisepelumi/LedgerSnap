import { Router } from "express";
import { googleLogin, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public — handles Google login
router.post("/google", googleLogin);

// Protected — returns current user
router.get("/me", requireAuth, getMe);

export default router;
