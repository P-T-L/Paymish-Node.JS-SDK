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

  describe("createPaymentPage()", () => {
    test("should successfully create a new payment page as FormData (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Request processed successfully",
        data: {
          reference: "PM-REF-12345",
        },
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
        businessId: 123,
        planId: 456,
        pageType: "Subscription",
        pageName: "My Payment Page",
        pageDescription: "This is a sample payment page.",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.createPaymentPage(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/create-pages",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if businessId or pageName is missing", async () => {
      await expect(paymish.paymentPages.createPaymentPage({ pageName: "My Page" })).rejects.toThrow(
        "Invalid payload: 'businessId' and 'pageName' are required to create a payment page."
      );

      await expect(paymish.paymentPages.createPaymentPage({ businessId: 123 })).rejects.toThrow(
        "Invalid payload: 'businessId' and 'pageName' are required to create a payment page."
      );

      await expect(paymish.paymentPages.createPaymentPage(null)).rejects.toThrow(
        "Invalid payload: 'businessId' and 'pageName' are required to create a payment page."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when payload fails API validation (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid request payload. Check businessId and try again.",
        errors: {
          businessId: ["businessId is required."],
        },
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
        await paymish.paymentPages.createPaymentPage({
          businessId: 0,
          pageName: "Test Page",
        });
        throw new Error("Expected createPaymentPage to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid request payload. Check businessId and try again.");
      }
    });
  });

  describe("getPaymentPages()", () => {
    test("should successfully retrieve payment pages with query filters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Record retrieved successfully",
        data: [{ pageName: "My Payment Page", status: "Published" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const filters = {
        status: "Published",
        searchPageText: "Subscription",
        startDate: "2026-01-01",
        endDate: "2026-10-31",
        page: 1,
        limit: 10,
        sort: "DESC",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.getPaymentPages(filters, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/get-pages?status=Published&searchPageText=Subscription&startDate=2026-01-01&endDate=2026-10-31&page=1&limit=10&sort=DESC",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer sk_test_secret_key",
          }),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw PaymishError when unauthorized or request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Requested record was not found.",
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
        await paymish.paymentPages.getPaymentPages();
        throw new Error("Expected getPaymentPages to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Requested record was not found.");
      }
    });
  });

  describe("getPageDetails()", () => {
    test("should successfully retrieve payment page details (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Record retrieved successfully",
        data: {
          reference: "PM-REF-12345",
          status: "success",
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.getPageDetails(123, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/get-page-details?pageId=123",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer sk_test_secret_key",
          }),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if pageId is missing", async () => {
      await expect(paymish.paymentPages.getPageDetails()).rejects.toThrow(
        "Invalid parameter: 'pageId' is required to retrieve payment page details."
      );

      await expect(paymish.paymentPages.getPageDetails({})).rejects.toThrow(
        "Invalid parameter: 'pageId' is required to retrieve payment page details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when record is not found (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Requested record was not found.",
        errors: {
          reference: ["Check the identifier and merchant context before retrying."],
        },
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
        await paymish.paymentPages.getPageDetails(99999);
        throw new Error("Expected getPageDetails to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Requested record was not found.");
      }
    });
  });

  describe("updatePaymentPage()", () => {
    test("should successfully update payment page details as FormData (200 OK)", async () => {
      const mockResponseBody = {
        message: "Page detail update successfully.",
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
        pageId: 447,
        pageName: "Updated Payment Page",
        pageDescription: "This is an updated description of the payment page.",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.updatePaymentPage(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/update-page-details",
        expect.objectContaining({
          method: "PUT",
          body: expect.any(FormData),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if pageId is missing", async () => {
      await expect(
        paymish.paymentPages.updatePaymentPage({ pageName: "Updated Page" })
      ).rejects.toThrow("Invalid payload: 'pageId' is required to update payment page details.");

      await expect(paymish.paymentPages.updatePaymentPage(null)).rejects.toThrow(
        "Invalid payload: 'pageId' is required to update payment page details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when page detail is not found (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Page detail not found!",
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
        await paymish.paymentPages.updatePaymentPage({
          pageId: 99999,
          pageName: "Test",
        });
        throw new Error("Expected updatePaymentPage to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Page detail not found!");
      }
    });
  });

  describe("updatePageStatus()", () => {
    test("should successfully update payment page status (200 OK)", async () => {
      const mockResponseBody = {
        message: "Page status updated successfully.",
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
        pageId: 447,
        status: "Published",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.updatePageStatus(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/update-page-status",
        expect.objectContaining({
          method: "PUT",
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

    test("should throw early validation error if pageId or status is missing", async () => {
      await expect(paymish.paymentPages.updatePageStatus({ pageId: 447 })).rejects.toThrow(
        "Invalid payload: 'pageId' and 'status' are required to update payment page status."
      );

      await expect(paymish.paymentPages.updatePageStatus({ status: "Published" })).rejects.toThrow(
        "Invalid payload: 'pageId' and 'status' are required to update payment page status."
      );

      await expect(paymish.paymentPages.updatePageStatus(null)).rejects.toThrow(
        "Invalid payload: 'pageId' and 'status' are required to update payment page status."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when update fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Invalid page ID or status.",
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
        await paymish.paymentPages.updatePageStatus({
          pageId: 99999,
          status: "InvalidStatus",
        });
        throw new Error("Expected updatePageStatus to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid page ID or status.");
      }
    });
  });
});
