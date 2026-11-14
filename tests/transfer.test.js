const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Transfer Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getAllBanks()", () => {
    test("should successfully retrieve the list of banks (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Banks retrieved successfully",
        data: [{ bankCode: "058", bankName: "Guaranty Trust Bank" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transfer.getAllBanks();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transfer/all-banks",
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
        message: "Failed to retrieve banks.",
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
        await paymish.transfer.getAllBanks();
        throw new Error("Expected getAllBanks to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Failed to retrieve banks.");
      }
    });
  });

  describe("createSingleTransfer()", () => {
    test("should successfully initiate a single transfer (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transfer initiated successfully",
        data: { transferReference: "INV1234TRANS5678", status: "pending" },
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
        amount: 1000,
        bankCode: "999998",
        bankName: "Zenith Bank",
        accountNumber: "0051762787",
        accountName: "Test Account",
        emailAddress: "email@example.com",
        transferNote: "Payment for invoice #1234",
        transferReference: "INV1234TRANS5678",
      };

      const result = await paymish.transfer.createSingleTransfer(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transfer/create-single-transfer",
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

    test("should throw early validation error if required transfer fields are missing", async () => {
      await expect(
        paymish.transfer.createSingleTransfer({
          amount: 1000,
          bankCode: "999998",
        })
      ).rejects.toThrow(
        "Invalid payload: 'amount', 'bankCode', 'accountNumber', 'accountName', 'emailAddress', and 'transferReference' are required to create a single transfer."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Insufficient funds for transfer.",
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
        await paymish.transfer.createSingleTransfer({
          amount: 1000,
          bankCode: "999998",
          accountNumber: "0051762787",
          accountName: "Test Account",
          emailAddress: "email@example.com",
          transferReference: "INV1234TRANS5678",
        });
        throw new Error("Expected createSingleTransfer to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Insufficient funds for transfer.");
      }
    });
  });

  describe("getTransferList()", () => {
    test("should successfully retrieve transfer list with required and optional query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transfer list retrieved successfully",
        data: [{ transferReference: "INV1234TRANS5678", amount: 1000, status: "Successful" }],
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
        businessId: 18,
        limit: 10,
        page: 1,
        status: "Successful",
      };

      const result = await paymish.transfer.getTransferList(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transfer/get-transfer-list?businessId=18&limit=10&page=1&status=Successful",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required query params are missing", async () => {
      await expect(
        paymish.transfer.getTransferList({
          businessId: 18,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve the transfer list."
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
        await paymish.transfer.getTransferList({
          businessId: 18,
          limit: 10,
          page: 1,
        });
        throw new Error("Expected getTransferList to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid query parameters.");
      }
    });
  });
});
