"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectQ = exports.insertQ = exports.dateTime3Format = exports.databaseUrl = void 0;
var dotenv = require("dotenv");
dotenv.config();
exports.databaseUrl = process.env.DATABASE_URL;
exports.dateTime3Format = "YYYY-MM-DD HH:mm:ss.SSS";
exports.insertQ = "INSERT INTO messages_history VALUES (?, ?, ?, ?, ?)";
exports.selectQ = "SELECT role, content, typedAt FROM messages_history WHERE userId = ? ORDER BY typedAt DESC LIMIT 17";
