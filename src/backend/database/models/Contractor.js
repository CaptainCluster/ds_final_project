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
  reservations: [],
});

export default model("Contractor", contractorSchema);
