const { sanitize } = require("../src/utils/sanitize");

describe("Sanitizer Utility", () => {
  test("should redact secret keys and tokens from request bodies", () => {
    const payload = {
      public_key: "pk_test_1234567890",
      secret_key: "sk_test_9876543210",
      action: "generate-token",
    };

    const sanitized = sanitize(payload);

    expect(sanitized.secret_key).toBe("sk_t***[REDACTED]");
    expect(sanitized.public_key).toBe("pk_t***[REDACTED]");
    expect(sanitized.action).toBe("generate-token");
  });
});
