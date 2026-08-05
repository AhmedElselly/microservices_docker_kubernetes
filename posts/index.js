require("dotenv").config();
const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const { Client } = require("pg");

const PORT = 4000;

const client = new Client({
  host: "postgres",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "myapp",
});

const start = async () => {
  await client.connect();

  console.log({ client });

  console.log("✅ Connected to PostgreSQL!");

  const res = await client.query("SELECT NOW()");

  console.log(res.rows);
};

start();

const app = express();
app.use(express.json());
app.use(cors());

const posts = {
  id: 1,
  title: "first post",
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  await axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Received Event", req.body.type);

  res.send({});
});

app.listen(PORT, () => {
  // huge update here
  console.log("Posts service restarted!");
  console.log(`Posts server is running on port ${PORT}`);
});
