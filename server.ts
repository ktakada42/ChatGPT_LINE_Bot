import { middleware, WebhookEvent } from "@line/bot-sdk";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import * as express from "express";
import { ChatCompletionRequestMessage } from "openai";
import { openAIApi } from "./chatgpt";
import { channelSecret, lineBotClient } from "./linebot";
import { v4 } from "uuid";
import { orderBy } from "lodash-es";
import {
  insertQ,
  tableName,
  nanoSecondFormat,
  selectQ,
  dbSetting,
} from "./mysql";
import * as mysql from "mysql2/promise";

dayjs.extend(utc);
dayjs.extend(advancedFormat);

let connection;
const handleEvent = async (event: WebhookEvent) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  try {
    connection = await mysql.createConnection(dbSetting);
    await connection.beginTransaction();

    // ユーザーからのメッセージをINSERT
    connection.query(
      insertQ,
      [
        tableName,
        v4(),
        event.message.text,
        event.source.userId!,
        dayjs().format(nanoSecondFormat),
        "user",
      ],
      (err, result, fields) => {
        if (err) throw err;
      }
    );

    // ユーザーとの過去やり取りを取得
    const [histories] = await connection.query(selectQ, [
      tableName,
      event.source.userId!,
    ]);

    // ユーザーとの過去やり取りを古い順にソート
    const queriedMessages: ChatCompletionRequestMessage[] = orderBy(
      histories,
      "typedAt",
      "asc"
    ).map(
      (history) =>
        ({
          role: history.role,
          content: history.content,
        } as ChatCompletionRequestMessage)
    );

    // ChatGPTからのメッセージを取得
    const reply = await openAIApi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [histories].concat(
        queriedMessages
      ) as ChatCompletionRequestMessage[],
    });

    // ChatGPTからのメッセージをINSERT
    connection.query(
      insertQ,
      [
        tableName,
        v4(),
        reply.data.choices[0].message?.content!.trim(),
        event.source.userId!,
        dayjs().format(nanoSecondFormat),
        "assistant",
      ],
      (err, result, fields) => {
        if (err) throw err;
      }
    );
    await connection.commit();

    return lineBotClient.replyMessage(event.replyToken, {
      type: "text",
      text: reply.data.choices[0].message?.content!.trim(), //実際に返信の言葉を入れる箇所
    });
  } catch (err) {
    await connection.rollback();
  } finally {
    connection.end();
  }
};

const PORT = 10000;

const app = express();

app.use(
  middleware({
    channelSecret: channelSecret ?? "",
  })
);

app.post("/webhook", async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500);
  }
});

app.listen(PORT);
console.log(`Server running at ${PORT}`);
