const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Dispute Module - createDispute()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a dispute with payload object (200 OK)", async () => {
    const mockResponseBody = {
      message: "Create dispute successfully",
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = {
      transactionRef: "PM-TXN-123",
      disputeReason: "Unauthorized charge",
      disputeDescription: "Customer did not recognize this transaction.",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.dispute.createDispute(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/dispute-service/external/v1/create-dispute",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_secret_key",
          "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
        }),
        body: expect.any(FormData),
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if required dispute fields are missing", async () => {
    await expect(
      paymish.dispute.createDispute({
        transactionRef: "PM-TXN-123",
      })
    ).rejects.toThrow(
      "Invalid payload: 'transactionRef', 'disputeReason', and 'disputeDescription' are required."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("Dispute Module - listDisputes()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve a list of disputes with query params (200 OK)", async () => {
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
    const result = await paymish.dispute.listDisputes(
      { limit: 10, page: 1, search: "PM-TX-123" },
      { headers: authHeaders }
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/dispute-service/external/v1/list?limit=10&page=1&search=PM-TX-123",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_secret_key",
        }),
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw PaymishError when parameters are invalid (400 Bad Request)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Requested record was not found.",
      errors: {
        reference: ["Check the identifier and merchant context before retrying."],
      },
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
      await paymish.dispute.listDisputes({ limit: -1, page: 0 });
      throw new Error("Expected listDisputes to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Requested record was not found.");
    }
  });
});
