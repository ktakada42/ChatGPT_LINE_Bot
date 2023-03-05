import { Client } from "@line/bot-sdk";
import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

export const lineBotClient = new Client(config);
