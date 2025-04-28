const HANDLER_PORT = 8000;

/**
 * @TODO Implement this, if necessary
 *
 * Currently only demonstrates the client can send requests 
 * to a node within the system.
 */ 
const fetchConsultantByName = async () => {
  const response = await fetch(`http://localhost:${HANDLER_PORT}/all`, {
    method: "GET",
    headers: {
        "content-type": "application/json",
    },
  });
  const consultantData = await response.json();
  const container = document.getElementById("container");

  // Creating an entry for each consultant and appending them to a container
  consultantData.contractors.forEach((consultant) => {
    const entry = document.createElement("div");
    entry.className = "consultant-entry"

    const nameP = document.createElement("p");
    const emailP = document.createElement("p");
    const reserveButton = document.createElement("button");

    nameP.className = "consultant-name";
    emailP.className = "consultant-email";
  
    nameP.textContent = consultant.name;
    emailP.textContent = consultant.email;
    reserveButton.textContent = "Reserve a time slot";

    /**
     * Email handling 
     * @src https://stackoverflow.com/questions/22607150/getting-the-url-parameters-inside-the-html-page
     */
    reserveButton.addEventListener("click", () => window.location.href = `/src/frontend/pages/reserve/reserve.html?email=${consultant.email}`)

    entry.appendChild(nameP);
    entry.appendChild(emailP);
    entry.appendChild(reserveButton);

    container.appendChild(
      entry
    );
  });
}

fetchConsultantByName()