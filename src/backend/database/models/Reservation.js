import { Schema, model } from "mongoose";

// Not used at the moment

let reservationSchema = new Schema({
  contractor: {
    type: Schema.Types.ObjectId,
    ref: "Contractor",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

export default model("Reservation", reservationSchema);
