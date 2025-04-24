import sendReservation from "./sendReservation.js";

async function retryReservation(port, data, maxRetries) {

    const dbURL = `http://localhost:${port}`;

    for(let retry = 1; retry <= maxRetries; retry++) {
        console.log(`Attempting to reserve on port ${port}...`)
        const result = await sendReservation(data, dbURL);

        // If reserve succeed on a retry
        if(result?.data?.success) {
            console.log(`Retry succeeded on try ${retry} on port ${port}.`);
            return ({
                success: true,
                port,
            });
        }
    }
    console.log(`Failed all of the retries on port ${port}.`);
    return ({
        success: false,
        port,
    })
}


export default retryReservation;