const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Utility Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("fetchBillerGroups()", () => {
    test("should successfully fetch biller groups without query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Biller groups retrieved successfully",
        data: [{ id: 1, name: "Electricity" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.utility.fetchBillerGroups();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/utility/biller-groups",
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
        message: "Failed to retrieve biller groups.",
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
        await paymish.utility.fetchBillerGroups();
        throw new Error("Expected fetchBillerGroups to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Failed to retrieve biller groups.");
      }
    });
  });

  describe("fetchBillersByGroupId()", () => {
    test("should successfully fetch billers by group ID (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Billers retrieved successfully",
        data: [{ id: 101, name: "Ikeja Electric" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const groupId = 5;
      const result = await paymish.utility.fetchBillersByGroupId(groupId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/utility/billers/group/5",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if groupId is missing or empty", async () => {
      await expect(paymish.utility.fetchBillersByGroupId()).rejects.toThrow(
        "Invalid parameter: 'groupId' is required to fetch billers by group ID."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Biller group not found.",
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
        await paymish.utility.fetchBillersByGroupId(9999);
        throw new Error("Expected fetchBillersByGroupId to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Biller group not found.");
      }
    });
  });

  describe("fetchPackagesByBillerId()", () => {
    test("should successfully fetch packages by biller ID (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Packages retrieved successfully",
        data: [{ id: 201, name: "Prepaid 1000" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const billerId = 101;
      const result = await paymish.utility.fetchPackagesByBillerId(billerId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/utility/packages/biller/101",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if billerId is missing or empty", async () => {
      await expect(paymish.utility.fetchPackagesByBillerId()).rejects.toThrow(
        "Invalid parameter: 'billerId' is required to fetch packages by biller ID."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Biller not found.",
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
        await paymish.utility.fetchPackagesByBillerId(9999);
        throw new Error(
          "Expected fetchPackagesByBillerId to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Biller not found.");
      }
    });
  });

  describe("customerLookup()", () => {
    test("should successfully perform customer lookup (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Customer lookup successful",
        data: { customerName: "Jane Doe", customerId: "0101160313181" },
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
        customerId: "0101160313181",
        billerId: 1,
        productName: "PREPAID",
      };

      const result = await paymish.utility.customerLookup(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/utility/transactions/customer-lookup",
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
      await expect(paymish.utility.customerLookup(null)).rejects.toThrow(
        "Invalid payload: payload object is required for customer lookup."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Customer not found.",
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
        await paymish.utility.customerLookup({ customerId: "INVALID" });
        throw new Error("Expected customerLookup to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Customer not found.");
      }
    });
  });
});
