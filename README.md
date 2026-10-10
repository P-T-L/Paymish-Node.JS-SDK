# Paymish Node.js SDK

The official Node.js SDK for integrating with the **Paymish API**. Built with **zero runtime dependencies** using native `fetch` and modern asynchronous JavaScript standards.

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

`generateToken(credentials, [options])`

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

### Business Resource (`paymish.business`)

`changeMode(payload, [options])`

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

`getDetails([options])`

Retrieves full details for the authenticated business profile.

- `options (Object, Optional)` — Custom per-request configuration options (e.g., headers containing `Authorization`).

```javascript
const businessProfile = await paymish.business.getDetails({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
```

`createBusiness(payload, [options])`

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

`listBusinesses([options])`

Retrieves the list of businesses associated with the account.

- `options (Object, Optional)` — Custom per-request configuration options.

```javaScript
const businesses = await paymish.business.listBusinesses({
  headers: { Authorization: "Bearer YOUR_SECRET_KEY" },
});
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
