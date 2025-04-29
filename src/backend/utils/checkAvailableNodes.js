// Checking whether there are available database nodes.
// If not, client is sent a server error.
const checkAvailableNodes = (res, dbURLs, dbPorts) => {
    if (dbPorts.length > 0 && dbURLs.length > 0) {
        return true;
    }
    console.error("No database nodes are available!");
    return false;
}

export default checkAvailableNodes;