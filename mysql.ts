import * as dotenv from "dotenv";
dotenv.config();

export const databaseUrl = process.env.DATABASE_URL;

export const dateTime3Format = "YYYY-MM-DD HH:mm:ss.SSS";

export const insertQ = "INSERT INTO messages_history VALUES (?, ?, ?, ?, ?)";

export const selectQ =
  "SELECT role, content, typedAt FROM messages_history WHERE userId = ? ORDER BY typedAt DESC LIMIT 17";
