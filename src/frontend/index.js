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
  const data = await response.json();
  console.log(data)
  return data;
}

fetchConsultantByName();
