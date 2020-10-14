"use strict";
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  try {
    // console.log(MONGO_URI);
    const client = await MongoClient(MONGO_URI, options);

    await client.connect();

    const db = client.db("m6-2");

    const data = await db.collection("seats").find().toArray();
    return data;
  } catch (error) {
    console.log("error");
    console.info({ message: error.message });
    return error;
  }
};

const bookSeat = async (seatID) => {
  try {
    // console.log(MONGO_URI);
    const client = await MongoClient(MONGO_URI, options);

    await client.connect();

    const db = client.db("m6-2");

    let oneUpdated = await db
      .collection("seats")
      .updateOne({ _id: seatID }, { $set: { isBooked: true } });

    console.info(oneUpdated);
    return oneUpdated;
  } catch (error) {
    console.log("error");
    console.info({ message: error.message });
    return error;
  }
};

module.exports = { getSeats, bookSeat };
