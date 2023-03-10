import * as dotenv from "dotenv";
dotenv.config();

export const tableName = "messages_history";

export const nanoSecondFormat = "YYYY-MM-DDTHH:mm:ss.SSSSSSSSS[Z]";

export const insertQ = "INSERT INTO ? VALUES (?, ?, ?, ?, ?)";

export const selectQ = "SELECT * FROM ? WHERE userId = ?";

export const dbSetting = {
  host: process.env.HOSTNAME,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  ssl: {
    rejectUnauthorized: true,
  },
};
