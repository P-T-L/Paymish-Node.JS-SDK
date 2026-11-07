const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Products Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("listSettlements()", () => {
    test("should successfully list settlements with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Settlements retrieved successfully",
        data: [{ id: 1, status: "Paid", amount: 5000 }],
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
        page: 1,
        limit: 10,
        status: "Paid",
        from: "2026-01-01",
        to: "2026-10-31",
      };

      const result = await paymish.settlements.listSettlements(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/settlements?page=1&limit=10&status=Paid&from=2026-01-01&to=2026-10-31",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully list settlements without parameters", async () => {
      const mockResponseBody = { status: "success", data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.settlements.listSettlements();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/settlements",
        expect.any(Object)
      );
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid date format.",
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
        await paymish.settlements.listSettlements({ from: "invalid-date" });
        throw new Error("Expected listSettlements to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid date format.");
      }
    });
  });

  describe("listSettlementTransactions()", () => {
    test("should successfully list transactions for a settlement with pagination params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Settlement transactions retrieved successfully",
        data: [{ id: 1, reference: "txn_123", amount: 1000 }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.settlements.listSettlementTransactions("PAY_12345", {
        page: 1,
        limit: 10,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/settlements/PAY_12345/transactions?page=1&limit=10",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should support passing reference inside an options object", async () => {
      const mockResponseBody = { status: "success", data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.settlements.listSettlementTransactions({ reference: "PAY_12345" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/settlements/PAY_12345/transactions",
        expect.any(Object)
      );
    });

    test("should throw early validation error if settlement reference is missing", async () => {
      await expect(paymish.settlements.listSettlementTransactions()).rejects.toThrow(
        "Invalid parameter: 'reference' is required to list settlement transactions."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Settlement not found.",
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
        await paymish.settlements.listSettlementTransactions("PAY_99999");
        throw new Error(
          "Expected listSettlementTransactions to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Settlement not found.");
      }
    });
  });
});
