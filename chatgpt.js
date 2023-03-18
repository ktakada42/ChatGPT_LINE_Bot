"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAIApi = void 0;
var dotenv = require("dotenv");
dotenv.config();
var openai_1 = require("openai");
var configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.openAIApi = new openai_1.OpenAIApi(configuration);
