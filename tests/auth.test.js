const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Auth Module - generateToken()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish(); // Instantiate SDK before each test
    global.fetch = jest.fn(); // Reset global fetch mock state
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully generate a token on valid credentials (200 OK)", async () => {
    // Mock API success response payload
    const mockResponseBody = {
      status: "success",
      message: "Authentication successful",
      data: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_jwt_token",
        expires_in: 3600,
      },
    };

    // Mock global.fetch implementation
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) =>
          header === "content-type" ? "application/json" : null,
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    // Call the SDK method
    const credentials = {
      public_key: "pk_test_12345",
      secret_key: "sk_test_67890",
    };

    const result = await paymish.auth.generateToken(credentials);

    // Assertions
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/user-service/external/v1/generate-token",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        signal: expect.any(AbortSignal),
      }),
    );

    expect(result).toEqual(mockResponseBody);
    expect(result.data.token).toBe(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_jwt_token",
    );
  });

  test("should throw PaymishError when API returns invalid credentials (400 Bad Request)", async () => {
    // Mock the API error response payload
    const mockErrorBody = {
      status: "error",
      message: "Invalid credentials.",
      errors: {
        credentials: [
          "Check the secret key, partner code, and target environment.",
        ],
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: {
        get: (header) =>
          header === "content-type" ? "application/json" : null,
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    // Call SDK method and expect a PaymishError rejection
    try {
      await paymish.auth.generateToken({
        public_key: "invalid_key",
        secret_key: "invalid_key",
      });

      // Force test failure if no error was thrown
      throw new Error(
        "Expected generateToken to throw PaymishError, but it succeeded.",
      );
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Invalid credentials.");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toHaveProperty("credentials");
    }
  });

  test("should throw a validation error if required keys are missing before making network request", async () => {
    // Testing client-side parameter validation
    await expect(
      paymish.auth.generateToken({ public_key: "pk_test_12345" }),
    ).rejects.toThrow(
      "Both public_key and secret_key are required to generate a token.",
    );

    // Ensure fetch was never called since client validation failed early
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError with status 408 on request timeout", async () => {
    // Simulate fetch throwing a TimeoutError
    const timeoutError = new Error("Operation aborted due to timeout");
    timeoutError.name = "TimeoutError";

    global.fetch.mockRejectedValueOnce(timeoutError);

    try {
      await paymish.auth.generateToken({
        public_key: "pk_test_12345",
        secret_key: "sk_test_67890",
      });

      throw new Error("Expected request to timeout");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(408);
      expect(error.message).toContain("timed out");
    }
  });

  test("should handle non-JSON HTML error pages from proxies gracefully", async () => {
    const htmlErrorPage = "<html><body>502 Bad Gateway</body></html>";

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      headers: new Map([["content-type", "text/html"]]),
      text: jest.fn().mockResolvedValueOnce(htmlErrorPage),
    });

    try {
      await paymish.auth.generateToken({
        public_key: "pk_test_12345",
        secret_key: "sk_test_67890",
      });

      throw new Error("Expected non-JSON request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(502);
      expect(error.message).toContain("HTML or Non-JSON response");
    }
  });
});
