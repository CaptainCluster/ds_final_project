import express from 'express';
import cors from "cors";

const app = express();
const port = 8000;

import requestContractorData from '../utils/requestContractorData.js';
import sendErrorResponse from '../utils/sendErrorResponse.js';
import sendReservation from '../utils/sendReservation.js';



// CORS initialization
app.use(cors())

// Middleware to make parsing JSON requests easy
app.use(express.json())


/**
 * A route that helps understand whether the server
 * is online.
 */
app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    msg: "The server is online."
  });
})

app.post('/request', async (req, res) => {
    // Parse the information from the request
    const requestType = req.body.type;
    const data = req.body.data;

    // Send error back to client if request does not contain data
    if(!data) {
        console.log("Request does not seem to contain data.")
        sendErrorResponse(res, "Could not find data in the request.");
        return
    }

    // Handle task depending on request type
    if(requestType == "request_data") {
        requestContractorData(data, res)
    }else if(requestType == "send_reservation") {
        sendReservation(data, res)
    }else {
        sendErrorResponse(res, "Request is of an unknown type.");
    }
    return
})

app.listen(port, () => {
  console.log(`Requesthandler listening on port ${port}`)
})

