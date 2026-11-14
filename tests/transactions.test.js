const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Transaction Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("verifyTransaction()", () => {
    test("should successfully verify a transaction by reference (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transaction verified successfully",
        data: { reference: "TXN_waTjNBitbamwNnLuavU1xd", amount: 5000, status: "success" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const reference = "TXN_waTjNBitbamwNnLuavU1xd";
      const result = await paymish.transactions.verifyTransaction(reference);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.paymish.com/api/transaction-service/external/v1/verify/${reference}`,
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if reference is missing or empty", async () => {
      await expect(paymish.transactions.verifyTransaction("")).rejects.toThrow(
        "Invalid parameter: 'reference' is required as a non-empty string to verify a transaction."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Transaction reference not found.",
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
        await paymish.transactions.verifyTransaction("INVALID_REF");
        throw new Error("Expected verifyTransaction to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Transaction reference not found.");
      }
    });
  });
});
