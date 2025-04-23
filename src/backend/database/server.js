import express from "express";
import mongoose from "mongoose";
import Contractor from "./models/Contractor.js";
import Reservation from "./models/Reservation.js";
import { mockContractors } from "./mockData.js";
import cors from "cors"

const app = express();
const PORT = 5173;

app.use(cors())
app.use(express.json());

try {
  await mongoose.connect("mongodb://127.0.0.1:27017/ds_final_project");
  console.log("MongoDB connected");

  const count = await Contractor.countDocuments();
  if (count === 0) {
    await Contractor.insertMany(mockContractors);
    console.log("Mock data added to the database.");
  }
} catch (error) {
  console.error("Error initializing server:", error);
}

app.get("/", cors(), (req, res) => {
  res.status(200).json({
    msg: "Server is up"
  });
});

app.post("/request", async (req, res) => {
  const requestType = req.body.type;
  const requestData = req.body.data;

  if (!requestData || !requestType) {
    return res.status(400).json({ error: "Invalid request data or type." });
  }

  try {
    const contractor = await Contractor.findOne({
      email: requestData.contractorEmail,
    });

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found." });
    }

    if (requestType === "request_data") {
      // Populate reservations with the dates and send them back
      await contractor.populate("reservations", "startDate endDate");
      return res.status(200).json({
        name: contractor.name,
        email: contractor.email,
        reservations: contractor.reservations,
      });
    } else if (requestType === "send_reservation") {
      // Validate the reservation dates
      const startDate = new Date(requestData.startDate);
      const endDate = new Date(requestData.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid reservation dates." });
      }

      if (startDate >= endDate) {
        return res
          .status(400)
          .json({ error: "Reservation end date must be after start date." });
      }

      // Create the reservation and send it back
      const reservation = await Reservation.create({
        contractor: contractor._id,
        startDate,
        endDate,
      });
      contractor.reservations.push(reservation._id);
      await contractor.save();

      return res.status(200).json({
        result: true,
        reservation: {
          contractor: contractor.email,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        },
      });
    } else {
      return res.status(400).json({ error: "Request is of an unknown type." });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Error handling request." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
