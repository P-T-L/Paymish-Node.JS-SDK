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
});
