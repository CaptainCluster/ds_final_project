import sendErrorResponse from "./sendErrorResponse.js";

const dbPort = 5173;
const dbURL = `http://localhost:${dbPort}`;


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
                }
            })
        });

        if (response.status != 200) {
          return res.status(response.status).json({
            "error": `Reservation failed. Status: ${res.status}`
          })
        }
       
        // Wait for response and parse it as json
        response = await response.json();
        
        // Send feedback to client depending on if the reservation is successful or not
        if(response.data.result) {
            res.status(200).json({
                "type": "response_result",
                "data": {
                    "success": true,
                    "message": "Reservation made successfully."
                }
            });
        }else {
            res.status(500).json({
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

export default sendReservation;
