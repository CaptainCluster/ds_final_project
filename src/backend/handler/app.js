const express = require('express');
const cors = require("cors");
const app = express();
const port = 8000;
const dbPort = 5173;
const dbURL = "http://localhost:" + dbPort;

// CORS initialization
app.use(cors())

// Middleware to make parsing JSON requests easy
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
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
        requestData(data, res)
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

//////////////////////////////////////////////////////////////
// ---------------- Some helpful functions ---------------- //
//////////////////////////////////////////////////////////////

// ---------------- Request data from database ---------------- //

async function requestData(data, res) {
    console.log("Sending request for contractor data...")
    try {
        const response = await fetch(dbURL + "/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "type": "db_request",
                "data": {
                    "contractorEmail": data.contractorEmail
                }
            })
        });

        // Wait for response data and parse it as json
        const dbData = await response.json();

        // Send the received data back to the client
        res.status(200).send({
            "type": "response_result",
            "data": {
                "success": true,
                "data": dbData
            }
        });
    } catch (error) {
        console.log("Error contacting DB server:", error);
        sendErrorResponse(res, "Failed to fetch data from the database.");
        return
    }
}

// ---------------- Sending reservation to database ---------------- //

async function sendReservation(data, res) {
    console.log("Sending reservation...")

    try {
        let response = await fetch(dbURL + "/reserve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "type": "db_request",
                "data": {
                    "contractorEmail": data.contractorEmail,
                    "startDate": data.startDate,
                    "endDate": data.endDate
                }
            })
        });

        // Wait for response and parse it as json
        response = await response.json();

        // Send feedback to client depending on if the reservation is successful or not
        if(response.data.result) {
            res.status(200).send({
                "type": "response_result",
                "data": {
                    "success": true,
                    "message": "Reservation made successfully."
                }
            });
        }else {
            res.status(500).send({
                "type": "response_result",
                "data": {
                    "success": false,
                    "message": "Could not make reservation."
                }
            });
        }
    } catch (error) {
        console.log("Error contacting DB server:", error);
        sendErrorResponse(res, "Failed to fetch data from the database.");
        return
    }
}

// ---------------- Sending an error message back to the client ---------------- //

function sendErrorResponse(res, message) {
    res.status(500).send({
        "type": "error",
        "data": {
            "message": message
        }
    });
}