import express from "express";
import cors from "cors";

import requestContractorData from "../utils/requestContractorData.js";
import sendReservation from "../utils/sendReservation.js";
import retryReservation from "../utils/retryReservation.js";
import nodesCheckReservationSuccess from "../utils/nodesCheckReservationSuccess.js";

const app = express();
const port = 8000;

const dbPorts = process.env.DB_PORTS
  ? process.env.DB_PORTS.split(",")
  : ["5173"];
const dbURLs = dbPorts.map((port) => `http://localhost:${port.trim()}`);
console.log(`Using database URLs: ${dbURLs.join(", ")}`);

// CORS initialization
app.use(cors());

// Middleware to make parsing JSON requests easy
app.use(express.json());

/**
 * A route that helps understand whether the server
 * is online.
 *
 * @type GET
 */
app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    msg: "The server is online.",
  });
});

/**
 * A route for receiving contractor data
 *
 * @type POST
 */
app.post("/fetch_data", (req, res) => {
  if (!req.body?.data) {
    res.status(400).json({
      success: false,
      msg: "Could not find needed data within request.",
    });
    return;
  }

  // Pick a random database and request the data
  const randomDbUrl = dbURLs[Math.floor(Math.random() * dbURLs.length)];
  requestContractorData(req.body.data, randomDbUrl, res);
});

/**
 * A route for handling a reservation
 *
 * @type POST
 */
app.post("/reserve", async (req, res) => {
  if (!req.body?.data) {
    res.status(400).json({
      success: false,
      msg: "Could not find needed data within request.",
    });
    return;
  }

  // Send the reservation request to all databases
  const failedDbPorts = [];
  const successfulDbPorts = [];

  const responses = await Promise.all(
    dbURLs.map((dbURL) => sendReservation(req.body.data, dbURL))
  );

  // Checking whether any changes were made to any of the db instances.
  // If not, no sychronization is done.
  if (!nodesCheckReservationSuccess(responses)) {
    console.error("An error occurred when attempting to reserve a slot.");
    return res.status(400).json({
      success: false,
      msg: "Could not reserve a time slot."
    });
  }

  responses.forEach((r) => {
    if (r.data.success) {
      successfulDbPorts.push(r.data.database);
      console.log(
        `The database at port ${r.data.database} was successfully updated.`
      );
    } else {
      failedDbPorts.push(r.data.database);
      console.log(
        `The database at port ${r.data.database} failed to update its data.`
      );
    }
  });

  if (failedDbPorts.length === 0) {
    return res.status(200).json({
      success: true,
      msg: "Updated the reservation to all databases successfully.",
    });
  }
  
  const retryResults = await Promise.all(
    failedDbPorts.map((port) => retryReservation(port, req.body.data))
  );

  retryResults.forEach(({ success, port }) => {
    if (success) {
      successfulDbPorts.push(port);
    } else {
      console.log("Port " + port + " failed even after retrying.");
    }
  });

  if (successfulDbPorts.length !== process.env.DB_PORTS.length) {
    return res.status(207).json({
      success: false,
      msg: "The reservation was unable to be updated to all database servers...",
    });
  } 

  res.status(200).json({
    success: true,
    msg: "Updated the reservation to all databases successfully.",
  });
});

app.listen(port, () => {
  console.log(`Request handler listening on port ${port}`);
});
