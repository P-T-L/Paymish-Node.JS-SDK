const Paymish = require("..");
const { PaymishError } = require("../src/errors");

describe("DedicatedVirtualAccount Module - createAccount()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a dedicated virtual account (200 OK / 201 Created)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Dedicated virtual account created successfully",
      data: {
        accountNumber: "1234567890",
        accountName: "John Doe - Paymish",
        bankName: "Test Bank",
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = {
      customerId: "tx_cust_123",
      preferredBank: "test-bank",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.dedicatedVirtualAccount.createAccount(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_secret_key",
          "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
        }),
        body: JSON.stringify(payload),
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if payload is missing or not an object", async () => {
    await expect(paymish.dedicatedVirtualAccount.createAccount(null)).rejects.toThrow(
      "Invalid payload: A valid payload object is required to create a dedicated virtual account."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when server responds with 400 Bad Request", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Validation failed for account creation.",
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.dedicatedVirtualAccount.createAccount({ customerId: "" });
      throw new Error("Expected createAccount to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed for account creation.");
    }
  });
});
