import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { env } from "../config/env.js";
import { seedDefaultCategoriesForUser } from "../db/seed.js";
import { logger } from "../utils/logger.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string | undefined;
}

/**
 * Verify a Google ID token and extract profile info.
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token payload");
  }

  return {
    googleId: payload.sub,
    email: payload.email!,
    name: payload.name || payload.email!,
    picture: payload.picture,
  };
}

/**
 * Find existing user by Google ID, or create a new one.
 * Seeds default categories for new users.
 */
export function findOrCreateUser(profile: GoogleProfile) {
  // Check if user already exists
  const existing = db
    .select()
    .from(users)
    .where(eq(users.googleId, profile.googleId))
    .get();

  if (existing) {
    // Update name/picture/email in case they changed
    db.update(users)
      .set({
        name: profile.name,
        picture: profile.picture,
        email: profile.email,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, existing.id))
      .run();

    return { ...existing, name: profile.name, picture: profile.picture, email: profile.email };
  }

  // Create new user
  const newUser = db
    .insert(users)
    .values({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    })
    .returning()
    .get();

  // Seed default categories for new user
  seedDefaultCategoriesForUser(newUser.id);
  logger.info(`New user created: ${newUser.email} (ID: ${newUser.id})`);

  return newUser;
}

/**
 * Get user by ID.
 */
export function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get() ?? null;
}

/**
 * Generate a JWT for a user.
 */
export function generateJwt(userId: number): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "30d" });
}
