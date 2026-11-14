const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Transfers Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("listTransfers()", () => {
    test("should successfully list transfers without query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transfers retrieved successfully",
        data: [{ reference: "TRF_123", amount: 5000 }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transfers.listTransfers();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/get-transfer-list",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully list transfers with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transfers retrieved successfully",
        data: [],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transfers.listTransfers({ page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/get-transfer-list?page=1&limit=10",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Failed to retrieve transfers.",
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
        await paymish.transfers.listTransfers();
        throw new Error("Expected listTransfers to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Failed to retrieve transfers.");
      }
    });
  });

  describe("listRecipients()", () => {
    test("should successfully list recipients without query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Recipients retrieved successfully",
        data: [{ recipientCode: "RCP_123", name: "John Doe" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transfers.listRecipients();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/get-recipient-list",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully list recipients with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Recipients retrieved successfully",
        data: [],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transfers.listRecipients({ page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/get-recipient-list?page=1&limit=10",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Failed to retrieve recipients.",
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
        await paymish.transfers.listRecipients();
        throw new Error("Expected listRecipients to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Failed to retrieve recipients.");
      }
    });
  });
});
