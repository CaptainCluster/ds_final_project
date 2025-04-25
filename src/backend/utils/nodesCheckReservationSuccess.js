/** 
 * Checking whether any of the database nodes had a successful
 * reservation update, indicating there is a change that has 
 * to be synchronized. 
 */
const nodesCheckReservationSuccess = (responses) => {
    return responses.some(response => response.data.status)
}

export default nodesCheckReservationSuccess;