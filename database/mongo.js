const { MongoClient } = require("mongodb");
require('dotenv').config();
const url = process.env.MONGO_URI; //changes 3.2
const client = new MongoClient(url);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(); //changes 3.2
    console.log("Connected to MongoDB Production Ready");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
