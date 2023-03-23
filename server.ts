import { middleware, WebhookEvent } from "@line/bot-sdk";
import * as express from "express";
import { ChatCompletionRequestMessage } from "openai";
import { openAIApi } from "./chatgpt";
import { channelSecret, lineBotClient } from "./linebot";
import { v4 } from "uuid";
import { insertQ, selectQ, dateTime3Format, databaseUrl } from "./mysql";
import * as mysql from "mysql2/promise";
import * as moment from "moment";

const handleEvent = async (event: WebhookEvent) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  const connection = await mysql.createConnection(databaseUrl);
  try {
    // ユーザーからのメッセージをINSERT
    await connection.query(insertQ, [
      v4(),
      event.message.text,
      event.source.userId!,
      moment().format(dateTime3Format),
      "user",
    ]);
    console.log(`Successfully inserted message: ${event.message.text}`);

    // ユーザーとの過去やり取りを取得し、ChatGPTに渡せるようにする
    const [rows] = await connection.query(selectQ, event.source.userId!);
    const sortedRows = (rows as mysql.RowDataPacket[]).sort((a: any, b: any) =>
      moment(a.typedAt).diff(moment(b.typedAt))
    );

    const messages: ChatCompletionRequestMessage[] = sortedRows.map((row) => {
      return {
        role: row.role,
        content: row.content,
      };
    });

    // ChatGPTからのメッセージを取得
    const reply = await openAIApi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    console.log(`Reply is: ${reply.data.choices[0].message?.content!.trim()}`);

    // ChatGPTからのメッセージをINSERT
    await connection.query(insertQ, [
      v4(),
      reply.data.choices[0].message?.content!.trim(),
      event.source.userId!,
      moment().format(dateTime3Format),
      "assistant",
    ]);
    console.log("Successfully inserted ChatGPT reply");

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
