const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Subscription Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getAllSubscriptions()", () => {
    test("should successfully retrieve all subscriptions without query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Subscriptions retrieved successfully",
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

      const result = await paymish.subscription.getAllSubscriptions();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/subscription/all",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully retrieve subscriptions with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Subscriptions retrieved successfully",
        data: [{ id: 1, name: "Gold Plan" }],
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
        status: "active",
        sort: "createdAt",
        order: "desc",
      };

      const result = await paymish.subscription.getAllSubscriptions(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/subscription/all?page=1&limit=10&status=active&sort=createdAt&order=desc",
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
        await paymish.subscription.getAllSubscriptions({ status: "invalid" });
        throw new Error("Expected getAllSubscriptions to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid query parameters.");
      }
    });
  });

  describe("createSubscription()", () => {
    test("should successfully create a new subscription (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Subscription created successfully",
        data: { id: 1, subscriptionCode: "SUB_123" },
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
        planId: 10,
        planName: "Gold Plan",
        customerId: "CUST_123",
        amount: 5000,
        nextPaymentDate: "2026-12-01",
        startDate: "2026-11-01",
        subscriptionCode: "SUB_123",
        paymentCount: 1,
        interval: "monthly",
        status: "active",
      };

      const result = await paymish.subscription.createSubscription(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/subscription",
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
        paymish.subscription.createSubscription({
          planId: 10,
        })
      ).rejects.toThrow(
        "Invalid payload: 'planId', 'planName', 'customerId', 'amount', 'nextPaymentDate', 'startDate', 'subscriptionCode', 'paymentCount', 'interval', and 'status' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid subscription details.",
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
        await paymish.subscription.createSubscription({
          planId: 10,
          planName: "Gold Plan",
          customerId: "CUST_123",
          amount: 5000,
          nextPaymentDate: "2026-12-01",
          startDate: "2026-11-01",
          subscriptionCode: "SUB_123",
          paymentCount: 1,
          interval: "monthly",
          status: "active",
        });
        throw new Error("Expected createSubscription to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid subscription details.");
      }
    });
  });
});
