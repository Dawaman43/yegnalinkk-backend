require("dotenv").config();
const mongoose = require("mongoose");

const connectToDb = mongoose
  .connect(process.env.mongo_url)
  .then(console.log("Mongodb connected successfully"))
  .catch(console.log("Mongodb connection failed"));
