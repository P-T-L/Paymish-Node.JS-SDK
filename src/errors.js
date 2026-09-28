class PaymishError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.name = "PaymishError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = { PaymishError };
