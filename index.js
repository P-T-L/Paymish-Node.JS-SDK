const HttpClient = require("./src/client");
const { PaymishError } = require("./src/errors");
const Auth = require("./src/resources/auth");
const Banks = require("./src/resources/banks");
const Business = require("./src/resources/business");
const Customer = require("./src/resources/customer");
const DedicatedVirtualAccount = require("./src/resources/dedicated-virtual-account");
const Dispute = require("./src/resources/dispute");
const InitializeCheckout = require("./src/resources/initialize-checkout");
const TransactionCustomer = require("./src/resources/transaction-customer");
const TransactionDisputes = require("./src/resources/transaction-disputes");

class Paymish {
  constructor(options = {}) {
    this.client = new HttpClient(options);

    this.auth = new Auth(this.client);
    this.business = new Business(this.client);
    this.customer = new Customer(this.client);
    this.transactionCustomer = new TransactionCustomer(this.client);
    this.dedicatedVirtualAccount = new DedicatedVirtualAccount(this.client);
    this.banks = new Banks(this.client);
    this.dispute = new Dispute(this.client);
    this.transactionDisputes = new TransactionDisputes(this.client);
    this.initializeCheckout = new InitializeCheckout(this.client);
  }
}

module.exports = Paymish;
module.exports.PaymishError = PaymishError;
