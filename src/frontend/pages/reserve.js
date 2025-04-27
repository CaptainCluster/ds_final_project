const SERVER_PORT = 8000;

const getEmailFromUrl = () => {
    let url = window.location.search.substring(1);
    const consultEmail = url.split("=")[1];
    return consultEmail;
}

const formatDateDay = (dateString) => {
    const dayDate = new Date(dateString);
    const formattedDateString = `${dayDate.getDay()}.${dayDate.getMonth()}`;
    return formattedDateString;
}

const formatDateHours = (dateString) => {
    const startDate = new Date(dateString);
    const formattedDateString = `${startDate.getHours()}:00`;
    return formattedDateString;
}

const fetchTimeSlots = async (consultEmail) => {
    const response = await fetch(`http://localhost:${SERVER_PORT}/fetch_data`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            data: {
                contractorEmail: consultEmail,
            }
        })
    });
    const data = await response.json();
    const consultData = data.data.data;
    console.log(consultData)    
    
    const container = document.getElementById("container");
    
    consultData.reservations.forEach(reservationDay => {

        // Continuing the loop if no free timeslots remain
        if (reservationDay.length === 0) {
            return;
        }

        const dayEntry = document.createElement("div");
        dayEntry.className = "day-entry";
        dayEntry.textContent = formatDateDay(reservationDay[0].startDate)

        reservationDay.forEach(reservationSlot => {
            if (reservationSlot.reserved) {
                return;
            }
            const entry = document.createElement("div");
            entry.className = "timeslot-entry"

            const startDateP = document.createElement("p");

            const formattedDate = formatDateHours(reservationSlot.startDate);
            startDateP.textContent = formattedDate

            entry.appendChild(startDateP);

            // Creating the button for reserving the time slot
            const reserveButton = document.createElement("button");
            reserveButton.textContent = "Reserve time";
            reserveButton.className = "reserve-button";
            entry.appendChild(reserveButton);

            dayEntry.appendChild(entry);
        });
        container.appendChild(dayEntry);
    });
}

const consultEmail = getEmailFromUrl();
fetchTimeSlots(consultEmail)

