const mongoose = require("mongoose");

let consultSchema = new mongoose.Schema({
  _id: {
    type: number,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  ///@todo - Add reservations attribute
});

module.exports = mongoose.model("consult", consultSchema);
