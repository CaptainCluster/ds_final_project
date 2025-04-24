import express from "express";
import cors from "cors";

import requestContractorData from "../utils/requestContractorData.js";
import sendErrorResponse from "../utils/sendErrorResponse.js";
import sendReservation from "../utils/sendReservation.js";

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
app.post("/reserve", (req, res) => {
  if (!req.body?.data) {
    res.status(400).json({
      success: false,
      msg: "Could not find needed data within request.",
    });
    return;
  }

  // Send the rservation request to all databases
  dbURLs.forEach((dbURL) => {
    sendReservation(req.body.data, dbURL, res);
  });
});

app.listen(port, () => {
  console.log(`Request handler listening on port ${port}`);
});
