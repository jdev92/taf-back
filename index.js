require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

const mongodb_connect = process.env.MONGODB_CONNECT;

mongoose.connect(mongodb_connect);

const userRoutes = require("./routes/user");
app.use(userRoutes);

const userEvents = require("./routes/event");
app.use(userEvents);

app.get("/", (req, res) => {
  res.json("Bienvenue sur l'API Calendar");
});

app.all("*", function (req, res) {
  res.json({ message: "Page introuvable" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server started 🔥🔥🔥");
});
