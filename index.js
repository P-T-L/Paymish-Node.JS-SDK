const HttpClient = require("./src/client");
const { PaymishError } = require("./src/errors");
const Auth = require("./src/resources/auth");
const Banks = require("./src/resources/banks");
const Business = require("./src/resources/business");
const Customer = require("./src/resources/customer");
const DedicatedVirtualAccount = require("./src/resources/dedicated-virtual-account");
const Dispute = require("./src/resources/dispute");
const InitializeCheckout = require("./src/resources/initialize-checkout");
const Invoices = require("./src/resources/invoices");
const PaymentPages = require("./src/resources/payment-pages");
const Plans = require("./src/resources/plans");
const Products = require("./src/resources/products");
const Recipients = require("./src/resources/recipients");
const Settlements = require("./src/resources/settlements");
const SplitPages = require("./src/resources/split-pages");
const Subaccounts = require("./src/resources/subaccounts");
const Subscription = require("./src/resources/subscription");
const Transaction = require("./src/resources/transaction");
const TransactionCustomer = require("./src/resources/transaction-customer");
const TransactionDisputes = require("./src/resources/transaction-disputes");
const Transactions = require("./src/resources/transactions");
const Transfer = require("./src/resources/transfer");
const Transfers = require("./src/resources/transfers");

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
    this.invoices = new Invoices(this.client);
    this.paymentPages = new PaymentPages(this.client);
    this.plans = new Plans(this.client);
    this.products = new Products(this.client);
    this.recipients = new Recipients(this.client);
    this.settlements = new Settlements(this.client);
    this.splitPages = new SplitPages(this.client);
    this.subaccounts = new Subaccounts(this.client);
    this.subscription = new Subscription(this.client);
    this.transaction = new Transaction(this.client);
    this.transactions = new Transactions(this.client);
    this.transfer = new Transfer(this.client);
    this.transfers = new Transfers(this.client);
  }
}

module.exports = Paymish;
module.exports.PaymishError = PaymishError;
