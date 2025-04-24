// ---------------- Sending an error message back to the client ---------------- //

function sendErrorResponse(res, message) {
    res.status(500).send({
        "data": {
            "error": message
        }
    });
}

export default sendErrorResponse;