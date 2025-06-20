require("dotenv").config();
require("./config/passport");

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");

const authRouter = require("./routers/auth-router");
const profileRouter = require("./routers/profile-router");
const messageRouter = require("./routers/message-router");
const setupSocket = require("./config/socket.io");

const port = process.env.PORT || 4000;

const app = express();

app.use(passport.initialize());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/user", authRouter);
app.use("/profile", profileRouter);
app.use("/message", messageRouter);
app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  console.error("Global error:", err.message, err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

const server = http.createServer(app);

mongoose
  .connect(process.env.mongo_url)
  .then(async () => {
    console.log("Mongodb connected successfully");
    try {
      await mongoose.connection.db.collection("users").dropIndex("userId_1");
      console.log("Dropped userId_1 index");
    } catch (err) {
      if (err.codeName === "IndexNotFound") {
        console.log("userId_1 index not found, no action needed");
      } else {
        console.error("Error dropping userId_1 index:", err);
      }
    }
    server.listen(port, (error) => {
      if (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
      }
      console.log(`Server with socket.io started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongodb connection failed:", error);
    process.exit(1);
  });

const io = setupSocket(server);
