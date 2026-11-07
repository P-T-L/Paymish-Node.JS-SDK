const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Products Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getRecipientList()", () => {
    test("should successfully retrieve recipient list with required and optional parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Recipients retrieved successfully",
        data: [{ id: 1, accountName: "John Doe" }],
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
        businessId: "biz_123",
        limit: 10,
        page: 1,
        status: true,
        searchRecipientAccountName: "John",
      };

      const result = await paymish.recipients.getRecipientList(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transfer/get-recipient-list?businessId=biz_123&limit=10&page=1&status=true&searchRecipientAccountName=John",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required parameters (businessId, limit, page) are missing", async () => {
      await expect(
        paymish.recipients.getRecipientList({
          businessId: "biz_123",
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve the recipient list."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid business ID.",
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
        await paymish.recipients.getRecipientList({
          businessId: "invalid",
          limit: 10,
          page: 1,
        });
        throw new Error("Expected getRecipientList to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid business ID.");
      }
    });
  });
});
