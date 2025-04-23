// ---------------- Sending an error message back to the client ---------------- //

function sendErrorResponse(res, message) {
    res.status(500).send({
        "type": "error",
        "data": {
            "message": message
        }
    });
}

export default sendErrorResponse;