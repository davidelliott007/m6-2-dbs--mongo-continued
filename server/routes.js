const router = require("express").Router();
const { getSeats, bookSeat } = require("./handlers");

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

// Code that is generating the seats.
// ----------------------------------
const seats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats[`${row[r]}-${s}`] = {
      price: 225,
      isBooked: false,
    };
  }
}
// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};

let state;

router.get("/api/seat-availability", async (req, res) => {
  // if (!state) {
  //   state = {
  //     bookedSeats: randomlyBookSeats(30),
  //   };
  // }

  let seats_from_DB = await getSeats(req, res);
  let booked_seats = seats_from_DB.filter((seat) => seat.isBooked);
  console.log(booked_seats);
  state = {
    seats: seats_from_DB,
    bookedSeats: booked_seats,
    numOfRows: 8,
    seatsPerRow: 12,
  };

  // let's conform the data to the format that the front end actually wants
  let conformed_seats = {};

  seats_from_DB.forEach((seat) => {
    conformed_seats[seat._id] = { price: seat.price, isBooked: seat.isBooked };
  });

  return res.json({
    seats: conformed_seats,
    bookedSeats: booked_seats,
    numOfRows: 8,
    seatsPerRow: 12,
  });
});

let lastBookingAttemptSucceeded = false;

router.post("/api/book-seat", async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;

  let new_seats = await getSeats(req, res);
  let booked_seats = new_seats.filter((seat) => seat.isBooked);

  console.log(booked_seats);
  // if (!state) {
  //   state = {
  //     bookedSeats: randomlyBookSeats(30),
  //   };
  // }

  // await delay(Math.random() * 3000);

  let found_seat = booked_seats.find((seat) => seat._id === seatId);

  // const isAlreadyBooked = !!booked_seats[seatId];
  console.log(found_seat);

  if (found_seat) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  let booked_seat = await bookSeat(seatId);

  // if (lastBookingAttemptSucceeded) {
  //   lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  //   return res.status(500).json({
  //     message: "An unknown error has occurred. Please try your request again.",
  //   });
  // }

  // lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  // state.bookedSeats[seatId] = true;

  return res.status(200).json({
    status: 200,
    success: true,
    booked: booked_seat,
    booked_id: seatId,
  });
});

module.exports = router;
