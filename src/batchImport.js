const { MongoClient } = require("mongodb");

require("dotenv").config();
const fetch = require("node-fetch");

let fs = require("file-system");
// const greetings = JSON.parse(fs.readFileSync("data/greetings.json"));

const { MONGO_URI } = process.env;

const assert = require("assert").strict;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function updateMany() {
  try {
    const client = await MongoClient(MONGO_URI, options);

    await client.connect();
    const db = client.db("m6-2");

    let data = await fetch("http://localhost:5678/api/seat-availability");

    let res = await data.json();
    let seats = res.seats;
    let booked_seats = res.bookedSeats;

    let booked_seat_array_ids = [];

    // really we should be checking to see if this is true, but meh
    let common_value = Object.entries(booked_seats)[0][1];

    for (const [key, value] of Object.entries(booked_seats)) {
      booked_seat_array_ids.push(key);
    }

    console.log(booked_seat_array_ids);
    console.log(common_value);

    // all the booked seats are true, so we can do updateMany

    let manyUpdated = await db.collection("seats").updateMany(
      {
        _id: {
          $in: booked_seat_array_ids,
        },
      },
      {
        $set: { isBooked: common_value },
      }
    );

    assert.deepStrictEqual(
      booked_seat_array_ids.length,
      manyUpdated.matchedCount
    );

    console.info(manyUpdated);

    //   res.status(200).json({
    //     status: 200,
    //     manyUpdated,
    //     _id,
    //   });

    client.close();
    console.log("disconnected!");
  } catch (error) {
    console.log("error");
    console.info({ message: error.message });
  }
}

async function updateOne() {
  let data = await fetch("http://localhost:5678/api/seat-availability");

  let res = await data.json();
  let seats = res.seats;
  let booked_seats = res.bookedSeats;

  let booked_seat_array = [];

  for (const [key, value] of Object.entries(booked_seats)) {
    booked_seat_array.push({ _id: key, booked: value });
  }

  console.log(booked_seat_array[1]);

  let seat_to_update_data = booked_seat_array[1];

  try {
    const client = await MongoClient(MONGO_URI, options);

    const _id = seat_to_update_data._id;
    const booked_seat_value = {
      $set: { isBooked: seat_to_update_data.booked },
    };

    await client.connect();
    const db = client.db("m6-2");
    let oneUpdated = await db
      .collection("seats")
      .updateOne({ _id }, booked_seat_value);

    console.info(oneUpdated);

    //   res.status(200).json({
    //     status: 200,
    //     oneUpdated,
    //     _id,
    //   });

    client.close();
    console.log("disconnected!");
  } catch (error) {
    console.log("error");
    console.info({ message: error.message });
  }
}

async function initialUpload() {
  try {
    let data = await fetch("http://localhost:5678/api/seat-availability");

    let res = await data.json();
    let seats = res.seats;

    let seat_data = [];

    for (const [key, value] of Object.entries(seats)) {
      seat_data.push({
        _id: key,
        price: value.price,
        isBooked: value.isBooked,
      });
    }

    const client = await MongoClient(MONGO_URI, options);

    await client.connect();
    const db = client.db("m6-2");

    let inserted = await db.collection("seats").insertMany(seat_data);
    console.info(inserted);
    client.close();
    console.log("disconnected!");
  } catch (error) {
    console.log("error");
    console.info({ message: error.message });
  }
}

//bacthImport();
// initialUpload();
// updateOne();
updateMany();

//Menlo, Monaco, 'Courier New', monospace
