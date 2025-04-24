import sendErrorResponse from "./sendErrorResponse.js";

const dbPort = 5173;
const dbURL = `http://localhost:${dbPort}`;

async function requestContractorData(data, res) {
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

        // Handling unsuccessful requests                
        if (response.status != 200) {
            console.error(`Failed to receive data. Status: ${response.status}.`)
            return res.status(response.status).json({
                success: false,
                msg: "Failed to receive data."
            })
        }

        // Wait for response data and parse it as json
        const dbData = await response.json();

        // Send the received data back to the client
        
        res.status(200).json({
            "type": "response_result",
            "data": {
                "success": true,
                "data": dbData
            }
        });
        console.log("Successfully received data.")

    } catch (error) {
        console.error("Error contacting DB server:", error);
        sendErrorResponse(res, "Failed to fetch data from the database.");
        return
    }
}

export default requestContractorData;