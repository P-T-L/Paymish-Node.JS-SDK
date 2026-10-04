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
    const response = await paymish.auth.generateToken({
      public_key: "pk_test_123456789",
      secret_key: "sk_test_987654321",
    });

    console.log("Token Generated:", response);
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

```javaScript
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

```javaScript
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

---

## Error Handling

All API-level failures, non-JSON response errors, and request timeouts throw a `PaymishError`.

```javaScript
const Paymish = require("paymish-node.js-sdk");
const { PaymishError } = Paymish;

try {
await paymish.auth.generateToken({
public_key: "invalid_key",
secret_key: "invalid_key",
});
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

```javaScript
await paymish.auth.generateToken(
{ public_key: "pk_...", secret_key: "sk_..." },
{
headers: {
"X-Custom-Header": "CustomValue",
},
customTimeout: 3000, // Enforce a 3-second timeout for this request only
}
);
```

---

## License

This project is licensed under the ISC License.
