const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Transaction Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getDocuments()", () => {
    test("should successfully retrieve transaction documents with required and optional query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Documents retrieved successfully",
        data: [{ id: 1, reference: "REF_123" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const params = {
        businessId: 100,
        limit: 10,
        page: 1,
        status: "completed",
        channel: "CARD",
      };

      const result = await paymish.transaction.getDocuments(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/list?businessId=100&limit=10&page=1&status=completed&channel=CARD",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required parameters (businessId, limit, page) are missing", async () => {
      await expect(
        paymish.transaction.getDocuments({
          businessId: 100,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve transaction documents."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid query parameters.",
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
        await paymish.transaction.getDocuments({
          businessId: 100,
          limit: 10,
          page: 1,
        });
        throw new Error("Expected getDocuments to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid query parameters.");
      }
    });
  });

  describe("transactionWithCard()", () => {
    test("should successfully execute a transaction with card (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transaction successful",
        data: { reference: "TRX_CARD_123" },
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
        businessId: 24,
        customerId: 5,
        planId: 5,
        channel: "card",
        amount: 100,
        cardNumber: 5123450161003312,
        expiryYear: 2024,
        expiryMonth: 12,
        cvv: 123,
      };

      const result = await paymish.transaction.transactionWithCard(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-card",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required card transaction fields are missing", async () => {
      await expect(
        paymish.transaction.transactionWithCard({
          businessId: 24,
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', 'cardNumber', 'expiryYear', 'expiryMonth', and 'cvv' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Card charge failed.",
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
        await paymish.transaction.transactionWithCard({
          businessId: 24,
          customerId: 5,
          planId: 5,
          channel: "card",
          amount: 100,
          cardNumber: 5123450161003312,
          expiryYear: 2024,
          expiryMonth: 12,
          cvv: 123,
        });
        throw new Error("Expected transactionWithCard to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Card charge failed.");
      }
    });
  });
});
