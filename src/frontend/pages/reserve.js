const SERVER_PORT = 8000;

const getEmailFromUrl = () => {
    let url = window.location.search.substring(1);
    const consultEmail = url.split("=")[1];
    return consultEmail;
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
}

const consultEmail = getEmailFromUrl();
fetchTimeSlots(consultEmail)

