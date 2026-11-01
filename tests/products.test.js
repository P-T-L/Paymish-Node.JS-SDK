const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Products Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("createProduct()", () => {
    test("should successfully create a new product (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product created successfully",
        data: { id: 1, productName: "New Product" },
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
        businessId: "12345",
        productName: "New Product",
        productDescription: "This is a sample product.",
        productPrice: "100.00",
        quantityType: "unit",
        quantityStock: 50,
        isPhysical: true,
      };

      const result = await paymish.products.createProduct(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/create-product",
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
        paymish.products.createProduct({
          businessId: "12345",
          productName: "New Product",
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'productName', 'productDescription', 'productPrice', 'quantityType', 'quantityStock', and 'isPhysical' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when creation fails (400 Bad Request)", async () => {
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
        await paymish.products.createProduct({
          businessId: "12345",
          productName: "New Product",
          productDescription: "Test description",
          productPrice: "100.00",
          quantityType: "unit",
          quantityStock: 50,
          isPhysical: true,
        });
        throw new Error("Expected createProduct to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid request payload.");
      }
    });
  });

  describe("getProducts()", () => {
    test("should successfully retrieve products with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Products retrieved successfully",
        data: [{ id: 1, productName: "Sample Product" }],
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
        status: true,
        quantityType: "Limited",
        productPrice: "100.00",
      };

      const result = await paymish.products.getProducts(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-products?status=true&quantityType=Limited&productPrice=100.00",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully retrieve products without query parameters", async () => {
      const mockResponseBody = { status: "success", data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.products.getProducts();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-products",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });
  });

  describe("getProductDetails()", () => {
    test("should successfully retrieve product details using productId (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product details retrieved successfully",
        data: { id: "123", productName: "Sample Product" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.products.getProductDetails("123");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-product-details?productId=123",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should support passing productId inside an options object", async () => {
      const mockResponseBody = { status: "success", data: { id: "123" } };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.products.getProductDetails({ productId: "123" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-product-details?productId=123",
        expect.any(Object)
      );
    });

    test("should throw early validation error if productId is missing", async () => {
      await expect(paymish.products.getProductDetails()).rejects.toThrow(
        "Invalid parameter: 'productId' is required to retrieve product details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("deleteProduct()", () => {
    test("should successfully delete/update product status (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product status updated successfully",
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
        productId: "123",
        status: false,
      };

      const result = await paymish.products.deleteProduct(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/delete-product",
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

    test("should throw early validation error if productId or status is missing", async () => {
      await expect(
        paymish.products.deleteProduct({
          productId: "123",
        })
      ).rejects.toThrow("Invalid payload: 'productId' and 'status' are required.");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when deletion fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Product not found.",
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
        await paymish.products.deleteProduct({
          productId: "999",
          status: false,
        });
        throw new Error("Expected deleteProduct to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Product not found.");
      }
    });
  });

  describe("archiveProduct()", () => {
    test("should successfully archive/unarchive product (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product status updated successfully",
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
        productId: "123",
        status: true,
      };

      const result = await paymish.products.archiveProduct(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/archive-product",
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

    test("should throw early validation error if productId or status is missing", async () => {
      await expect(
        paymish.products.archiveProduct({
          productId: "123",
        })
      ).rejects.toThrow("Invalid payload: 'productId' and 'status' are required.");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when archive fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Product not found.",
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
        await paymish.products.archiveProduct({
          productId: "999",
          status: true,
        });
        throw new Error("Expected archiveProduct to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Product not found.");
      }
    });
  });

  describe("updateProductDetails()", () => {
    test("should successfully update product details (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product updated successfully",
        data: { id: "123", productName: "Updated Product Name" },
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
        productId: "123",
        productName: "Updated Product Name",
        productDescription: "This is an updated product description.",
        productPrice: "150.00",
        quantityType: "Limited",
        quantityStock: 50,
        minOrder: 1,
        maxOrder: 10,
        lowStockAlert: true,
        notifyStock: 5,
        shareableUrl: "https://example.com/product/123",
        productBackgroundColor: "#FFFFFF",
        deliveryAddress: "Required",
        deliveryNote: "Optional",
        redirectAfterPaymentLink: "https://example.com/thank-you",
        successMessage: "Thank you for your purchase!",
        sendNotification: "email",
        isActive: true,
      };

      const result = await paymish.products.updateProductDetails(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/update-product-details",
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
        paymish.products.updateProductDetails({
          productId: "123",
          productName: "Updated Product Name",
        })
      ).rejects.toThrow(
        "Invalid payload: 'productId', 'productName', 'productDescription', 'productPrice', 'quantityType', 'quantityStock', 'minOrder', 'maxOrder', 'lowStockAlert', 'notifyStock', 'shareableUrl', 'productBackgroundColor', 'deliveryAddress', 'deliveryNote', 'redirectAfterPaymentLink', 'successMessage', 'sendNotification', and 'isActive' are required."
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
        await paymish.products.updateProductDetails({
          productId: "123",
          productName: "Updated Product Name",
          productDescription: "This is an updated product description.",
          productPrice: "150.00",
          quantityType: "Limited",
          quantityStock: 50,
          minOrder: 1,
          maxOrder: 10,
          lowStockAlert: true,
          notifyStock: 5,
          shareableUrl: "https://example.com/product/123",
          productBackgroundColor: "#FFFFFF",
          deliveryAddress: "Required",
          deliveryNote: "Optional",
          redirectAfterPaymentLink: "https://example.com/thank-you",
          successMessage: "Thank you for your purchase!",
          sendNotification: "email",
          isActive: true,
        });
        throw new Error("Expected updateProductDetails to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid request payload.");
      }
    });
  });

  describe("productUploadMedia()", () => {
    test("should successfully upload product media (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Media uploaded successfully",
        data: { url: "https://example.com/media.jpg" },
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
        productId: "123",
        media: "mock-file-stream",
      };

      const result = await paymish.products.productUploadMedia(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/product-upload-media",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: expect.any(FormData),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if productId or media is missing", async () => {
      await expect(
        paymish.products.productUploadMedia({
          productId: "123",
        })
      ).rejects.toThrow("Invalid payload: 'productId' and 'media' are required.");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when media upload fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid file format.",
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
        await paymish.products.productUploadMedia({
          productId: "123",
          media: "invalid-file",
        });
        throw new Error("Expected productUploadMedia to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid file format.");
      }
    });
  });

  describe("getProductMedia()", () => {
    test("should successfully retrieve product media using productId (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product media retrieved successfully",
        data: [{ id: 1, url: "https://example.com/media.jpg" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.products.getProductMedia("123");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-product-media?productId=123",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should support passing productId inside an options object", async () => {
      const mockResponseBody = { status: "success", data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.products.getProductMedia({ productId: "123" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-product-media?productId=123",
        expect.any(Object)
      );
    });

    test("should throw early validation error if productId is missing", async () => {
      await expect(paymish.products.getProductMedia()).rejects.toThrow(
        "Invalid parameter: 'productId' is required to retrieve product media."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when retrieval fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Product not found.",
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
        await paymish.products.getProductMedia("999");
        throw new Error("Expected getProductMedia to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Product not found.");
      }
    });
  });

  describe("deleteProductMedia()", () => {
    test("should successfully delete/update product media status (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product media status updated successfully",
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
        mediaId: "media_123",
        status: false,
      };

      const result = await paymish.products.deleteProductMedia(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/delete-product-media",
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

    test("should throw early validation error if mediaId or status is missing", async () => {
      await expect(
        paymish.products.deleteProductMedia({
          mediaId: "media_123",
        })
      ).rejects.toThrow("Invalid payload: 'mediaId' and 'status' are required.");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when deletion fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Media not found.",
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
        await paymish.products.deleteProductMedia({
          mediaId: "invalid_media",
          status: false,
        });
        throw new Error("Expected deleteProductMedia to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Media not found.");
      }
    });
  });

  describe("getProductInventoryDetails()", () => {
    test("should successfully retrieve product inventory details using productId (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Product inventory details retrieved successfully",
        data: { productId: "123", quantityStock: 50, quantityType: "Limited" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.products.getProductInventoryDetails("123");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-product-inventory-details?productId=123",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should support passing productId inside an options object", async () => {
      const mockResponseBody = { status: "success", data: { quantityStock: 10 } };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.products.getProductInventoryDetails({ productId: "123" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-product-inventory-details?productId=123",
        expect.any(Object)
      );
    });

    test("should throw early validation error if productId is missing", async () => {
      await expect(paymish.products.getProductInventoryDetails()).rejects.toThrow(
        "Invalid parameter: 'productId' is required to retrieve product inventory details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when retrieval fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Product not found.",
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
        await paymish.products.getProductInventoryDetails("999");
        throw new Error(
          "Expected getProductInventoryDetails to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Product not found.");
      }
    });
  });

  describe("addDigitalDownloadFiles()", () => {
    test("should successfully upload digital download files (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Digital download file uploaded successfully",
        data: { url: "https://example.com/download.zip" },
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
        productId: "123",
        media: "mock-zip-file-stream",
      };

      const result = await paymish.products.addDigitalDownloadFiles(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/add-digital-download-files",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: expect.any(FormData),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if productId or media is missing", async () => {
      await expect(
        paymish.products.addDigitalDownloadFiles({
          productId: "123",
        })
      ).rejects.toThrow("Invalid payload: 'productId' and 'media' are required.");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when upload fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid file format.",
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
        await paymish.products.addDigitalDownloadFiles({
          productId: "123",
          media: "invalid-file",
        });
        throw new Error(
          "Expected addDigitalDownloadFiles to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid file format.");
      }
    });
  });

  describe("getDigitalDownloadFiles()", () => {
    test("should successfully retrieve digital download files using productId (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Digital download files retrieved successfully",
        data: [{ id: 1, url: "https://example.com/download.zip" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.products.getDigitalDownloadFiles("123");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-digital-download-files?productId=123",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should support passing productId inside an options object", async () => {
      const mockResponseBody = { status: "success", data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      await paymish.products.getDigitalDownloadFiles({ productId: "123" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/products/get-digital-download-files?productId=123",
        expect.any(Object)
      );
    });

    test("should throw early validation error if productId is missing", async () => {
      await expect(paymish.products.getDigitalDownloadFiles()).rejects.toThrow(
        "Invalid parameter: 'productId' is required to retrieve digital download files."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when retrieval fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Product not found.",
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
        await paymish.products.getDigitalDownloadFiles("999");
        throw new Error(
          "Expected getDigitalDownloadFiles to throw PaymishError, but it succeeded."
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Product not found.");
      }
    });
  });
});
