const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Subaccounts Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("createSubaccount()", () => {
    test("should successfully create a new subaccount (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Subaccount created successfully",
        data: { id: 1, business_name: "dfsdhjfgdsjfd" },
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
        business_name: "dfsdhjfgdsjfd",
        account_number: "1234567890",
        percentage_charge: 10,
        currency: "NGN",
        bank: 999004,
        account_name: "new",
      };

      const result = await paymish.subaccounts.createSubaccount(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/subaccounts/",
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

    test("should throw early validation error if required fields are missing", async () => {
      await expect(
        paymish.subaccounts.createSubaccount({
          business_name: "dfsdhjfgdsjfd",
        })
      ).rejects.toThrow(
        "Invalid payload: 'business_name', 'account_number', 'percentage_charge', 'currency', 'bank', and 'account_name' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid bank code or account details.",
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
        await paymish.subaccounts.createSubaccount({
          business_name: "dfsdhjfgdsjfd",
          account_number: "1234567890",
          percentage_charge: 10,
          currency: "NGN",
          bank: 999004,
          account_name: "new",
        });
        throw new Error("Expected createSubaccount to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid bank code or account details.");
      }
    });
  });

  describe("getAllSubaccounts()", () => {
    test("should successfully retrieve all subaccounts with required and optional query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Subaccounts retrieved successfully",
        data: [{ id: 1, business_name: "dfsdhjfgdsjfd" }],
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
        sort: "DESC",
        sortKey: "createdAt",
        searchString: "dfsd",
      };

      const result = await paymish.subaccounts.getAllSubaccounts(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/subaccounts/all?page=1&limit=10&sort=DESC&sortKey=createdAt&searchString=dfsd",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required parameters (page, limit, sort, sortKey) are missing", async () => {
      await expect(
        paymish.subaccounts.getAllSubaccounts({
          page: 1,
          limit: 10,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'page', 'limit', 'sort', and 'sortKey' are required to retrieve subaccounts."
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
        await paymish.subaccounts.getAllSubaccounts({
          page: 1,
          limit: 10,
          sort: "DESC",
          sortKey: "createdAt",
        });
        throw new Error("Expected getAllSubaccounts to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid query parameters.");
      }
    });
  });
});
