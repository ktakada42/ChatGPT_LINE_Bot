"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bot_sdk_1 = require("@line/bot-sdk");
var express = require("express");
var chatgpt_1 = require("./chatgpt");
var linebot_1 = require("./linebot");
var uuid_1 = require("uuid");
var mysql_1 = require("./mysql");
var mysql = require("mysql2/promise");
var moment = require("moment");
var handleEvent = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, rows, messages, reply, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (event.type !== "message" || event.message.type !== "text") {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, mysql.createConnection(mysql_1.databaseUrl)];
            case 1:
                connection = _c.sent();
                _c.label = 2;
            case 2:
                _c.trys.push([2, 9, 11, 12]);
                return [4 /*yield*/, connection.beginTransaction()];
            case 3:
                _c.sent();
                // ユーザーからのメッセージをINSERT
                return [4 /*yield*/, connection.query(mysql_1.insertQ, [
                        (0, uuid_1.v4)(),
                        event.message.text,
                        event.source.userId,
                        moment().format(mysql_1.dateTime3Format),
                        "user",
                    ])];
            case 4:
                // ユーザーからのメッセージをINSERT
                _c.sent();
                return [4 /*yield*/, connection.query(mysql_1.selectQ, event.source.userId)];
            case 5:
                rows = (_c.sent())[0];
                messages = rows.map(function (row) {
                    return {
                        role: row.role,
                        content: row.content,
                    };
                });
                return [4 /*yield*/, chatgpt_1.openAIApi.createChatCompletion({
                        model: "gpt-3.5-turbo",
                        messages: messages,
                    })];
            case 6:
                reply = _c.sent();
                // ChatGPTからのメッセージをINSERT
                return [4 /*yield*/, connection.query(mysql_1.insertQ, [
                        (0, uuid_1.v4)(),
                        (_a = reply.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content.trim(),
                        event.source.userId,
                        moment().format(mysql_1.dateTime3Format),
                        "assistant",
                    ])];
            case 7:
                // ChatGPTからのメッセージをINSERT
                _c.sent();
                return [4 /*yield*/, connection.commit()];
            case 8:
                _c.sent();
                return [2 /*return*/, linebot_1.lineBotClient.replyMessage(event.replyToken, {
                        type: "text",
                        text: (_b = reply.data.choices[0].message) === null || _b === void 0 ? void 0 : _b.content.trim(), //実際に返信の言葉を入れる箇所
                    })];
            case 9:
                err_1 = _c.sent();
                return [4 /*yield*/, connection.rollback()];
            case 10:
                _c.sent();
                return [3 /*break*/, 12];
            case 11:
                connection.end();
                return [7 /*endfinally*/];
            case 12: return [2 /*return*/];
        }
    });
}); };
var PORT = 10000;
var app = express();
app.use((0, bot_sdk_1.middleware)({
    channelSecret: linebot_1.channelSecret !== null && linebot_1.channelSecret !== void 0 ? linebot_1.channelSecret : "",
}));
app.post("/webhook", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var events, results, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                events = req.body.events;
                return [4 /*yield*/, Promise.all(events.map(handleEvent))];
            case 1:
                results = _a.sent();
                return [2 /*return*/, res.json(results)];
            case 2:
                err_2 = _a.sent();
                console.error(err_2);
                return [2 /*return*/, res.status(500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT);
console.log("Server running at ".concat(PORT));
