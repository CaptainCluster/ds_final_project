import sendErrorResponse from "./sendErrorResponse.js";

// ---------------- Sending reservation to database ---------------- //

async function sendReservation(data, dbURL, res) {
  console.log("Sending reservation...");

  try {
    let response = await fetch(dbURL + "/reserve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "db_request",
        data: {
          contractorEmail: data.contractorEmail,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      }),
    });

    // Wait for response and parse it as json
    data = await response.json();

    // Send feedback to client depending on if the reservation is successful or not
    if (data.success) {
      return {
        type: "response_result",
        data: {
          database: data.database,
          success: true,
          message: "Reservation made successfully.",
          startDate: data.reservation.startDate,
          reserved: data.reservation.reserved,
        },
      };
    } else {
      return {
        type: "response_result",
        data: {
          database: data.database,
          success: false,
          message: "Could not make reservation.",
        },
      };
    }
  } catch (error) {
    console.log("Error contacting DB server:", error);

    // @TODO
    // This should not require the res anymore so we can get rid of sending it to the function
    sendErrorResponse(res, "Failed to fetch data from the database.");
    return;
  }
}

export default sendReservation;
