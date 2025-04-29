/**
 * Handler can be perceived as the entry point for clients, when it comes to 
 * communicating with the system. It picks one of the multiple database nodes
 * and sends a request to it with the client data. The response will then be 
 * received by the handler, which will then send it to the client.
 *
 * Keep in mind that all the databases (multiple instances, one in each node)
 * are updated and syncronized every time a time slot is reserved by a client.
 */ 

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
 * @type GET
 * A route that helps understand whether the server
 * is online.
 */
app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    msg: "The server is online.",
  });
});

/**
 * @type GET
 * A route for receiving the names and email addresses of every single 
 * consultant in the database.
 */ 
app.get("/all", async (req, res) => {
  // Pick a random database and request the data
  const randomDbUrl = dbURLs[Math.floor(Math.random() * dbURLs.length)];

  try {
    const response = await fetch(randomDbUrl + "/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      return res.status(response.status).json({
          msg: "Error when attempting to fetch data."
      });
    }

    // Wait for response data and parse it as json
    const dbData = await response.json();

    // Send the received data back to the client
    res.status(200).json(dbData);
  } catch (error) {
    console.log("Error contacting DB server:", error);
    sendErrorResponse(res, "Failed to fetch data from the database.");
    return;
  }
});

/**
 * @type POST
 * A route for receiving contractor data
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
 * @type POST
 * A route for handling a reservation. Once a successful reservation is made,
 * the databases are syncronized.
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

  // Sending the reservation to each of the nodes 
  const responses = await Promise.all(
    dbURLs.map((dbURL) => sendReservation(req.body.data, dbURL))
  );

  // Checking whether any changes were made to any of the db instances.
  // If not, an error has occurred and no updates have been made to the database.
  if (!nodesCheckReservationSuccess(responses)) {
    console.error("An error occurred when attempting to reserve a slot.");
    return res.status(400).json({
      success: false,
      msg: "Could not reserve a time slot."
    });
  }
  
  // Figuring out whether any databases encountered issues
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

  // Returning with success status if no database node issues occurred. 
  // This indicates the data was successfully updated in all nodes.
  if (failedDbPorts.length === 0) {
    return res.status(200).json({
      success: true,
      msg: "Updated the reservation to all databases successfully.",
    });
  }
 
  // Attempting to retry with the nodes where updates failed
  const retryResults = await Promise.all(
    failedDbPorts.map((port) => retryReservation(port, req.body.data))
  );
  
  // Figuring out whether 2nd attempt was successful.  
  retryResults.forEach(({ success, port }) => {
    if (success) {
      successfulDbPorts.push(port);
    } else {

      // In order to prevent conflicts and issues, the desyncronized node 
      // (port & url) is removed from db arrays, meaning it is no longer used.
      dbURLs.splice(dbPorts.indexOf(port), 1);
      dbPorts.splice(dbPorts.indexOf(port), 1);
      console.log("Port " + port + " failed even after retrying.");
    }
  });
  
  // Handling the worst-case scenario: some databases are not syncronized
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
