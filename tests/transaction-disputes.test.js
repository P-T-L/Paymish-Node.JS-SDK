const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("TransactionDisputes Module", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("listDisputes()", () => {
    test("should successfully retrieve transaction disputes list (200 OK)", async () => {
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
      const result = await paymish.transactionDisputes.listDisputes({
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/disputes",
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

    test("should throw PaymishError when record not found or unauthorized (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Requested record was not found.",
        errors: {
          reference: ["Check the identifier and merchant context before retrying."],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transactionDisputes.listDisputes();
        throw new Error("Expected listDisputes to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Requested record was not found.");
      }
    });
  });

  describe("createDispute()", () => {
    test("should successfully create a transaction dispute (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Request processed successfully",
        data: {
          reference: "PM-REF-12345",
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

      const payload = { transactionId: "tx_123", reason: "fraud" };
      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.transactionDisputes.createDispute(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/disputes",
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
  });

  describe("getDisputeById()", () => {
    test("should successfully retrieve a transaction dispute by ID (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Record retrieved successfully",
        data: {
          id: "disp_123",
          status: "pending",
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
      const result = await paymish.transactionDisputes.getDisputeById("disp_123", {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/disputes/disp_123",
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

    test("should throw early validation error if disputeId is missing", async () => {
      await expect(paymish.transactionDisputes.getDisputeById()).rejects.toThrow(
        "Invalid parameter: 'disputeId' is required to retrieve dispute details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
