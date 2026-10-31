const Paymish = require("../src/index");
const PaymishError = require("../src/errors/paymish-error");

describe("Plans Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("createPlan()", () => {
    test("should successfully create a new plan (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Plan created successfully",
        data: { id: 1, planName: "Gold Plan" },
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
        businessId: 10,
        planName: "Gold Plan",
        planDescription: "Monthly premium subscription",
        planAmount: 5000,
        interval: "monthly",
        maxNoOfPayment: 12,
        isSubscriptionPageForThisPlan: true,
      };

      const result = await paymish.plans.createPlan(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/create-plan",
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

    test("should throw early validation error if any required field is missing", async () => {
      await expect(
        paymish.plans.createPlan({
          businessId: 10,
          planName: "Gold Plan",
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'planName', 'planDescription', 'planAmount', 'interval', 'maxNoOfPayment', and 'isSubscriptionPageForThisPlan' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when creation fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid request payload. Check required fields.",
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
        await paymish.plans.createPlan({
          businessId: 10,
          planName: "Gold Plan",
          planDescription: "Test",
          planAmount: 5000,
          interval: "monthly",
          maxNoOfPayment: 12,
          isSubscriptionPageForThisPlan: true,
        });
        throw new Error("Expected createPlan to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid request payload. Check required fields.");
      }
    });
  });
});
