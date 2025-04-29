import express from "express";
import mongoose from "mongoose";
import Contractor from "./models/Contractor.js";
import { mockContractors } from "./mockData.js";
import { createMockReservations } from "../utils/createMockReservations.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5173;
const DB_NAME = process.env.DB_NAME || "ds_final_project_1";

app.use(cors());
app.use(express.json());

try {
  // Resetting the database instance so that it is ready for demonstration
  await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
  await Contractor.deleteMany({});
  const mockData = mockContractors.map((contractor) =>
    createMockReservations(contractor)
  );
  // Inserting the mock data 
  await Contractor.insertMany(mockData);
} catch (error) {
  console.error("Error initializing server:", error);
}

/**
 * @type GET
 * A test route 
 */
app.get("/", cors(), (req, res) => {
  res.status(200).json({
    database: PORT,
    msg: "Server is up",
  });
});

/**
 * @type GET
 * A route for receiving the names and email addresses of every single
 * consult that exists.
 */
app.get("/all", cors(), async (req, res) => {
 try {
  const contractorData = await Contractor.find();
  const contractorDataArray = [];

  // Filtering the data into an array
  contractorData.forEach((contractor) => {
    const contractorInfo = {
      name: contractor.name,
      email: contractor.email
    }
    contractorDataArray.push(contractorInfo);
  });
  
  // Handling edge-cases where no data exists within the database
  if (contractorDataArray.length === 0) {
    return res.status(500).json({
      msg: "No data exists."
    })
  }
  res.status(200).json({
    msg: "Data query successful.",
    contractors: contractorDataArray
  });

 } catch (error) {
  console.error("Server error getting contractors:", error);
  res.status(500).json({
    database: PORT,
    error: "Error handling request.",
  });
 }
});

/**
 * @type POST
 * A route that gives the information of a contractor/consultant
 * based on their email address.
 */ 
app.post("/request", cors(), async (req, res) => {
  try {
    const requestData = req.body.data;

    const contractor = await Contractor.findOne({
      email: requestData.contractorEmail,
    });

    // Handling cases where a contractor is not found
    if (!contractor || contractor == null) {
      return res.status(404).json({
        error: `Could not find a contractor with the following email: ${requestData.contractorEmail}`,
      });
    }

    return res.status(200).json({
      database: PORT,
      name: contractor.name,
      email: contractor.email,
      reservations: contractor.reservations,
    });
  } catch (error) {
    console.error("Server error getting contractors:", error);
    res.status(500).json({
      database: PORT,
      error: "Error handling request.",
    });
  }
});

/**
 * @type POST
 * A route that uses the consultant/contractor email and the start date
 * of the time slot to reserve it.
 */
app.post("/reserve", cors(), async (req, res) => {
  try {
    const requestData = req.body.data;

    // Checking whether the required data exists.
    if (!requestData.contractorEmail || !requestData.startDate) {
      return res.status(400).json({
        database: PORT,
        error: "The reservation request did not provide necessary data."
      })
    }

    const contractor = await Contractor.findOne({
      email: requestData.contractorEmail,
    });

    // Handling cases where no contractor can be found.
    if (!contractor) {
      return res.status(404).json({
        database: PORT,
        error: "Contractor not found.",
      });
    }

    const startDate = new Date(requestData.startDate);

    // Ensuring the given date is valid
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        database: PORT,
        error: "Invalid reservation date.",
      });
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

    // Handling cases where the given date is invalid
    if (dayIndex === -1 || hourIndex === -1) {
      return res.status(404).json({
        database: PORT,
        error: "Reservation time not found.",
      });
    }

    // Check if reservation is taken
    if (contractor.reservations[dayIndex][hourIndex].reserved) {
      return res.status(400).json({
        error: "This time slot is already reserved.",
        database: PORT,
        success: false,
      });
    }
    
    // Setting the reservation status to true, indicating the date in the request
    // is no longer available for others to reserve.
    await Contractor.updateOne(
      { _id: contractor._id },
      {
        $set: {
          [`reservations.${dayIndex}.${hourIndex}.reserved`]: true,
        },
      }
    );

    // Re-fetch the contractor to confirm changes
    const confirm = await Contractor.findOne({ _id: contractor._id });

    return res.status(200).json({
      success: true,
      database: PORT,
      reservation: {
        startDate: confirm.reservations[dayIndex][hourIndex].startDate,
        reserved: confirm.reservations[dayIndex][hourIndex].reserved,
      },
    });
  } catch (error) {
    console.error("Server error making a reservation:", error);
    res.status(500).json({
      error: "Error handling request.",
      database: PORT,
      success: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Database server is running on port ${PORT} with database ${DB_NAME}`
  );
});
