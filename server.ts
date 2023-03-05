import { middleware } from "@line/bot-sdk";
import * as dotenv from "dotenv";
import * as express from "express";
import { ChatCompletionRequestMessage } from "openai";
import { openAIApi } from "./chatgpt";
import { config, lineBotClient } from "./linebot";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.post("/webhook", middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const messages: Array<ChatCompletionRequestMessage> = [];

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  messages.push({
    role: "user",
    content: event.message.text,
  });

  const reply = await openAIApi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  messages.push(reply.data.choices[0].message);

  console.log(messages);

  return lineBotClient.replyMessage(event.replyToken, {
    type: "text",
    text: reply.data.choices[0].message.content.trim(), //実際に返信の言葉を入れる箇所
  });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
