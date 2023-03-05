import { middleware, WebhookEvent } from "@line/bot-sdk";
import * as express from "express";
import { ChatCompletionRequestMessage } from "openai";
import { openAIApi } from "./chatgpt";
import { channelSecret, lineBotClient } from "./linebot";

const messages: Array<ChatCompletionRequestMessage> = [];

const handleEvent = async (event: WebhookEvent) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
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
    text: reply.data.choices[0].message?.content!.trim(), //実際に返信の言葉を入れる箇所
  });
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
