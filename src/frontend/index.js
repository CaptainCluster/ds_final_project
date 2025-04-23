console.log("Testi!")

/**
 * @TODO Implement this, if necessary
 *
 * Currently only demonstrates the client can send requests 
 * to a node within the system.
 */ 
const fetchConsultantByName = async () => {
  const response = await fetch("http://localhost:5173/", {
    method: "GET",
    headers: {
        "content-type": "application/json",
    },
  });
  const data = await response.json()
  console.log(data);  
}

fetchConsultantByName();
