import { Schema, model } from "mongoose";

let contractorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  reservations: {
    type: [Schema.Types.ObjectId],
    ref: "Reservation",
    default: [],
  },
});

export default model("Contractor", contractorSchema);
