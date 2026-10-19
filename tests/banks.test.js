const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Banks Module - list()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve list of supported banks (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Record retrieved successfully",
      data: {
        reference: "PM-REF-12345",
        status: "success",
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.banks.list({ headers: authHeaders });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/bank",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_secret_key",
        }),
        signal: expect.any(AbortSignal),
      })
    );

    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toBeUndefined();

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw PaymishError when unauthorized or record not found (401 Unauthorized)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Requested record was not found.",
      errors: {
        reference: ["Check the identifier and merchant context before retrying."],
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.banks.list();
      throw new Error("Expected list to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Requested record was not found.");
      expect(error.statusCode).toBe(401);
      expect(error.errors).toHaveProperty("reference");
    }
  });
});

describe("Banks Module - resolveAccount()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully resolve an account number with query params (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Record retrieved successfully",
      data: {
        reference: "PM-REF-12345",
        status: "success",
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.banks.resolveAccount(
      { account_number: "0123456789", bank_code: "058" },
      { headers: authHeaders }
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/bank/resolve?account_number=0123456789&bank_code=058",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_secret_key",
        }),
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if required query parameters are missing", async () => {
    await expect(paymish.banks.resolveAccount({ account_number: "0123456789" })).rejects.toThrow(
      "Invalid parameters: Both 'account_number' and 'bank_code' are required to resolve an account."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when rate limit is reached (429 Too Many Requests)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Test-mode daily lookup limit reached.",
      errors: null,
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.banks.resolveAccount({
        account_number: "0123456789",
        bank_code: "058",
      });
      throw new Error("Expected resolveAccount to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe("Test-mode daily lookup limit reached.");
    }
  });
});
