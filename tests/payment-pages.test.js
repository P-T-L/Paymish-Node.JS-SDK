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

  describe("deletePage()", () => {
    test("should successfully delete a payment page (200 OK)", async () => {
      const mockResponseBody = {
        message: "Page deleted successfully.",
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
        isDeleted: true,
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.deletePage(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/delete-page",
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

    test("should throw early validation error if pageId or isDeleted is missing", async () => {
      await expect(paymish.paymentPages.deletePage({ pageId: 447 })).rejects.toThrow(
        "Invalid payload: 'pageId' and 'isDeleted' are required to delete a payment page."
      );

      await expect(paymish.paymentPages.deletePage({ isDeleted: true })).rejects.toThrow(
        "Invalid payload: 'pageId' and 'isDeleted' are required to delete a payment page."
      );

      await expect(paymish.paymentPages.deletePage(null)).rejects.toThrow(
        "Invalid payload: 'pageId' and 'isDeleted' are required to delete a payment page."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when deletion fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Invalid page ID or parameters.",
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
        await paymish.paymentPages.deletePage({
          pageId: 99999,
          isDeleted: true,
        });
        throw new Error("Expected deletePage to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid page ID or parameters.");
      }
    });
  });

  describe("getAssociatedProducts()", () => {
    test("should successfully retrieve products associated with a payment page (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Products retrieved successfully",
        data: [{ id: 1, name: "Sample Product" }],
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
      const result = await paymish.paymentPages.getAssociatedProducts(
        { pageId: 447, searchProduct: "Sample" },
        { headers: authHeaders }
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/payment-page-get-product?pageId=447&searchProduct=Sample",
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
      await expect(paymish.paymentPages.getAssociatedProducts()).rejects.toThrow(
        "Invalid parameter: 'pageId' is required to retrieve products associated with a payment page."
      );

      await expect(paymish.paymentPages.getAssociatedProducts({})).rejects.toThrow(
        "Invalid parameter: 'pageId' is required to retrieve products associated with a payment page."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Invalid page ID.",
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
        await paymish.paymentPages.getAssociatedProducts(99999);
        throw new Error("Expected getAssociatedProducts to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid page ID.");
      }
    });
  });

  describe("addProductToPaymentPage()", () => {
    test("should successfully add products to a payment page (200 OK)", async () => {
      const mockResponseBody = {
        message: "Products added successfully.",
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
        productIds: "123,456,789",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.addProductToPaymentPage(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/payment-page-add-product",
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

    test("should throw early validation error if pageId or productIds is missing", async () => {
      await expect(paymish.paymentPages.addProductToPaymentPage({ pageId: 447 })).rejects.toThrow(
        "Invalid payload: 'pageId' and 'productIds' are required to add products to a payment page."
      );

      await expect(
        paymish.paymentPages.addProductToPaymentPage({ productIds: "123,456" })
      ).rejects.toThrow(
        "Invalid payload: 'pageId' and 'productIds' are required to add products to a payment page."
      );

      await expect(paymish.paymentPages.addProductToPaymentPage(null)).rejects.toThrow(
        "Invalid payload: 'pageId' and 'productIds' are required to add products to a payment page."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Invalid product ID or page ID.",
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
        await paymish.paymentPages.addProductToPaymentPage({
          pageId: 99999,
          productIds: "invalid_id",
        });
        throw new Error(
          "Expected addProductToPaymentPage to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid product ID or page ID.");
      }
    });
  });

  describe("deleteProductFromPaymentPage()", () => {
    test("should successfully delete a product from a payment page (200 OK)", async () => {
      const mockResponseBody = {
        message: "Product deleted from payment page successfully.",
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
        paymentPageProductId: 123,
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.deleteProductFromPaymentPage(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/payment-page-delete-product",
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

    test("should throw early validation error if paymentPageProductId is missing", async () => {
      await expect(paymish.paymentPages.deleteProductFromPaymentPage()).rejects.toThrow(
        "Invalid payload: 'paymentPageProductId' is required to delete a product from a payment page."
      );

      await expect(paymish.paymentPages.deleteProductFromPaymentPage({})).rejects.toThrow(
        "Invalid payload: 'paymentPageProductId' is required to delete a product from a payment page."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        message: "Invalid payment page product ID.",
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
        await paymish.paymentPages.deleteProductFromPaymentPage(99999);
        throw new Error(
          "Expected deleteProductFromPaymentPage to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid payment page product ID.");
      }
    });
  });

  describe("initiateCheckoutDynamicVirtualAccount()", () => {
    test("should successfully initiate a dynamic virtual account for checkout (200 OK)", async () => {
      const mockResponseBody = {
        data: {
          accountNumber: "1234567890",
          bankName: "Paymish Bank",
          expiresAt: "2026-10-26T16:00:00Z",
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
        accessCode: "chk_9f8a7b6c5d4e",
        amount: 5000,
        email: "customer@example.com",
        pageReference: "ref_123",
        transferSelectedAt: 1698336000000,
      };

      const result = await paymish.paymentPages.initiateCheckoutDynamicVirtualAccount(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account",
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

    test("should support snake_case aliases for access_code and page_reference", async () => {
      const mockResponseBody = { data: "success" };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const payload = {
        access_code: "chk_9f8a7b6c5d4e",
        amount: 5000,
        page_reference: "ref_123",
      };

      await paymish.paymentPages.initiateCheckoutDynamicVirtualAccount(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account",
        expect.objectContaining({
          body: JSON.stringify({
            accessCode: "chk_9f8a7b6c5d4e",
            amount: 5000,
            pageReference: "ref_123",
          }),
        })
      );
    });

    test("should throw early validation error if accessCode or amount is missing/invalid", async () => {
      await expect(
        paymish.paymentPages.initiateCheckoutDynamicVirtualAccount({ amount: 5000 })
      ).rejects.toThrow(
        "Invalid payload: 'accessCode' and numeric 'amount' are required to initiate a dynamic virtual account."
      );

      await expect(
        paymish.paymentPages.initiateCheckoutDynamicVirtualAccount({ accessCode: "chk_123" })
      ).rejects.toThrow(
        "Invalid payload: 'accessCode' and numeric 'amount' are required to initiate a dynamic virtual account."
      );

      await expect(
        paymish.paymentPages.initiateCheckoutDynamicVirtualAccount({
          accessCode: "chk_123",
          amount: "5000",
        })
      ).rejects.toThrow(
        "Invalid payload: 'accessCode' and numeric 'amount' are required to initiate a dynamic virtual account."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when allocation fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid request payload. Check `accessCode` and try again.",
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
        await paymish.paymentPages.initiateCheckoutDynamicVirtualAccount({
          accessCode: "invalid_code",
          amount: 5000,
        });
        throw new Error(
          "Expected initiateCheckoutDynamicVirtualAccount to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid request payload. Check `accessCode` and try again.");
      }
    });
  });

  describe("listPaymentPages()", () => {
    test("should successfully retrieve payment pages from transaction service (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Record retrieved successfully",
        data: [
          { id: 1, title: "Test Page 1" },
          { id: 2, title: "Test Page 2" },
        ],
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
      const result = await paymish.paymentPages.listPaymentPages({
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/payment-pages",
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

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Requested record was not found.",
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
        await paymish.paymentPages.listPaymentPages();
        throw new Error("Expected listPaymentPages to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Requested record was not found.");
      }
    });
  });

  describe("createPaymentPageTransactionService()", () => {
    test("should successfully create a payment page via transaction service (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Request processed successfully",
        data: { reference: "PM-REF-12345" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const payload = { title: "New Transaction Page" };
      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.paymentPages.createPaymentPageTransactionService(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/payment-pages",
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

    test("should throw PaymishError when creation fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid request payload. Check `required_field` and try again.",
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
        await paymish.paymentPages.createPaymentPageTransactionService({});
        throw new Error(
          "Expected createPaymentPageTransactionService to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe(
          "Invalid request payload. Check `required_field` and try again."
        );
      }
    });
  });
});
