const SERVER_PORT = 8000;

const processUrlData = () => {
    let url = window.location.search.substring(1);
    const urlSplit = url.split("&");

    const startDate = urlSplit[0];
    const email = urlSplit[1];

    const urlData = {
        startDate: startDate.split("=")[1],
        email: email.split("=")[1]
    }
    return urlData;
}

const handleReservation = async (urlData) => {
    const container = document.getElementById("container");

    // Letting the client know how the reservation is going
    const statusIndicatorP = document.createElement("h1");
    statusIndicatorP.textContent = "Reserving...";
    container.appendChild(statusIndicatorP);
  
    const backButton = document.createElement("button");
    backButton.addEventListener("click", () => window.location.href = "/src/frontend/index.html");
    backButton.textContent = "Return to home page";
    container.appendChild(backButton);

    const response = await fetch(`http://localhost:${SERVER_PORT}/reserve`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            data: {
               contractorEmail: urlData.email,
               startDate: urlData.startDate 
            }
        })
    })

    if (response.status !== 200) {
        statusIndicatorP.textContent = "Failed to reserve the timeslot.";
        return;
    }
    statusIndicatorP.textContent = "Reservation successful.";  
}

const urlData = processUrlData();
handleReservation(urlData);
