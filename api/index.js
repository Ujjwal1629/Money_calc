const express = require("express");
const cors = require("cors");
const app = express();
const Transaction = require("./models/transaction.js");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.get("/api/test", (req, res) => {
  res.json("test OK");
});
app.post("/api/transaction", async (req, res) => {
  await mongoose.connect(process.env.MONGO_URL);
  const { name, price, description, datetime } = req.body;
  const transaction_store = await Transaction.create({
    price,
    name,
    description,
    datetime,
  });
  res.json(transaction_store);
});
app.get("/api/transactions", async (req, res) => {
  await mongoose.connect(process.env.MONGO_URL);
  const transactions = await Transaction.find();
  res.json(transactions);
});
app.listen(4040);
//0Zl9pbnLUpYJBUh3
