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

export default requestContractorData;