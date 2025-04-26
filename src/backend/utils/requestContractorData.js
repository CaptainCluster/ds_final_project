async function requestContractorData(data, dbURL, res) {
  console.log("Sending request for contractor data...");
  try {

    // Logic for creating the request body depending on if
    // the client provides a name or email to search with
    let requestBody = "";
    if(data.contractorEmail) {
      requestBody = JSON.stringify({
        type: "db_request",
        data: {
          contractorEmail: data.contractorEmail
        }
      });
    } else if(data.contractorName) {
      requestBody = JSON.stringify({
        type: "db_request",
        data: {
          contractorName: data.contractorName
        }
      });
    }
    const response = await fetch(dbURL + "/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody
    });

    // Wait for response data and parse it as json
    const dbData = await response.json();

    // Send the received data back to the client
    res.status(200).send({
      type: "response_result",
      data: {
        success: true,
        data: dbData,
      },
    });
  } catch (error) {
    console.log("Error contacting DB server:", error);
    sendErrorResponse(res, "Failed to fetch data from the database.");
    return;
  }
}

export default requestContractorData;
