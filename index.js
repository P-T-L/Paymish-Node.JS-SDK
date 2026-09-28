const HttpClient = require("./src/client");
const { PaymishError } = require("./src/errors");
const Auth = require("./src/resources/auth");

class Paymish {
  constructor(options = {}) {
    this.client = new HttpClient(options);

    this.auth = new Auth(this.client);
  }
}

module.exports = Paymish;
module.exports.PaymishError = PaymishError;
