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

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
const customerDetails = await paymish.customer.getCustomerById(101, {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

### TransactionCustomer Resource (paymish.transactionCustomer)

#### `listCustomers([params], [options])`

Retrieves a paginated list of transaction-service customers.

- `params (Object, Optional)` — Query parameters for filtering and pagination.
- `options (Object, Optional)` — Custom per-request options.

```javaScript
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

```javaScript
const txCustomer = await paymish.transactionCustomer.getCustomerById("tx_cust_123", {
`headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateCustomer(identifier, payload, [options])`

Updates an existing transaction customer by ID.

- `identifier (string | number | Object, Required)` — Customer ID or options object.
- `payload (Object, Required)` — Updated customer properties.
- `options (Object, Optional)` — Custom per-request options.

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
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

```javaScript
const disputes = await paymish.dispute.listDisputes(
  { limit: 10, page: 1, search: "PM-TX-12345" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDisputeDetails(transactionRef, [options])`

Retrieves dispute details by transaction reference.

- `transactionRef (string \| Object, Required)` — The transaction reference string or an object containing `{ transactionRef }`.
- `options (Object, Optional)` — Custom per-request options.

```javaScript
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

```javaScript
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

```javaScript
const disputes = await paymish.transactionDisputes.listDisputes({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `createDispute([payload], [options])`

Creates a new transaction-level dispute.

- `payload (Object, Optional)` — Dispute creation details payload.
- `options (Object, Optional)` — Custom per-request options.

```javaScript
const newDispute = await paymish.transactionDisputes.createDispute(
  { transactionId: "tx_123", reason: "fraud" },
  { headers: { Authorization: "Bearer YOUR_SECRET_KEY" } }
);
```

#### `getDisputeById(disputeId, [options])`

Retrieves a transaction-level dispute by its ID.

- `disputeId (string \| number \| Object, Required)` — The dispute ID string/number or options object.
- `options (Object, Optional)` — Custom per-request options.

```javaScript
const dispute = await paymish.transactionDisputes.getDisputeById("disp_123", {
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

#### `updateDispute(disputeId, payload, [options])`

Updates an existing transaction-level dispute by its ID.

- `disputeId (string \| number \| Object, Required)` — The dispute ID string/number or options object.
- `payload (Object, Required)` — Update payload containing updated dispute details.
- `options (Object, Optional)` — Custom per-request options.

```javaScript
const updatedDispute = await paymish.transactionDisputes.updateDispute(
  "disp_123",
  { status: "resolved", resolutionNote: "Refund issued" },
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
