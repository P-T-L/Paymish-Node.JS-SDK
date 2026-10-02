const { sanitize } = require("./utils/sanitize");

class PaymishError extends Error {
  constructor(message, statusCode, errors = null, requestData = null) {
    super(message);
    this.name = "PaymishError";
    this.statusCode = statusCode;
    this.errors = errors;

    // Sanitize any request payload attached to the error object
    this.requestData = requestData ? sanitize(requestData) : null;
  }
}

module.exports = { PaymishError };
