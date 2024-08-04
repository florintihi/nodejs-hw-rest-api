require("dotenv").config({ path: "./info.env" });
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);

const contactsRouter = require("./routes/api/contacts");
const authRouter = require("./routes/api/auth");
const { default: mongoose } = require("mongoose");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
// app.use(passport.initialize());
app.use(express.json());

app.use("/users", authRouter);
app.use("/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// app.use((err, req, res, next) => {
//   res.status(500).json({ message: err.message });
// });
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: "error",
    code: err.status || 500,
    message: err.message,
    data: err.data || "Internal Server Error",
  });
});

const connectionString = `mongodb+srv://florintihi:${process.env.PASSWORD}@hw03-mongodb.nekl7d9.mongodb.net/db-contacts`;

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful"))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

module.exports = app;
