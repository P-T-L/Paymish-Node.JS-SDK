const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Virtual Accounts Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("listVirtualAccounts()", () => {
    test("should successfully list virtual accounts without query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Virtual accounts retrieved successfully",
        data: [{ accountNumber: "0123456789", accountName: "John Doe" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.virtualAccounts.listVirtualAccounts();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/virtual-accounts",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully list virtual accounts with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Virtual accounts retrieved successfully",
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

      const result = await paymish.virtualAccounts.listVirtualAccounts({ page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/virtual-accounts?page=1&limit=10",
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
        message: "Failed to retrieve virtual accounts.",
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
        await paymish.virtualAccounts.listVirtualAccounts();
        throw new Error("Expected listVirtualAccounts to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Failed to retrieve virtual accounts.");
      }
    });
  });

  describe("createVirtualAccount()", () => {
    test("should successfully create a virtual account (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Virtual account created successfully",
        data: { accountNumber: "0123456789", accountName: "John Doe", bankName: "Test Bank" },
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
        accountName: "John Doe",
        bvn: "22222222222",
        email: "john@example.com",
      };

      const result = await paymish.virtualAccounts.createVirtualAccount(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/virtual-accounts",
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

    test("should throw early validation error if payload is missing or invalid", async () => {
      await expect(paymish.virtualAccounts.createVirtualAccount(null)).rejects.toThrow(
        "Invalid payload: payload object is required to create a virtual account."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid BVN or account details.",
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
        await paymish.virtualAccounts.createVirtualAccount({ accountName: "" });
        throw new Error("Expected createVirtualAccount to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid BVN or account details.");
      }
    });
  });

  describe("getVirtualAccount()", () => {
    test("should successfully retrieve a virtual account by ID (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Virtual account retrieved successfully",
        data: { id: "va_123", accountNumber: "0123456789", accountName: "John Doe" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const accountId = "va_123";
      const result = await paymish.virtualAccounts.getVirtualAccount(accountId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/virtual-accounts/va_123",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if id is missing or empty", async () => {
      await expect(paymish.virtualAccounts.getVirtualAccount()).rejects.toThrow(
        "Invalid parameter: 'id' is required to retrieve a virtual account."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Virtual account not found.",
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
        await paymish.virtualAccounts.getVirtualAccount("invalid_id");
        throw new Error("Expected getVirtualAccount to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Virtual account not found.");
      }
    });
  });
});
