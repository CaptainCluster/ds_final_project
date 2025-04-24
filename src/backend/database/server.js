import express from "express";
import mongoose from "mongoose";
import Contractor from "./models/Contractor.js";
import { mockContractors } from "./mockData.js";
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

  const mockData = mockContractors.map((contractor) => {
    // Times in UTC + 3 (Finland)
    const reservations = [];
    const workDayStart = 11; // 8:00
    const workDayStop = 19; // 16:00
    const maxDays = 5;
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 4);
    currentDate.setMinutes(0, 0, 0);

    // Create 5 day arrays
    for (let day = 0; day < maxDays; day++) {
      const daySlots = [];

      // Skip weekends
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        day--;
        continue;
      }

      // Create 8 hour slots
      for (let hour = 0; hour < 8; hour++) {
        if (currentDate.getHours() + 1 > workDayStop) {
          break;
        }

        daySlots.push({
          reserved: false,
          startDate: new Date(currentDate),
        });

        currentDate.setHours(currentDate.getHours() + 1);
      }

      // Add complete day to reservations
      reservations.push(daySlots);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workDayStart, 0, 0, 0);
    }

    return {
      ...contractor,
      reservations,
    };
  });

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

    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "Invalid reservation date." });
    }

    const dayIndex = startDate.getDay() - 1;
    const hourIndex = startDate.getHours() - 8;
    if (dayIndex < 0 || dayIndex > 4 || hourIndex < 0 || hourIndex > 7) {
      return res.status(400).json({ error: "Invalid reservation time." });
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
      result: true,
      reservation: {
        startDate: confirm.reservations[dayIndex][hourIndex].startDate,
        reserved: confirm.reservations[dayIndex][hourIndex].reserved,
      },
    });
  } catch (error) {
    console.error("Server error making a reservation:", error);
    res.status(500).json({ error: "Error handling request." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
