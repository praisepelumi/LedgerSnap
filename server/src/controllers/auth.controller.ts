import { Request, Response, NextFunction } from "express";
import {
  verifyGoogleToken,
  findOrCreateUser,
  getUserById,
  generateJwt,
} from "../services/auth.service.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * POST /api/auth/google
 * Receives { idToken } from client, verifies with Google,
 * creates/finds user, and returns JWT + user info.
 */
export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      throw new AppError("INVALID_REQUEST", "idToken is required", 400);
    }

    // Verify the Google ID token
    const profile = await verifyGoogleToken(idToken);

    // Find or create user in our database
    const user = findOrCreateUser(profile);

    // Generate our JWT
    const token = generateJwt(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user's info.
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getUserById(req.userId!);

    if (!user) {
      throw new AppError("NOT_FOUND", "User not found", 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    next(err);
  }
}
