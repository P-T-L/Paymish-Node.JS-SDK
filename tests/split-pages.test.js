const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Products Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("createSplitPage()", () => {
    test("should successfully create a new split page (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Split page created successfully",
        data: { id: 55, split_code: "SPL_8bXAewX81723109262806" },
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
        name: "fdhfdh",
        type: "percentage",
        currency: "NGN",
        integration: 12345,
        domain: "test",
        active: true,
        is_dynamic: true,
      };

      const result = await paymish.splitPages.createSplitPage(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/split-page",
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
        paymish.splitPages.createSplitPage({
          name: "fdhfdh",
          type: "percentage",
        })
      ).rejects.toThrow(
        "Invalid payload: 'name', 'type', 'currency', 'integration', 'domain', and 'active' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid split configuration.",
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
        await paymish.splitPages.createSplitPage({
          name: "fdhfdh",
          type: "invalid",
          currency: "NGN",
          integration: 12345,
          domain: "test",
          active: true,
        });
        throw new Error("Expected createSplitPage to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid split configuration.");
      }
    });
  });
});
