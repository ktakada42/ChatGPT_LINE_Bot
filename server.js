"use strict";

require("dotenv").config();

const express = require("express");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 3000;
const { Configuration, OpenAIApi } = require("openai");

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app = express();

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

const messages = [];

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  messages.push({
    role: "user",
    content: event.message.text,
  });

  const reply = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  messages.push(reply.data.choices[0].message);

  console.log(messages);

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: reply.data.choices[0].message.content.trim(), //実際に返信の言葉を入れる箇所
  });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
