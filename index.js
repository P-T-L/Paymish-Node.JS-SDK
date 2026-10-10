const HttpClient = require("./src/client");
const { PaymishError } = require("./src/errors");
const Auth = require("./src/resources/auth");
const Business = require("./src/resources/business");
const Customer = require("./src/resources/customer");

class Paymish {
  constructor(options = {}) {
    this.client = new HttpClient(options);

    this.auth = new Auth(this.client);
    this.business = new Business(this.client);
    this.customer = new Customer(this.client);
  }
}

module.exports = Paymish;
module.exports.PaymishError = PaymishError;
