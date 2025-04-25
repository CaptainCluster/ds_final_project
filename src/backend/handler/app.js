import express from "express";
import cors from "cors";

import requestContractorData from "../utils/requestContractorData.js";
import sendErrorResponse from "../utils/sendErrorResponse.js";
import sendReservation from "../utils/sendReservation.js";
import retryReservation from "../utils/retryReservation.js";

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

  // Keep track of successful and failed ports
  const failedDbPorts = [];
  const successfullDbPorts = [];
  // Use promise.all so that we wait until all of the promises are resolved
  const responses = await Promise.all(
    // Send reservation to all databases based on their ports
    dbURLs.map((dbURL) => sendReservation(req.body.data, dbURL))
  );
  // Loop through each response (From the first attempt) and check if they are successful or not
  responses.forEach(r => {
    if(r.data.success) {
        successfullDbPorts.push(r.data.database);
        console.log(`The database at port ${r.data.database} was succesfully updated.`)
    } else {
        failedDbPorts.push(r.data.database);
        console.log(`The database at port ${r.data.database} failed to update its data.`)
    }
  })

  // If no db reservations failed, send success to client
  if(failedDbPorts.length == 0) {
    res.status(200).json({
        success: true,
        msg: "Updated the reservation to all databases successfully."
    })
    return;
  // If any of them fail, attempt all failed ones using retryReservation
  } else {
    const retryResults = await Promise.all(
        failedDbPorts.map((port) => retryReservation(port, req.body.data))
    );

    // Add succeeded databases to successful list
    retryResults.forEach(({success, port}) => {
        if(success) {
            successfullDbPorts.push(port);
        } else {
            console.log("Port " + port + " failed even after retrying.");
        }
    });
  }

  // If all succeeded after retry
  if(successfullDbPorts.length == process.env.DB_PORTS.length) {
    res.status(200).json({
        success: true,
        msg: "Updated the reservation to all databases successfully."
    })
    return;
  // If some reservations stil failed after retrying
  } else {
    res.status(207).json({
        success: false,
        msg: "The reservation was unable to be updated to all database servers..."
    })
    return;
  }

});

app.listen(port, () => {
  console.log(`Request handler listening on port ${port}`);
});
