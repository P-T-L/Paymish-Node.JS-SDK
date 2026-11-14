# Paymish Node.js SDK

The official Node.js SDK for integrating with the **Paymish API**. Built with **zero runtime dependencies** using native `fetch` and modern asynchronous JavaScript standards.

Official Developer API docs: https://docs.paymish.com/
Official Swagger API docs: https://api.paymish.com/api/user-service/external/v1/docs/

---

## Features

- **Zero Runtime Dependencies:** Built entirely on Node.js native `fetch` and core cryptography modules.
- **Resilient HTTP Engine:** Automatic retries with exponential backoff for transient server errors (`5xx`) and network timeouts.
- **Automatic Idempotency:** Auto-generates unique `Idempotency-Key` headers for state-changing HTTP requests (`POST`, `PUT`, `PATCH`).
- **Data Sanitization:** Automatically redacts sensitive fields (API keys, secret tokens, credentials) on attached error objects and logs.
- **First-Class TypeScript Support:** Includes comprehensive TypeScript definitions (`index.d.ts`) out of the box for auto-completion and inline documentation.

---

## Installation

Install via `npm`:

```bash
npm install paymish-node.js-sdk
```

> **Requirement:** Node.js `>= 18.0.0` is required for native `fetch` and `AbortSignal.timeout` support.

---

## Quick Start

```javascript
const Paymish = require("paymish-node.js-sdk");

// Initialize the client
const paymish = new Paymish({
  baseUrl: "[https://api.paymish.com](https://api.paymish.com)", // Optional (default: [https://api.paymish.com](https://api.paymish.com))
  timeout: 10000, // Optional request timeout in ms (default: 10000)
});

async function main() {
  try {
    // 1. Generate Auth Token
    const authResponse = await paymish.auth.generateToken({
      public_key: "pk_test_123456789",
      secret_key: "sk_test_987654321",
    });

    console.log("Token Generated:", authResponse);

    // 2. Interact with Business API
    const businessDetails = await paymish.business.getDetails({
      headers: {
        Authorization: `Bearer ${authResponse.data.token}`,
      },
    });

    console.log("Business Profile:", businessDetails);
  } catch (error) {
    if (error instanceof Paymish.PaymishError) {
      console.error(`Paymish Error [${error.statusCode}]:`, error.message);
      console.error("Validation Errors:", error.errors);
      console.error("Sanitized Request Payload:", error.requestData);
    } else {
      console.error("Unexpected Error:", error);
    }
  }
}

main();
```

---

## Client Configuration

When instantiating the Paymish client, you can pass an optional configuration object to customize global HTTP execution behavior:

```javascript
const paymish = new Paymish({
  baseUrl: "[https://api.paymish.com](https://api.paymish.com)",
  timeout: 10000, // Request timeout in milliseconds (default: 10000)
  maxRetries: 3, // Max retry attempts for 5xx errors and timeouts (default: 3)
  retryDelayMs: 500, // Initial base delay for exponential backoff in ms (default: 500)
});
```

### Options

| Property       | Type     | Default                     | Description                                                                                            |
| :------------- | :------- | :-------------------------- | :----------------------------------------------------------------------------------------------------- |
| `baseUrl`      | `string` | `"https://api.paymish.com"` | Base API endpoint. Enforces `http:` or `https:` protocol and normalizes trailing slashes.              |
| `timeout`      | `number` | `10000`                     | Request timeout duration in milliseconds.                                                              |
| `maxRetries`   | `number` | `3`                         | Maximum retry attempts for retryable `5xx` responses and network timeouts.                             |
| `retryDelayMs` | `number` | `500`                       | Base delay in milliseconds used for exponential backoff calculations (`retryDelayMs * 2^(attempt-1)`). |

---

## API Reference

### Auth Resource (`paymish.auth`)

#### `generateToken(credentials, [options])`

Generates an authentication JWT token using public and secret application keys.

- `credentials (Object, Required)`
  - `public_key (string, Required)` — Your Paymish public key.
  - `secret_key (string, Required)` — Your Paymish secret key.
- `options (Object, Optional)` — Custom per-request configuration options (e.g., custom headers or per-request timeout override).

```javascript
const tokenResponse = await paymish.auth.generateToken(
  {
    public_key: "pk_test_...",
    secret_key: "sk_test_...",
  },
  {
    idempotencyKey: "custom_idempotency_key_123", // Explicit idempotency key
    customTimeout: 5000, // Override timeout for this specific call
  }
);
```

### Banks Resource (`paymish.banks`)

#### `list([options])`

Retrieves the list of banks supported by Paymish (includes codes required for transfers and account resolutions).

- `options (Object, Optional)` — Custom per-request configuration options (e.g., headers containing `Authorization`).

```javascript
const banks = await paymish.banks.list({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `resolveAccount(params, [options])`

Confirms that an account number exists at a bank and returns the account holder's name.

- `params (Object, Required)`
  - `account_number (string, Required)` — The 10-digit (NUBAN) account number.
  - `bank_code (string, Required)` — The bank's code from `list()`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const resolved = await paymish.banks.resolveAccount(
  {
    account_number: "0123456789",
    bank_code: "058",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Business Resource (`paymish.business`)

#### `changeMode(payload, [options])`

Toggles or changes the environment mode of the business between Live and "not Live" environments.

- `payload (Object \| boolean, Required)` — Pass `{ isLive: boolean }` or directly a boolean value (`true` for Live, `false` for "not Live").
- `options (Object, Optional)` — Custom per-request configuration options (e.g., headers containing `Authorization`).

```javascript
// Passing object parameter
const response = await paymish.business.changeMode(
  { isLive: false },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);

// Or passing a direct boolean
const response = await paymish.business.changeMode(true, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `getDetails([options])`

Retrieves full details for the authenticated business profile.

- `options (Object, Optional)` — Custom per-request configuration options (e.g., headers containing `Authorization`).

```javascript
const businessProfile = await paymish.business.getDetails({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `createBusiness(payload, [options])`

Adds a new business profile under the account.

- `payload (Object, Required)`
  - `countryId (number, Required)` — Country identifier.
  - `businessName (string, Required)` — Name of the business.
  - `businessCategory (number, Required)` — Category identifier.
  - `businessDescription (string, Optional)` — Description of the business.
- `options (Object, Optional)` — Custom per-request configuration options.

```javascript
const newBusiness = await paymish.business.createBusiness(
  {
    countryId: 1,
    businessName: "Acme Corp",
    businessCategory: 2,
    businessDescription: "E-commerce platform",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listBusinesses([options])`

Retrieves the list of businesses associated with the account.

- `options (Object, Optional)` — Custom per-request configuration options.

```javascript
const businesses = await paymish.business.listBusinesses({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Customer Resource (paymish.customer)

#### `createCustomer(payload, [options])`

Creates a new customer record.

- `payload (Object, Required)`
  - `email (string, Required)` — Customer email address.
  - `firstName (string, Required)` — Customer first name.
  - `lastName (string, Required)` — Customer last name.
  - `phoneNumber (string, Required)` — Customer phone number.
  - `countryId (number, Required)` — Country identifier.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const customer = await paymish.customer.createCustomer(
  {
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1234567890",
    countryId: 1,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `updateCustomer(payload, [options])`

Updates an existing customer record.

- `payload (Object, Required)`
  - `customerReference (string, Required)` — The reference ID of the customer.
  - Other updatable profile properties.
- `options (Object, Optional)` — Custom per-request options.

#### `listCustomers([params], [options])`

Retrieves a paginated list of customers. Automatically defaults to `page: 1` and `limit: 10` if omitted.

- `params (Object, Optional)` — Query parameters (e.g., `{ page: 2, limit: 20, search: "John" }`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const customers = await paymish.customer.listCustomers(
  { page: 1, limit: 15 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `blacklistCustomer(payload, [options])`

Blacklists or whitelists a customer profile.

- `payload (Object, Required)`
  - `customerReference (string, Required)` — The reference ID of the customer.
  - `isBlackListed (boolean, Required)` — Set true to blacklist or false to whitelist.
- options (Object, Optional) — Custom per-request options.

```javascript
await paymish.customer.blacklistCustomer(
  {
    customerReference: "CUST_12345",
    isBlackListed: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getCustomerById(customerId, [options])`

Retrieves customer details by integer ID.

- `customerId (number, Required)` — The customer's integer ID (supports passing as a direct number or via { customerId: number }).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const customerDetails = await paymish.customer.getCustomerById(101, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### TransactionCustomer Resource (paymish.transactionCustomer)

#### `listCustomers([params], [options])`

Retrieves a paginated list of transaction-service customers.

- `params (Object, Optional)` — Query parameters for filtering and pagination.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const txCustomers = await paymish.transactionCustomer.listCustomers(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `createCustomer(payload, [options])`

Creates a new customer in the transaction service.

- `payload (Object, Required)` — Customer details payload.
- `options (Object, Optional)` — Custom per-request options.

#### `getCustomerById(identifier, [options])`

Retrieves transaction customer details by ID (supports string or numeric IDs).

- `identifier (string | number | Object, Required)` — Customer ID string/number or options object containing id or customerId.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const txCustomer = await paymish.transactionCustomer.getCustomerById("tx_cust_123", {
`headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateCustomer(identifier, payload, [options])`

Updates an existing transaction customer by ID.

- `identifier (string | number | Object, Required)` — Customer ID or options object.
- `payload (Object, Required)` — Updated customer properties.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.transactionCustomer.updateCustomer(
  "tx_cust_123",
  { firstName: "Jonathan" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### DedicatedVirtualAccount Resource (paymish.dedicatedVirtualAccount)

#### `createAccount(payload, [options])`

Creates a new dedicated virtual account.

- `payload (Object, Required)` — Account creation details payload.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const account = await paymish.dedicatedVirtualAccount.createAccount(
  { customerId: "tx_cust_123", preferredBank: "test-bank" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listAccounts([params], [options])`

Retrieves a paginated list of dedicated virtual accounts (defaults to `page: 1` and `limit: 10`).

- `params (Object, Optional)` — Query parameters (e.g., `{ page: 1, limit: 10 }`).
- `options (Object, Optional)` — Custom per-request options.

#### `getAccountByCustomerId(identifier, [options])`

Retrieves a dedicated virtual account by customer ID.

- `identifier (string | number | Object, Required)` — Customer ID or options object containing customerId or id.
- `options (Object, Optional)` — Custom per-request options.

#### `updateAccountByCustomerId(identifier, payload, [options])`

Updates a dedicated virtual account by customer ID.

- `identifier (string | number | Object, Required)` — Customer ID or options object.
- `payload (Object, Required)` — Updated account details.
- `options (Object, Optional)` — Custom per-request options.

#### `requeryAccount(params, [options])`

Requeries the status of a dedicated virtual account.

- `params (Object, Required)`
  - `account_number (string, Required)` — Account number to requery.
  - `provider_slug (string, Required)` — Provider slug.
  - `date (string, Optional)` — Optional date filter.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const requeryResult = await paymish.dedicatedVirtualAccount.requeryAccount(
  { account_number: "1234567890", provider_slug: "test-provider" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `assignAccount(payload, [options])`

Assigns a dedicated virtual account.

- `payload (Object, Required)`
  - `email (string, Required)` — Customer email.
  - `first_name (string, Required)` — Customer first name.
  - `last_name (string, Required)` — Customer last name.
  - `phone (string, Required)` — Customer phone number.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const assigned = await paymish.dedicatedVirtualAccount.assignAccount(
  {
    email: "jane.doe@example.com",
    first_name: "Jane",
    last_name: "Doe",
    phone: "+2348012345678",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Dispute Resource (paymish.dispute)

#### `createDispute(payload, [options])`

Creates a dispute by uploading a document (evidence image) and providing transaction details using multipart form-data.

- `payload (Object \| FormData, Required)`
  - `transactionRef (string, Required)` — The reference of the transaction for which the dispute is being raised.
  - `disputeReason (string, Required)` — The reason for raising the dispute.
  - `disputeDescription (string, Required)` — Detailed description of the dispute.
  - `image (any, Required)` — The file or stream to be uploaded (dispute evidence image).
- `options (Object, Optional)` — Custom per-request configuration options.

```javascript
const dispute = await paymish.dispute.createDispute(
  {
    transactionRef: "PM-TX-12345",
    disputeReason: "Unauthorized charge",
    disputeDescription: "Customer did not authorize this transaction.",
    image: fs.createReadStream("evidence.png"),
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listDisputes([params], [options])`

Retrieves a paginated list of disputes.

- `params (Object, Optional)`
  - `limit (number, Optional)` — Maximum number of disputes per page (default: `10`).
  - `page (number, Optional)` — The page number to retrieve (default: `1`).
  - `search (string, Optional)` — Search string to filter disputes by transaction reference or customer details.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const disputes = await paymish.dispute.listDisputes(
  { limit: 10, page: 1, search: "PM-TX-12345" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDisputeDetails(transactionRef, [options])`

Retrieves dispute details by transaction reference.

- `transactionRef (string \| Object, Required)` — The transaction reference string or an object containing `{ transactionRef }`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.dispute.getDisputeDetails("PM-TX-12345", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateDispute(payload, [options])`

Updates an existing dispute record.

- `payload (Object, Required)`
  - `tnxRef (string, Required)` — The transaction reference.
  - `reason (string, Required)` — The reason for the update.
  - `status (string, Required)` — The new status of the dispute (e.g., `resolved`, `pending`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.dispute.updateDispute(
  {
    tnxRef: "PM-TX-12345",
    reason: "Merchant accepted liability",
    status: "resolved",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### TransactionDisputes Resource (`paymish.transactionDisputes`)

#### `listDisputes([options])`

Retrieves the list of transaction-level disputes.

- `options (Object, Optional)` — Custom per-request configuration options (e.g., headers containing `Authorization`).

```javascript
const disputes = await paymish.transactionDisputes.listDisputes({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `createDispute([payload], [options])`

Creates a new transaction-level dispute.

- `payload (Object, Optional)` — Dispute creation details payload.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const newDispute = await paymish.transactionDisputes.createDispute(
  { transactionId: "tx_123", reason: "fraud" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDisputeById(disputeId, [options])`

Retrieves a transaction-level dispute by its ID.

- `disputeId (string \| number \| Object, Required)` — The dispute ID string/number or options object.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const dispute = await paymish.transactionDisputes.getDisputeById("disp_123", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateDispute(disputeId, payload, [options])`

Updates an existing transaction-level dispute by its ID.

- `disputeId (string \| number \| Object, Required)` — The dispute ID string/number or options object.
- `payload (Object, Required)` — Update payload containing updated dispute details.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updatedDispute = await paymish.transactionDisputes.updateDispute(
  "disp_123",
  { status: "resolved", resolutionNote: "Refund issued" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### InitializeCheckout Resource (`paymish.initializeCheckout`)

#### `initializeTransaction(payload, [options])`

Initializes a standard checkout transaction from your backend.

- `payload (Object, Required)`
  - `email (string, Required)` — Customer's email address.
  - `amount (string \| number, Required)` — Amount in currency subunits (e.g. kobo/cents).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const response = await paymish.initializeCheckout.initializeTransaction(
  { email: "customer@email.com", amount: 10000 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `initializeDva(payload, [options])`

Initializes a transaction and gets back a one-time Dynamic Virtual Account (bank transfer) synchronously.

- `payload (Object, Required)`
  - `email (string, Required)` — Customer's email address.
  - `amount (string \| number, Required)` — Amount in currency subunits.
  - `reference (string, Optional)` — Optional unique reference for this transaction (auto-generated if omitted).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const dvaResponse = await paymish.initializeCheckout.initializeDva(
  { email: "customer@email.com", amount: 10000, reference: "my_ref_123" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Invoices Resource (`paymish.invoices`)

#### `createInvoice(payload, [options])`

Creates a new invoice.

- `payload (Object, Required)`
  - `customerEmail (string, Required)` — Customer's email address.
  - `amount (number, Required)` — Invoice amount.
  - `note (string, Optional)` — Optional invoice note.
  - `sendImmediately (boolean, Optional)` — Defaults to true. When false, the invoice is created as a Draft.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const invoice = await paymish.invoices.createInvoice(
  { customerEmail: "customer@email.com", amount: 5000 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listInvoices([params], [options])`

Retrieves a paginated list of invoices with optional query filters.

- `params (Object, Optional)`
  - `status (string, Optional)` — Filter by invoice status.
  - `startDate (string, Optional)` — Filter by start date (`YYYY-MM-DD`).
  - `endDate (string, Optional)` — Filter by end date (`YYYY-MM-DD`).
  - `search (string, Optional)` — Search by invoice ID or customer name/email.
  - `page (number, Optional)` — Page number.
  - `limit (number, Optional)` — Number of items per page.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const invoices = await paymish.invoices.listInvoices(
  { status: "paid", page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getInvoiceById(invoiceId, [options])`

Retrieves a single invoice by its ID.

- `invoiceId (string \| number \| Object, Required)` — The invoice ID string/number or options object.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const invoice = await paymish.invoices.getInvoiceById("PM-REF-12345", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### PaymentPages Resource (`paymish.paymentPages`)

#### `checkCustomLinkExists(payload, [options])`

Checks if a custom payment page link exists or is available.

- `payload (Object | string, Required)` — Payload containing `customLink` or a direct link string.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const result = await paymish.paymentPages.checkCustomLinkExists(
  {
    customLink: "https://example.com/my-custom-link",
  },
  {
    headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
  }
);
```

#### `createPaymentPage(payload, [options])`

Creates a new payment page.

- `payload (Object, Required)` — Payment page creation details.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const page = await paymish.paymentPages.createPaymentPage(
  {
    title: "Summer Collection",
    description: "Checkout for summer items",
    amount: 15000,
    customLink: "https://example.com/summer-sale",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getPaymentPages([params], [options])`

Retrieves a list of payment pages.

- `params (Object, Optional)` — Query parameters for filtering and pagination.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const pages = await paymish.paymentPages.getPaymentPages(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getPageDetails(identifier, [options])`

Retrieves detailed information for a specific payment page.

- `identifier (string | number | Object, Required)` — Page ID, reference, or options object.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.paymentPages.getPageDetails("page_ref_123", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updatePaymentPage(payload, [options])`

Updates details for an existing payment page.

- `payload (Object, Required)` — Update details payload containing page identifiers and fields to update.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.paymentPages.updatePaymentPage(
  { pageId: 123, title: "Updated Title" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `updatePageStatus(payload, [options])`

Updates the active or published status of a payment page.

- `payload (Object, Required)` — Status update payload.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.paymentPages.updatePageStatus(
  { pageId: 123, status: "active" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deletePage(payload, [options])`

Deletes a payment page.

- `payload (Object | string | number, Required)` — Page ID or payload containing the page identifier.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.paymentPages.deletePage(123, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `getAssociatedProducts(identifier, [options])`

Retrieves products associated with a specific payment page.

- `identifier (string | number | Object, Required)` — Page ID or options object.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const products = await paymish.paymentPages.getAssociatedProducts(123, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `addProductToPaymentPage(payload, [options])`

Adds one or more products to a payment page.

- `payload (Object, Required)`
  - `pageId (number | string, Required)` — The ID of the payment page.
  - `productIds (Array | string, Required)` — Product ID(s) to add.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.paymentPages.addProductToPaymentPage(
  {
    pageId: 447,
    productIds: [123, 456, 789],
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteProductFromPaymentPage(payload, [options])`

Deletes a product from a payment page.

- `payload (Object | string | number, Required)` — Payload containing `paymentPageProductId` or direct product ID value.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.paymentPages.deleteProductFromPaymentPage(
  { paymentPageProductId: 123 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `initiateCheckoutDynamicVirtualAccount(payload, [options])`

Allocates a one-time dynamic virtual account (bank transfer option) for a checkout session.

- `payload (Object, Required)`
  - `accessCode (string, Required)` — Checkout session access code.
  - `amount (number, Required)` — Amount to be paid in Naira.
  - `email (string, Optional)` — Customer email address.
  - `pageReference (string, Optional)` — Optional reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const dva = await paymish.paymentPages.initiateCheckoutDynamicVirtualAccount({
  accessCode: "chk_9f8a7b6c5d4e",
  amount: 5000,
  email: "customer@example.com",
});
```

#### `listPaymentPages([options])`

Lists payment pages via the transaction service.

- `options (Object, Optional)` — Custom per-request options.

```javascript
const transactionPages = await paymish.paymentPages.listPaymentPages({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `createPaymentPageTransactionService(payload, [options])`

Creates a payment page via the transaction service endpoint.

- `payload (Object, Optional)` — Payment page creation payload.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const txPage = await paymish.paymentPages.createPaymentPageTransactionService(
  { title: "New Transaction Page" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Plans Resource (`paymish.plans`)

#### `createPlan(payload, [options])`

Creates a new payment plan.

- `payload (Object, Required)`
  - `businessId (number, Required)` — ID of the business.
  - `planName (string, Required)` — Name of the plan.
  - `planDescription (string, Required)` — Description of the plan.
  - `planAmount (number, Required)` — Amount for the plan.
  - `interval (string, Required)` — Interval of the plan (e.g., Monthly, Yearly).
  - `maxNoOfPayment (number, Required)` — Maximum number of payments allowed for the plan.
  - `isSubscriptionPageForThisPlan (boolean, Required)` — Indicates if there is a subscription page for this plan.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const plan = await paymish.plans.createPlan(
  {
    businessId: 10,
    planName: "Gold Plan",
    planDescription: "Monthly premium subscription",
    planAmount: 5000,
    interval: "monthly",
    maxNoOfPayment: 12,
    isSubscriptionPageForThisPlan: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getPlans([params], [options])`

Retrieves a paginated list of payment plans with optional filters.

- `params (Object, Optional)` — Optional query parameters (e.g., `{ status: "Active", interval: "monthly", page: 1, limit: 10 }`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const plans = await paymish.plans.getPlans(
  { status: "Active", page: 1 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getPlanDetails(identifier, [options])`

Retrieves detailed information for a specific payment plan.

- `identifier (Object | number | string, Required)` — Plan ID or options object containing `planId`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const planDetails = await paymish.plans.getPlanDetails(98, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updatePlanDetails(payload, [options])`

Updates details for an existing payment plan.

- `payload (Object, Required)`
  - `planId (number, Required)` — The ID of the plan to update.
  - `planName (string, Required)` — The name of the plan.
  - `planDescription (string, Required)` — A description of the plan.
  - `planAmount (number, Required)` — The amount for the plan.
  - `interval (string, Required)` — Interval of the plan.
  - `maxNoOfPayment (number, Required)` — Maximum number of payments allowed.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.plans.updatePlanDetails(
  {
    planId: 98,
    planName: "Updated Plan Name",
    planDescription: "Updated plan description",
    planAmount: 200,
    interval: "Monthly",
    maxNoOfPayment: 5,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deletePlan(payload, [options])`

Deletes or updates the status of an existing payment plan.

- `payload (Object, Required)`
  - `planId (number, Required)` — The ID of the plan.
  - `status (string, Required)` — The plan status action (e.g., `deleted`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.plans.deletePlan(
  {
    planId: 98,
    status: "deleted",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listPlansTransactionService([params], [options])`

Retrieves a list of payment plans via the transaction service.

- `params (Object, Optional)` — Query parameters for filtering and pagination.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transactionPlans = await paymish.plans.listPlansTransactionService(
  { page: 1 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `createPlanTransactionService([payload], [options])`

Creates a new payment plan via the transaction service.

- `payload (Object, Optional)` — Plan creation payload for transaction service.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const txPlan = await paymish.plans.createPlanTransactionService(
  { planName: "Tx Plan", amount: 1000 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Products Resource (`paymish.products`)

#### `createProduct(payload, [options])`

Creates a new product (supports multipart form-data for file uploads like product images).

- `payload (Object | FormData, Required)`
  - `productName (string, Required)` — The name of the product.
  - `productDescription (string, Required)` — Description of the product.
  - `price (number | string, Required)` — Product price.
  - `productType (string, Required)` — Type of product (e.g., `digital`, `physical`).
  - Other product properties and media files.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const product = await paymish.products.createProduct(
  {
    productName: "E-Book Guide",
    productDescription: "Learn web development from scratch",
    price: "2500.00",
    productType: "digital",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getProducts([params], [options])`

Retrieves a paginated list of products.

- `params (Object, Optional)` — Optional query parameters for filtering and pagination.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const products = await paymish.products.getProducts(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getProductDetails(identifier, [options])`

Retrieves detailed information for a specific product.

- `identifier (string | number | Object, Required)` — Product ID or options object containing `productId` or `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.products.getProductDetails("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateProduct(payload, [options])`

Updates details for an existing product.

- `payload (Object, Required)`
  - `productId (string | number, Required)` — The ID of the product to update.
  - Other updatable fields.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateProduct(
  {
    productId: "143",
    productName: "Updated E-Book Title",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `updateProductStatus(payload, [options])`

Updates the active or published status of a product.

- `payload (Object, Required)`
  - `productId (string | number, Required)` — The ID of the product.
  - `status (boolean | string, Required)` — Status value or action.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateProductStatus(
  { productId: "143", status: true },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteProduct(payload, [options])`

Deletes a product.

- `payload (Object | string | number, Required)` — Product ID or payload containing product identifiers.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.deleteProduct("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `getDigitalDownloadFiles(identifier, [options])`

Retrieves digital download files associated with a specific product.

- `identifier (string | number | Object, Required)` — Product ID or options object containing `productId` or `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const files = await paymish.products.getDigitalDownloadFiles("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `renameDigitalDownloadFiles(payload, [options])`

Renames an existing digital download file associated with a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `digitalDownloadFileId (string, Required)` — The ID of the digital download file to rename.
  - `fileName (string, Required)` — The new name for the digital download file.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.renameDigitalDownloadFiles(
  {
    productId: "143",
    digitalDownloadFileId: "29",
    fileName: "new-file-name.png",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteDigitalDownloadFiles(payload, [options])`

Deletes or updates the status of an existing digital download file.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `digitalDownloadFileId (string, Required)` — The ID of the digital download file.
  - `status (boolean, Required)` — The status action.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.deleteDigitalDownloadFiles(
  {
    productId: "143",
    digitalDownloadFileId: "29",
    status: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `setDownloadLinkExpiry(payload, [options])`

Sets the download link expiry configuration for a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `isDownloadLinkExpiry (boolean, Required)` — Flag to indicate if download link expiry is enabled.
  - `downloadLinkExpiryDuration (string, Required)` — The duration for which the download link will be active.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.setDownloadLinkExpiry(
  {
    productId: "143",
    isDownloadLinkExpiry: true,
    downloadLinkExpiryDuration: "30",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `addDeliveryFees(payload, [options])`

Adds delivery fees for a specific location to a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `location (string, Required)` — The location for which delivery fees are being added.
  - `fees (string, Required)` — The amount of delivery fees.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.addDeliveryFees(
  {
    productId: "143",
    location: "New York",
    fees: "15.00",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDeliveryFees(identifier, [options])`

Retrieves delivery fees for a specific product.

- `identifier (string | number | Object, Required)` — Product ID or options object containing `productId` or `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const fees = await paymish.products.getDeliveryFees("143", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateDeliveryFees(payload, [options])`

Updates an existing delivery fee record for a product.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `deliveryFeesId (string, Required)` — The ID of the delivery fee record to update.
  - `location (string, Required)` — The location for which the delivery fees are being updated.
  - `fees (string, Required)` — The amount of delivery fees.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateDeliveryFees(
  {
    productId: "143",
    deliveryFeesId: "22",
    location: "Kaduna State",
    fees: "25.00",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteDeliveryFees(payload, [options])`

Deletes or updates the status of an existing delivery fee record.

- `payload (Object, Required)`
  - `productId (string, Required)` — The ID of the product.
  - `deliveryFeesId (string, Required)` — The ID of the delivery fee record.
  - `status (boolean, Required)` — The status action.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.deleteDeliveryFees(
  {
    productId: "143",
    deliveryFeesId: "22",
    status: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `slugExist(payload, [options])`

Checks whether a product slug already exists.

- `payload (Object | string, Required)` — Slug string or options object containing `slug`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const exists = await paymish.products.slugExist("my-product-slug", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `addDiscountCode(payload, [options])`

Creates a new discount code.

- `payload (Object, Required)`
  - `code (string, Required)` — The discount code.
  - `value (number, Required)` — The discount value.
  - `discounttype (string, Required)` — The type of discount (e.g. percentage, flat).
  - `productId (number, Optional)` — Optional product ID.
  - Other optional configuration rules (`minOrderAmount`, `maxUsePerCustomer`, `maxClaims`, `startDate`, `endDate`, `isActive`, `isDelete`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const discount = await paymish.products.addDiscountCode(
  {
    code: "SUMMER20",
    value: 20,
    discounttype: "percentage",
    isActive: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDiscountCodes([params], [options])`

Retrieves discount codes based on optional query parameters like productId or code.

- `params (Object, Optional)`
  - `productId (string | number, Optional)` — Product ID filter.
  - `code (string, Optional)` — Discount code filter.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const codes = await paymish.products.getDiscountCodes(
  { productId: "123" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `updateDiscountCodeDetails([payload], [options])`

Updates discount code details.

- `payload (Object, Optional)` — Update discount code payload details.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.products.updateDiscountCodeDetails(
  { id: 1, value: 25 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `verifyDiscountCode(payload, [options])`

Verifies a discount code, with an optional product ID query parameter.

- `payload (Object, Required)`
  - `code (string, Required)` — The discount code to verify.
  - `productId (string | number, Optional)` — Optional product ID.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.products.verifyDiscountCode(
  {
    productId: "123",
    code: "SUMMER20",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Recipients Resource (`paymish.recipients`)

#### `getRecipientList(params, [options])`

Retrieves a paginated list of transfer recipients for a business.

- `params (Object, Required)`
  - `businessId (string, Required)` — The unique identifier for the business.
  - `limit (integer, Required)` — Number of results to return per page.
  - `page (integer, Required)` — Current page number for pagination.
  - `status (boolean, Optional)` — Filter by recipient status (`true` for active, `false` for inactive).
  - `searchRecipientAccountName (string, Optional)` — Search filter for recipient account name.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const recipients = await paymish.recipients.getRecipientList(
  {
    businessId: "biz_123",
    limit: 10,
    page: 1,
    status: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getRecipientDetails(identifier, [options])`

Retrieves details for a specific recipient by recipient code.

- `identifier (string | Object, Required)` — Recipient code string or an options object containing recipientCode.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const recipient = await paymish.recipients.getRecipientDetails("RCP_12345", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `deleteRecipient(identifier, [options])`

Deletes a transfer recipient by recipient ID.

- `identifier (string | Object, Required)` — Recipient ID string or an options object containing recipientId.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.recipients.deleteRecipient("rec_12345", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `blacklistRecipient(payload, [options])`

Blacklists or unblacklists a transfer recipient.

- `payload (Object, Required)`
  - `recipientId (number | string, Required)` — ID of the recipient to be blacklisted.
  - `isBlackListed (boolean, Required)` — Flag to indicate if the recipient should be blacklisted.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.recipients.blacklistRecipient(
  {
    recipientId: 1,
    isBlackListed: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Settlements Resource (`paymish.settlements`)

#### `listSettlements([params], [options])`

Retrieves a list of settlements with optional filtering and pagination.

- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of results to return per page.
  - `status (string, Optional)` — Settlement status (e.g., `Paid`, `Unpaid`).
  - `from (string, Optional)` — Settlement date on or after this day (`YYYY-MM-DD`).
  - `to (string, Optional)` — Settlement date on or before this day (`YYYY-MM-DD`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const settlements = await paymish.settlements.listSettlements(
  {
    page: 1,
    limit: 10,
    status: "Paid",
    from: "2026-01-01",
    to: "2026-10-31",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listSettlementTransactions(reference, [params], [options])`

Retrieves a list of transactions associated with a specific settlement reference.

- `reference (string | Object, Required)` — The settlement reference string (e.g., `PAY_xxx`) or an options object containing `reference`.
- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of results to return per page.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transactions = await paymish.settlements.listSettlementTransactions(
  "PAY_12345",
  {
    page: 1,
    limit: 10,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### SplitPages Resource (`paymish.splitPages`)

#### `createSplitPage(payload, [options])`

Creates a new split page.

- `payload (Object, Required)`
  - `name (string, Required)` — Name of the split page.
  - `type (string, Required)` — The type of split (e.g., `percentage`, `fixed`).
  - `currency (string, Required)` — Currency code for the split (e.g., `NGN`).
  - `integration (integer, Required)` — Integration identifier for the split.
  - `domain (string, Required)` — Domain associated with the split page.
  - `active (boolean, Required)` — Indicates if the split page is active.
  - `bearer_type (string, Optional)` — Type of bearer associated with the split.
  - `bearer_subaccount (string, Optional)` — Subaccount associated with the bearer.
  - `createdAt (string, Optional)` — Date and time when the split page was created.
  - `updatedAt (string, Optional)` — Date and time when the split page was last updated.
  - `is_dynamic (boolean, Optional)` — Indicates if the split is dynamic.
  - `subaccounts (Array<Object>, Optional)` — Array of subaccounts.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const splitPage = await paymish.splitPages.createSplitPage(
  {
    name: "fdhfdh",
    type: "percentage",
    currency: "NGN",
    integration: 12345,
    domain: "test",
    active: true,
    is_dynamic: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getAllSplitPages(params, [options])`

Retrieves a paginated list of all split pages with optional filters.

- `params (Object, Required)`
  - `page (integer, Required)` — The page number to retrieve.
  - `limit (integer, Required)` — The number of items per page.
  - `sort (string, Required)` — Sorting criteria (e.g., `createdAt:desc`).
  - `searchString (string, Optional)` — A search string to filter results.
  - `status (boolean, Optional)` — Filter by status (`true` for active, `false` for inactive).
  - `splitType (string, Optional)` — The type of split (e.g., `percentage`, `fixed`).
  - `category (boolean, Optional)` — Filter by category.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const splitPages = await paymish.splitPages.getAllSplitPages(
  {
    page: 1,
    limit: 10,
    sort: "createdAt:desc",
    status: true,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getSplitPageById(identifier, [options])`

Retrieves a split page by its unique identifier.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const splitPage = await paymish.splitPages.getSplitPageById(55, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateSplitPage(identifier, payload, [options])`

Updates an existing split page by ID.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `payload (Object, Required)` — Update payload containing fields to update (e.g., `{ name: "hi2" }`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.splitPages.updateSplitPage(
  55,
  { name: "hi2" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteSplitPage(identifier, [options])`

Deletes a split page by its ID.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.deleteSplitPage(55, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `addSubaccountToSplitPage(identifier, payload, [options])`

Adds a subaccount to an existing split page.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `payload (Object, Required)`
  - `share (integer, Required)` — Share of the subaccount.
  - `sub_account_id (string, Required)` — Subaccount code.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.addSubaccountToSplitPage(
  55,
  {
    share: 30,
    sub_account_id: "ACCT_123",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `updateSubaccountInSplitPage(identifier, payload, [options])`

Updates a subaccount in an existing split page.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing `id`.
- `payload (Object, Required)`
  - `share (integer, Required)` — Share of the subaccount.
  - `sub_account_id (string, Required)` — Subaccount code.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.updateSubaccountInSplitPage(
  55,
  {
    share: 40,
    sub_account_id: "ACCT_123",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteSubaccountFromSplitPage(identifier, [options])`

Removes a subaccount from a split page.

- `identifier (number | string | Object, Required)` — Split page ID or an options object containing id.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.splitPages.deleteSubaccountFromSplitPage(55, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Subaccounts Resource (`paymish.subaccounts`)

#### `createSubaccount(payload, [options])`

Creates a new subaccount.

- `payload (Object, Required)`
  - `business_name (string, Required)` — Name of the business associated with the subaccount.
  - `account_number (string, Required)` — Account number of the subaccount.
  - `percentage_charge (integer, Required)` — Percentage charge for the subaccount.
  - `currency (string, Required)` — Currency code for the subaccount (e.g., `NGN`).
  - `bank (integer, Required)` — Code representing the bank associated with the subaccount.
  - `account_name (string, Required)` — Account name of the subaccount.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subaccount = await paymish.subaccounts.createSubaccount(
  {
    business_name: "dfsdhjfgdsjfd",
    account_number: "1234567890",
    percentage_charge: 10,
    currency: "NGN",
    bank: 999004,
    account_name: "new",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getAllSubaccounts(params, [options])`

Retrieves a paginated list of all subaccounts with required and optional filters.

- `params (Object, Required)`
  - `page (integer, Required)` — The page number to retrieve.
  - `limit (integer, Required)` — The number of items per page.
  - `sort (string, Required)` — Sorting criteria (e.g., `ASC`, `DESC`).
  - `sortKey (string, Required)` — The key/field to sort by (e.g., `createdAt`).
  - `searchString (string, Optional)` — A search string to filter results.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subaccounts = await paymish.subaccounts.getAllSubaccounts(
  {
    page: 1,
    limit: 10,
    sort: "DESC",
    sortKey: "createdAt",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getSubaccountById(identifier, [options])`

Retrieves a subaccount by its unique identifier.

- `identifier (number | string | Object, Required)` — Subaccount ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subaccount = await paymish.subaccounts.getSubaccountById(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateSubaccount(identifier, payload, [options])`

Updates an existing subaccount by ID.

- `identifier (number | string | Object, Required)` — Subaccount ID or an options object containing `id`.
- `payload (Object, Required)` — Update payload containing fields to update (e.g., `{ percentage_charge: 2, active: true }`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.subaccounts.updateSubaccount(
  1,
  { percentage_charge: 2, active: true },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteSubaccount(identifier, [options])`

Deletes a subaccount by its unique identifier.

- `identifier (number | string | Object, Required)` — Subaccount ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.subaccounts.deleteSubaccount(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Subscription Resource (`paymish.subscription`)

#### `getAllSubscriptions(params, [options])`

Retrieves a paginated list of all subscriptions with optional query filters.

- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of records per page.
  - `name (string, Optional)` — Filter subscriptions by name.
  - `status (string, Optional)` — Filter subscriptions by status (e.g., `active`, `expired`).
  - `amount (number, Optional)` — Filter subscriptions by amount.
  - `expiry_start (string, Optional)` — Filter subscriptions expiring after a specific date.
  - `expiry_end (string, Optional)` — Filter subscriptions expiring before a specific date.
  - `sort (string, Optional)` — Sort subscriptions by a specific field (e.g., `createdAt`).
  - `order (string, Optional)` — Sort order (`asc` for ascending, `desc` for descending).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subscriptions = await paymish.subscription.getAllSubscriptions(
  {
    page: 1,
    limit: 10,
    status: "active",
    sort: "createdAt",
    order: "desc",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `createSubscription(payload, [options])`

Creates a new subscription.

- `payload (Object, Required)`
  - `planId (number, Required)` — The ID of the subscription plan.
  - `planName (string, Required)` — The name of the subscription plan.
  - `customerId (string, Required)` — The ID of the customer subscribing.
  - `amount (number, Required)` — The amount charged for the subscription.
  - `nextPaymentDate (string, Required)` — The date of the next payment.
  - `startDate (string, Required)` — The start date of the subscription.
  - `subscriptionCode (string, Required)` — A unique code for the subscription.
  - `paymentCount (integer, Required)` — The number of payments made so far.
  - `interval (string, Required)` — The interval of payments (e.g., `monthly`, `yearly`).
  - `status (string, Required)` — The status of the subscription (e.g., `active`, `canceled`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subscription = await paymish.subscription.createSubscription(
  {
    planId: 10,
    planName: "Gold Plan",
    customerId: "CUST_123",
    amount: 5000,
    nextPaymentDate: "2026-12-01",
    startDate: "2026-11-01",
    subscriptionCode: "SUB_123",
    paymentCount: 1,
    interval: "monthly",
    status: "active",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getSubscriptionById(identifier, [options])`

Retrieves a subscription by its unique ID.

- `identifier (number | string | Object, Required)` — Subscription ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const subscription = await paymish.subscription.getSubscriptionById(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateSubscription(identifier, payload, [options])`

Updates an existing subscription by ID.

- `identifier (number | string | Object, Required)` — Subscription ID or an options object containing id.
- `payload (Object, Required)` — Update payload containing fields to update (e.g., { status: "canceled" }).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const updated = await paymish.subscription.updateSubscription(
  1,
  { status: "canceled" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `deleteSubscription(identifier, [options])`

Deletes a subscription by its unique ID.

- `identifier (number | string | Object, Required)` — Subscription ID or an options object containing `id`.
- `options (Object, Optional)` — Custom per-request options.

```javascript
await paymish.subscription.deleteSubscription(1, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Transaction Resource (`paymish.transaction`)

#### `getAllTransactions(params, [options])`

Retrieves a paginated list of all transactions with optional query filters.

- `params (Object, Optional)`
  - `page (integer, Optional)` — Page number for pagination.
  - `limit (integer, Optional)` — Number of records per page.
  - `status (string, Optional)` — Filter transactions by status.
  - `reference (string, Optional)` — Filter by transaction reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transactions = await paymish.transaction.getAllTransactions(
  {
    page: 1,
    limit: 10,
    status: "success",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getTransactionByReference(params, [options])`

Retrieves details of a specific transaction by its reference.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Required)` — Transaction reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.getTransactionByReference(
  {
    businessId: 8,
    reference: "TXN_12345",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getTransactionDetails(params, [options])`

Retrieves transaction details using a business ID and reference or ID.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Optional)` — Transaction reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.transaction.getTransactionDetails(
  {
    businessId: 8,
    reference: "TXN_12345",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `transactionWithCard(payload, [options])`

Creates a transaction using a card payment channel.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `amount (number, Required)` — Amount of the transaction.
  - `cardNumber (string, Required)` — Card number.
  - `expiryMonth (string, Required)` — Card expiry month.
  - `expiryYear (string, Required)` — Card expiry year.
  - `cvv (string, Required)` — Card CVV.
  - `channel (string, Optional)` — Channel of the transaction (e.g., `card`).
  - `ipAddress (string, Optional)` — IP address of the transaction.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithCard(
  {
    businessId: 8,
    customerId: 165,
    amount: 152,
    cardNumber: "4111111111111111",
    expiryMonth: "12",
    expiryYear: "28",
    cvv: "123",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `transactionWithNdd(payload, [options])`

Creates a transaction with NDD (Direct Debit).

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `planId (integer, Required)` — ID of the plan.
  - `channel (string, Required)` — Channel of the transaction.
  - `amount (number, Required)` — Amount of the transaction.
  - `ndd (Object, Required)` — NDD details object.
  - `ipAddress (string, Optional)` — IP address of the transaction.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Message associated with the transaction.
  - `isLive (boolean, Optional)` — Flag indicating if the transaction is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithNdd(
  {
    businessId: 8,
    customerId: 165,
    planId: 10,
    channel: "NDD",
    amount: 152,
    ndd: { mandateId: "MND_123" },
    message: "Test message",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `transactionWithQr(payload, [options])`

Initiates a transaction with a QR code.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — Unique identifier for the business.
  - `customerId (integer, Required)` — Unique identifier for the customer.
  - `planId (integer, Required)` — Unique identifier for the plan.
  - `channel (string, Required)` — The channel through which the transaction is made.
  - `amount (number, Required)` — Amount of the transaction.
  - `mch_no (string, Required)` — Merchant number.
  - `sub_mch_no (string, Required)` — Sub-merchant number.
  - `ipAddress (string, Optional)` — IP address of the customer.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Additional message or information.
  - `isLive (boolean, Optional)` — Indicates if the transaction is in a live environment.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithQr(
  {
    businessId: 8,
    customerId: 165,
    planId: 10,
    channel: "NQR",
    amount: 152,
    mch_no: "M0000005463",
    sub_mch_no: "S0000007263",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getBankList(params, [options])`

Retrieves the list of banks.

- `params (Object, Optional)`
  - `isLive (boolean, Optional)` — Flag to indicate if the environment is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const banks = await paymish.transaction.getBankList(
  { isLive: true },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `transactionWithBank(payload, [options])`

Creates a transaction with a bank.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `channel (string, Required)` — Channel of the transaction.
  - `amount (number, Required)` — Amount of the transaction.
  - `AccountNumber (string, Required)` — Account number for the transaction.
  - `DestinationInstitutionCode (string, Required)` — Institution code of the destination bank.
  - `pageId (integer, Optional)` — ID of the page.
  - `orderId (integer, Optional)` — ID of the order.
  - `ipAddress (string, Optional)` — IP address associated with the transaction.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Message associated with the transaction.
  - `location (string, Optional)` — Location coordinates.
  - `isLive (boolean, Optional)` — Flag indicating if the transaction is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithBank(
  {
    businessId: 18,
    customerId: 8,
    channel: "NIBSS",
    amount: 100,
    AccountNumber: "1780004070",
    DestinationInstitutionCode: "999998",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `verifyBankDetails(payload, [options])`

Verifies bank details (account number and destination institution code).

- `payload (Object, Required)`
  - `DestinationInstitutionCode (string, Required)` — Institution code of the destination bank.
  - `AccountNumber (string, Required)` — Account number to verify.
  - `isLive (boolean, Optional)` — Flag indicating if the verification is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transaction.verifyBankDetails(
  {
    DestinationInstitutionCode: "999998",
    AccountNumber: "0051762787",
    isLive: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `transactionWithUssd(payload, [options])`

Creates a transaction with USSD.

- `payload (Object, Required)`
  - `businessId (integer, Required)` — ID of the business.
  - `customerId (integer, Required)` — ID of the customer.
  - `channel (string, Required)` — Channel of the transaction.
  - `amount (number, Required)` — Amount of the transaction.
  - `pageId (integer, Optional)` — ID of the page.
  - `orderId (integer, Optional)` — ID of the order.
  - `ipAddress (string, Optional)` — IP address associated with the transaction.
  - `fees (number, Optional)` — Fees associated with the transaction.
  - `message (string, Optional)` — Message associated with the transaction.
  - `location (string, Optional)` — Location coordinates.
  - `isLive (boolean, Optional)` — Flag indicating if the transaction is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transaction.transactionWithUssd(
  {
    businessId: 18,
    customerId: 8,
    channel: "USSD",
    amount: 100,
    message: "message",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `verifyUssdTransaction(payload, [options])`

Verifies a transaction initiated with USSD.

- `payload (Object, Required)`
  - `ussdTransactionId (string, Required)` — The USSD transaction ID to verify.
  - `isLive (boolean, Optional)` — Flag indicating if the verification is live.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transaction.verifyUssdTransaction(
  {
    ussdTransactionId: "24091010410290301050",
    isLive: false,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `refundTransaction(payload, [options])`

Refunds a transaction by transaction reference.

- `payload (Object, Required)`
  - `transactionRef (string, Required)` — The reference ID of the transaction to be refunded.
  - `amount (number, Required)` — Amount to refund.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const refund = await paymish.transaction.refundTransaction(
  {
    transactionRef: "TXN_waTjNBitbamwNnLuavU1xd",
    amount: 100,
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getRefundList(params, [options])`

Retrieves a paginated list of refunds with query filters.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `limit (integer, Required)` — Limit of records per page.
  - `page (integer, Required)` — Current page number.
  - `status (string, Optional)` — Refund status.
  - `amount (number, Optional)` — Amount.
  - `filterAmount (string, Optional)` — Filter amount modifier (`gt`, `lt`, `eq`).
  - `from (string, Optional)` — From date (ISO 8601).
  - `refundRefId (string, Optional)` — Refund ID or reference.
  - `to (string, Optional)` — To date (ISO 8601).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const refunds = await paymish.transaction.getRefundList(
  {
    businessId: 100,
    limit: 10,
    page: 1,
    status: "completed",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getRefundDetails(params, [options])`

Retrieves refund details using a business ID and either a transaction reference or a refund ID.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Optional)` — Transaction reference.
  - `refundId (string, Optional)` — Refund ID.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.transaction.getRefundDetails(
  {
    businessId: 100,
    reference: "TXN_waTjNBitbamwNnLuavU1xd",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getRefundByReference(params, [options])`

Retrieves refund details by business ID and refund reference.

- `params (Object, Required)`
  - `businessId (integer, Required)` — Business ID.
  - `reference (string, Required)` — Refund reference.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const refund = await paymish.transaction.getRefundByReference(
  {
    businessId: 100,
    reference: "REF_98765",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `verifyAccount(payload, [options])`

Verifies an account (e.g. for card refunds or account resolution).

- `payload (Object, Required)`
  - `bankCode (string, Required)` — Bank code.
  - `accountNumber (string, Required)` — Account number.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transaction.verifyAccount(
  {
    bankCode: "058",
    accountNumber: "1234567890",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDebitAccounts(params, [options])`

Retrieves debit accounts with balances.

- `params (Object, Optional)`
  - `isLive (string|boolean, Optional)` — Live mode flag (true/false).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const accounts = await paymish.transaction.getDebitAccounts(
  { isLive: "true" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getScheduledTransactions(params, [options])`

Retrieves scheduled transactions.

- `params (Object, Required)`
  - `scheduleId (string, Required)` — Schedule ID.
  - `isLive (string|boolean, Optional)` — Live mode flag (true/false).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const scheduled = await paymish.transaction.getScheduledTransactions(
  {
    scheduleId: "sch_123",
    isLive: "true",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Transactions Resource (`paymish.transactions`)

#### `verifyTransaction(reference, [options])`

Verifies a transaction by its reference.

- `reference (string, Required)` — The transaction reference used to initiate the transaction.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const verification = await paymish.transactions.verifyTransaction("TXN_waTjNBitbamwNnLuavU1xd", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `getTransactionStatistics([params], [options])`

Retrieves transaction statistics.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const statistics = await paymish.transactions.getTransactionStatistics(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `exportTransactionsCsv([params], [options])`

Exports transactions as a CSV list.

- `params (Object, Optional)`
  - `businessId (integer, Optional)` — Business ID.
  - `status (string, Optional)` — Filter transactions by status.
  - `from (string, Optional)` — From date.
  - `to (string, Optional)` — To date.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const exportResult = await paymish.transactions.exportTransactionsCsv(
  { businessId: 18, status: "success" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listPayPlusBanks([params], [options])`

Lists PayPlus banks.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const banks = await paymish.transactions.listPayPlusBanks(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `fetchTransaction(id, [options])`

Fetches a transaction by its ID.

- `id (integer|string, Required)` — An ID for the transaction to fetch.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transaction = await paymish.transactions.fetchTransaction(42, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### Transfer Resource (`paymish.transfer`)

#### `getAllBanks(params, [options])`

Retrieves the list of banks for transfers.

- `params (Object, Optional)` — Optional query parameters.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const banks = await paymish.transfer.getAllBanks(
  {},
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `createSingleTransfer(payload, [options])`

Initiates a single transfer to a user.

- `payload (Object, Required)`
  - `amount (number, Required)` — Amount to be transferred, in the smallest currency unit (e.g., cents).
  - `bankCode (string, Required)` — Code of the bank where the recipient's account is held.
  - `bankName (string, Optional)` — Name of the bank where the recipient's account is held.
  - `accountNumber (string, Required)` — Recipient's bank account number.
  - `accountName (string, Required)` — Name associated with the recipient's bank account.
  - `emailAddress (string, Required)` — Email address for sending transfer notifications.
  - `transferNote (string, Optional)` — Optional note or memo for the transfer.
  - `transferReference (string, Required)` — Unique reference for the transfer transaction.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transfer = await paymish.transfer.createSingleTransfer(
  {
    amount: 1000,
    bankCode: "999998",
    bankName: "Zenith Bank",
    accountNumber: "0051762787",
    accountName: "Test Account",
    emailAddress: "email@example.com",
    transferNote: "Payment for invoice #1234",
    transferReference: "INV1234TRANS5678",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getTransferList(params, [options])`

Retrieves a paginated list of transfers with required and optional query filters.

- `params (Object, Required)`
  - `businessId (integer, Required)` — The unique identifier of the business.
  - `limit (integer, Required)` — The maximum number of records to return.
  - `page (integer, Required)` — The current page number for pagination.
  - `transferReference (string, Optional)` — The reference number of the transfer.
  - `status (string, Optional)` — The status of the transfer (e.g., `Successful`, `Failed`, `Pending`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transfers = await paymish.transfer.getTransferList(
  {
    businessId: 18,
    limit: 10,
    page: 1,
    status: "Successful",
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getBalance(params, [options])`

Retrieves the transfer balance for a business.

- `params (Object, Required)`
  - `businessId (integer, Required)` — The unique identifier of the business.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const balance = await paymish.transfer.getBalance(
  { businessId: 18 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getTransferDetails(params, [options])`

Retrieves transfer details.

- `params (Object, Required)`
  - `transferCode (string, Required)` — The unique code of the transfer.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const details = await paymish.transfer.getTransferDetails(
  { transferCode: "TRF_12345" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `submitBulkTransfer(payload, [options])`

Submits a bulk transfer.

- `payload (Object, Required)`
  - `debitBankCode (string, Required)` — The bank code from which funds are debited.
  - `debitAccountNumber (string, Required)` — The account number from which funds are debited.
  - `data (Array[Object], Required)` — Array of transfer items.
- `options (Object, Optional)` — Custom per-request options.

```javascript
const bulkTransfer = await paymish.transfer.submitBulkTransfer(
  {
    debitBankCode: "998",
    debitAccountNumber: "0112345678",
    data: [
      {
        accountNumber: "0051762787",
        bankCode: "999998",
        amount: 1000,
        accountName: "User One",
        emailAddress: "one@example.com",
        transferReference: "TRF_01",
      },
    ],
  },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

### Transfers Resource (`paymish.transfers`)

#### `listTransfers([params], [options])`

Retrieves a list of transfers.

- `params (Object, Optional)` — Optional query parameters (e.g., `page`, `limit`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const transfers = await paymish.transfers.listTransfers(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `listRecipients([params], [options])`

Retrieves a list of recipients.

- `params (Object, Optional)` — Optional query parameters (e.g., `page`, `limit`).
- `options (Object, Optional)` — Custom per-request options.

```javascript
const recipients = await paymish.transfers.listRecipients(
  { page: 1, limit: 10 },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

---

## Error Handling

All API-level failures, non-JSON response errors, and request timeouts throw a `PaymishError`.

```javascript
const Paymish = require("paymish-node.js-sdk");
const { PaymishError } = Paymish;

try {
  await paymish.business.getDetails();
} catch (error) {
  if (error instanceof PaymishError) {
    console.log(error.name); // "PaymishError"
    console.log(error.statusCode); // e.g., 400, 401, 408, 500
    console.log(error.message); // Human-readable error message
    console.log(error.errors); // Additional error details or server validation payload
    console.log(error.requestData); // Sanitized request payload (sensitive keys automatically redacted)
  }
}
```

---

## Advanced Per-Request Configuration

SDK resource methods accept an optional `options` argument that allows overriding headers or request timeout settings for single calls:

```javascript
await paymish.business.getDetails({
  headers: {
    Authorization: "Bearer YOUR_SECRET_KEY",
    "X-Custom-Header": "CustomValue",
  },
  customTimeout: 3000, // Enforce a 3-second timeout for this request only
});
```

---

## License

This project is licensed under the [ISC](https://www.isc.org/) License.
