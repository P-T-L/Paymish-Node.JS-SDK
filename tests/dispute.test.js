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

describe("Dispute Module - getDisputeDetails()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve dispute details by transaction reference (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Record retrieved successfully",
      data: {
        transactionRef: "PM-TX-123",
        status: "under_review",
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
    const result = await paymish.dispute.getDisputeDetails("PM-TX-123", {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/dispute-service/external/v1/dispute-details?transactionRef=PM-TX-123",
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

  test("should throw early validation error if transactionRef is missing", async () => {
    await expect(paymish.dispute.getDisputeDetails()).rejects.toThrow(
      "Invalid parameter: 'transactionRef' is required to retrieve dispute details."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("Dispute Module - updateDispute()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully update a dispute with required fields (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Dispute updated successfully",
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
      tnxRef: "PM-TX-12345",
      reason: "Merchant accepted liability",
      status: "resolved",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.dispute.updateDispute(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/dispute-service/external/v1/update-dispute",
      expect.objectContaining({
        method: "PUT",
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

  test("should throw PaymishError when payload fails API validation (400 Bad Request)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Invalid status value provided.",
      errors: {
        status: ["'status' must be one of: pending, resolved, rejected."],
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
      await paymish.dispute.updateDispute({
        tnxRef: "PM-TX-12345",
        reason: "Merchant refund",
        status: "invalid_status",
      });
      throw new Error("Expected updateDispute to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Invalid status value provided.");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toHaveProperty("status");
    }
  });

  test("should throw early validation error if any required field (tnxRef, reason, status) is missing", async () => {
    // Missing status
    await expect(
      paymish.dispute.updateDispute({
        tnxRef: "PM-TX-12345",
        reason: "Merchant accepted liability",
      })
    ).rejects.toThrow(
      "Invalid payload: 'tnxRef', 'reason', and 'status' are required to update a dispute."
    );

    // Missing reason
    await expect(
      paymish.dispute.updateDispute({
        tnxRef: "PM-TX-12345",
        status: "resolved",
      })
    ).rejects.toThrow(
      "Invalid payload: 'tnxRef', 'reason', and 'status' are required to update a dispute."
    );

    // Missing tnxRef
    await expect(
      paymish.dispute.updateDispute({
        reason: "Merchant accepted liability",
        status: "resolved",
      })
    ).rejects.toThrow(
      "Invalid payload: 'tnxRef', 'reason', and 'status' are required to update a dispute."
    );

    // Null or empty payload
    await expect(paymish.dispute.updateDispute(null)).rejects.toThrow(
      "Invalid payload: 'tnxRef', 'reason', and 'status' are required to update a dispute."
    );

    // Ensure client validation prevented network calls
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
