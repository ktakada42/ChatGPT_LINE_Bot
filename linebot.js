"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineBotClient = exports.channelSecret = void 0;
var bot_sdk_1 = require("@line/bot-sdk");
var dotenv = require("dotenv");
dotenv.config();
exports.channelSecret = process.env.CHANNEL_SECRET;
var config = {
    channelSecret: exports.channelSecret,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};
exports.lineBotClient = new bot_sdk_1.Client(config);
