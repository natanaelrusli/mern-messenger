// Import all dependencies
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";

import mongoMessages from "./messageModel.js";

// app config
const app = express();
const port = process.env.PORT || 9000;

var pusher = new Pusher({
  appId: "1084565",
  key: "df8eac613b130f20e282",
  secret: "c1c4d02777eeda0e390a",
  cluster: "ap1",
  useTLS: true,
});

// middleware
app.use(express.json());
app.use(cors());

// db config
const mongoURI =
  "mongodb+srv://admin:UDFAB949M9ukyGgY@cluster0.xp8le.mongodb.net/<dbname>?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB CONNECTED");

  const changeStream = mongoose.connection.collection("messages").watch()
  changeStream.on("change", (change) => {
    pusher.trigger("messages", "newMessage", {
      change: change,
    });
  })
});

// api routes
app.get("/", (req, res) => res.status(200).send("Hello World"));

app.post("/save/message", (req, res) => {
  const dbmessages = req.body;

  mongoMessages.create(dbmessages, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/retrieve/conversation", (req, res) => {
  mongoMessages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });
      res.status(200).send(data);
    }
  });
});

// listener
app.listen(port, () => console.log(`listening on localhost:${port}`));