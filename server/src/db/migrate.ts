import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./connection.js";

console.log("Running migrations...");
migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations complete.");
