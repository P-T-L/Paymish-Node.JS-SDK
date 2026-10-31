const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

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

  describe("getPlans()", () => {
    test("should successfully retrieve payment plans with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Plans retrieved successfully",
        data: [{ id: 1, planName: "Gold Plan" }],
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
        status: "Active",
        interval: "monthly",
        page: 1,
        limit: 10,
      };

      const result = await paymish.plans.getPlans(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/get-plans?status=Active&interval=monthly&page=1&limit=10",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully retrieve payment plans without query parameters", async () => {
      const mockResponseBody = { status: "success", data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.plans.getPlans();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/get-plans",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });
  });

  describe("getPlanDetails()", () => {
    test("should successfully retrieve plan details using planId (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Plan details retrieved successfully",
        data: { id: 5, planName: "Gold Plan" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.plans.getPlanDetails(5);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/get-plan-details?planId=5",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should support passing planId inside an options object", async () => {
      const mockResponseBody = { status: "success", data: { id: 5 } };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.plans.getPlanDetails({ planId: 5 });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/get-plan-details?planId=5",
        expect.any(Object)
      );
    });

    test("should throw early validation error if planId is missing", async () => {
      await expect(paymish.plans.getPlanDetails()).rejects.toThrow(
        "Invalid parameter: 'planId' is required to retrieve plan details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("updatePlanDetails()", () => {
    test("should successfully update plan details (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Plan updated successfully",
        data: { id: 98, planName: "Updated Plan Name" },
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
        planId: 98,
        planName: "Updated Plan Name",
        planDescription: "Updated plan description",
        planAmount: 200,
        interval: "Monthly",
        maxNoOfPayment: 5,
      };

      const result = await paymish.plans.updatePlanDetails(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/update-plan-details",
        expect.objectContaining({
          method: "PUT",
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
        paymish.plans.updatePlanDetails({
          planId: 98,
          planName: "Updated Plan Name",
        })
      ).rejects.toThrow(
        "Invalid payload: 'planId', 'planName', 'planDescription', 'planAmount', 'interval', and 'maxNoOfPayment' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when update fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid request payload.",
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
        await paymish.plans.updatePlanDetails({
          planId: 98,
          planName: "Updated Plan Name",
          planDescription: "Updated plan description",
          planAmount: 200,
          interval: "Monthly",
          maxNoOfPayment: 5,
        });
        throw new Error("Expected updatePlanDetails to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid request payload.");
      }
    });
  });

  describe("deletePlan()", () => {
    test("should successfully delete/update plan status (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Plan status updated successfully",
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
        planId: 98,
        status: "deleted",
      };

      const result = await paymish.plans.deletePlan(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/plans/delete-plan",
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

    test("should throw early validation error if planId or status is missing", async () => {
      await expect(
        paymish.plans.deletePlan({
          planId: 98,
        })
      ).rejects.toThrow("Invalid payload: 'planId' and 'status' are required.");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when deletion fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Plan not found.",
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
        await paymish.plans.deletePlan({
          planId: 999,
          status: "deleted",
        });
        throw new Error("Expected deletePlan to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Plan not found.");
      }
    });
  });

  describe("listPlansTransactionService()", () => {
    test("should successfully retrieve plans from transaction service (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Records retrieved successfully",
        data: [{ id: 1, name: "Test Plan" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.plans.listPlansTransactionService({ page: 1 });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/plans?page=1",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Resource not found.",
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
        await paymish.plans.listPlansTransactionService();
        throw new Error(
          "Expected listPlansTransactionService to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Resource not found.");
      }
    });
  });
});
