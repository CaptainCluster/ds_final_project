import express from "express";
import mongoose from "mongoose";
import Contractor from "./models/Contractor.js";
import { mockContractors } from "./mockData.js";
import { createMockReservations } from "../utils/createMockReservations.js";
import cors from "cors";

const app = express();
const PORT = 5173;

app.use(cors());
app.use(express.json());

try {
  await mongoose.connect("mongodb://127.0.0.1:27017/ds_final_project");
  console.log("MongoDB connected");

  // Delete existing contractors, should be removed in final version
  await Contractor.deleteMany({});

  const mockData = mockContractors.map((contractor) =>
    createMockReservations(contractor)
  );

  await Contractor.insertMany(mockData);
} catch (error) {
  console.error("Error initializing server:", error);
}

app.get("/", cors(), (req, res) => {
  res.status(200).json({
    msg: "Server is up",
  });
});

app.post("/request", cors(), async (req, res) => {
  try {
    const requestData = req.body.data;
    const contractor = await Contractor.findOne({
      email: requestData.contractorEmail,
    });
    return res.status(200).json({
      name: contractor.name,
      email: contractor.email,
      reservations: contractor.reservations,
    });
  } catch (error) {
    console.error("Server error getting contractors:", error);
    res.status(500).json({ error: "Error handling request." });
  }
});

app.post("/reserve", cors(), async (req, res) => {
  try {
    const requestData = req.body.data;

    const contractor = await Contractor.findOne({
      email: requestData.contractorEmail,
    });

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found." });
    }

    const startDate = new Date(requestData.startDate);
    startDate.setHours(startDate.getHours() + 3);

    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "Invalid reservation date." });
    }

    let dayIndex = -1;
    let hourIndex = -1;

    // Find the day and hour index for the reservation
    for (let i = 0; i < contractor.reservations.length; i++) {
      const day = contractor.reservations[i];
      for (let j = 0; j < day.length; j++) {
        if (day[j].startDate.getTime() === startDate.getTime()) {
          dayIndex = i;
          hourIndex = j;
          break;
        }
      }
      if (dayIndex !== -1) {
        break;
      }
    }

    if (dayIndex === -1 || hourIndex === -1) {
      return res.status(404).json({ error: "Reservation time not found." });
    }

    // Check if reservation is taken
    if (contractor.reservations[dayIndex][hourIndex].reserved) {
      return res.status(400).json({
        error: "This time slot is already reserved.",
        success: false,
      });
    }

    await Contractor.updateOne(
      { _id: contractor._id },
      {
        $set: {
          [`reservations.${dayIndex}.${hourIndex}.reserved`]: true,
        },
      }
    );

    // Re fetch the contractor to confirm changes
    const confirm = await Contractor.findOne({ _id: contractor._id });

    return res.status(200).json({
      success: true,
      reservation: {
        startDate: confirm.reservations[dayIndex][hourIndex].startDate,
        reserved: confirm.reservations[dayIndex][hourIndex].reserved,
      },
    });
  } catch (error) {
    console.error("Server error making a reservation:", error);
    res.status(500).json({
      error: "Error handling request.",
      success: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
