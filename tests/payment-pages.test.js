const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("PaymentPages Module", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkCustomLinkExists()", () => {
    test("should successfully check if custom link exists (200 OK)", async () => {
      const mockResponseBody = {
        message: "Page custom link not match.",
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
        customLink: "https://example.com/my-custom-link",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.checkCustomLinkExists(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/custom-link-check-exist",
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

    test("should throw early validation error if customLink is missing", async () => {
      await expect(paymish.paymentPages.checkCustomLinkExists({})).rejects.toThrow(
        "Invalid payload: 'customLink' is required to check if a custom link exists."
      );

      await expect(paymish.paymentPages.checkCustomLinkExists(null)).rejects.toThrow(
        "Invalid payload: 'customLink' is required to check if a custom link exists."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when payload fails validation or link exists (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Page custom link already exist.",
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
        await paymish.paymentPages.checkCustomLinkExists({
          customLink: "https://example.com/existing-link",
        });
        throw new Error("Expected checkCustomLinkExists to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Page custom link already exist.");
      }
    });
  });
});
