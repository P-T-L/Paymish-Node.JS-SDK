const Paymish = require("..");
const { PaymishError } = require("../src/errors");

describe("TransactionCustomer Module - listCustomers()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve transaction customers with query parameters (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Customers retrieved successfully",
      data: {
        customers: [{ id: "tx_cust_123", name: "Jane Doe" }],
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

    const queryParams = { page: 1, limit: 10, search: "Jane" };
    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };

    const result = await paymish.transactionCustomer.listCustomers(queryParams, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/customers?page=1&limit=10&search=Jane",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_secret_key",
        }),
        signal: expect.any(AbortSignal),
      })
    );

    // Verify GET request does NOT send an auto-generated idempotency key
    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toBeUndefined();

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
      await paymish.transactionCustomer.listCustomers({ page: -1 });
      throw new Error("Expected listCustomers to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid query parameters.");
    }
  });
});

describe("TransactionCustomer Module - createCustomer()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a transaction customer (201 Created or 200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Customer created successfully",
      data: { customerId: "tx_cust_999", email: "test@example.com" },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.transactionCustomer.createCustomer(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/customers",
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

  test("should throw early validation error if payload is missing or invalid", async () => {
    await expect(paymish.transactionCustomer.createCustomer(null)).rejects.toThrow(
      "Invalid payload: A valid payload object is required to create a transaction customer."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when server responds with 400 Bad Request", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Validation failed for customer creation.",
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
      await paymish.transactionCustomer.createCustomer({ email: "invalid" });
      throw new Error("Expected createCustomer to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed for customer creation.");
    }
  });
});

describe("TransactionCustomer Module - getCustomerById()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve transaction customer details by direct ID (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Customer retrieved successfully",
      data: { id: "tx_cust_123", email: "jane@example.com" },
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
    const result = await paymish.transactionCustomer.getCustomerById("tx_cust_123", {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/customers/tx_cust_123",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_secret_key",
        }),
        signal: expect.any(AbortSignal),
      })
    );

    // Verify GET request does NOT send an auto-generated idempotency key
    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toBeUndefined();

    expect(result).toEqual(mockResponseBody);
  });

  test("should support passing an object payload containing customer id", async () => {
    const mockResponseBody = { status: "success", data: { id: "tx_cust_456" } };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const result = await paymish.transactionCustomer.getCustomerById({ id: "tx_cust_456" });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/customers/tx_cust_456",
      expect.objectContaining({ method: "GET" })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if customerId is missing or empty", async () => {
    await expect(paymish.transactionCustomer.getCustomerById()).rejects.toThrow(
      "Invalid parameter: 'customerId' (or 'id') is required."
    );

    await expect(paymish.transactionCustomer.getCustomerById("")).rejects.toThrow(
      "Invalid parameter: 'customerId' (or 'id') is required."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when customer is not found (404 Not Found)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Customer not found.",
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
      await paymish.transactionCustomer.getCustomerById("non_existent");
      throw new Error("Expected getCustomerById to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Customer not found.");
    }
  });
});

describe("TransactionCustomer Module - updateCustomer()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully update a transaction customer by ID (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Customer updated successfully",
      data: { id: "tx_cust_123", email: "updated@example.com" },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = { email: "updated@example.com", firstName: "Jonathan" };
    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };

    const result = await paymish.transactionCustomer.updateCustomer("tx_cust_123", payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/customers/tx_cust_123",
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

  test("should support passing an object identifier containing customer id", async () => {
    const mockResponseBody = { status: "success", message: "Updated" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = { firstName: "Jane" };
    const result = await paymish.transactionCustomer.updateCustomer({ id: "tx_cust_456" }, payload);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/customers/tx_cust_456",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(payload),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if customerId or payload is missing", async () => {
    // Missing customerId
    await expect(
      paymish.transactionCustomer.updateCustomer("", { firstName: "Test" })
    ).rejects.toThrow(
      "Invalid parameter: 'customerId' (or 'id') is required to update a customer."
    );

    // Missing payload
    await expect(paymish.transactionCustomer.updateCustomer("tx_cust_123", null)).rejects.toThrow(
      "Invalid payload: A valid payload object is required to update a transaction customer."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when server responds with 404 Not Found", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Customer not found.",
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
      await paymish.transactionCustomer.updateCustomer("non_existent", { firstName: "Test" });
      throw new Error("Expected updateCustomer to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Customer not found.");
    }
  });
});
