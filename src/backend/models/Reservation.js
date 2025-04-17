const mongoose = require("mongoose");

let reservationSchema = new mongoose.Schema({
  _id: {
    type: number,
  },
  reserved: {
    type: Boolean,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

module.exports = mongoose.model("reservation", reservationSchema);
