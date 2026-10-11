const Paymish = require("..");
const { PaymishError } = require("../src/errors");

describe("Customer Module - createCustomer()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish(); // Instantiate SDK before each test
    global.fetch = jest.fn(); // Reset global fetch mock state
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a new customer (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Customer created successfully.",
      data: { customerId: "cust_12345" },
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
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+2348012345678",
      countryId: 1,
      dialingCodeId: 2,
      businessId: 10,
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.customer.createCustomer(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/create",
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

  test("should throw PaymishError when payload fails API validation (400 Bad Request)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Invalid request payload. Check `email` and try again.",
      errors: {
        email: ["`email` is required or invalid."],
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
      // Pass required fields to pass client-side check, letting API respond with 400
      await paymish.customer.createCustomer({
        email: "invalid-email",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+2348012345678",
        countryId: 1,
      });
      throw new Error("Expected createCustomer to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Invalid request payload. Check `email` and try again.");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toHaveProperty("email");
      expect(error.errors.email).toContain("`email` is required or invalid.");
    }
  });

  test("should throw early validation error if required fields are missing", async () => {
    // Missing email
    await expect(
      paymish.customer.createCustomer({
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+2348012345678",
        countryId: 1,
      })
    ).rejects.toThrow(
      "Invalid payload: 'email', 'firstName', 'lastName', 'phoneNumber', and 'countryId' are required fields."
    );

    // Missing countryId
    await expect(
      paymish.customer.createCustomer({
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+2348012345678",
      })
    ).rejects.toThrow(
      "Invalid payload: 'email', 'firstName', 'lastName', 'phoneNumber', and 'countryId' are required fields."
    );

    // Verify early return prevented network requests
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when unauthorized (401 Unauthorized)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Unauthorized access. Provided Bearer token is invalid or expired.",
      errors: null,
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.customer.createCustomer({
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+2348012345678",
        countryId: 1,
      });
      throw new Error("Expected createCustomer to throw 401 PaymishError");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("Unauthorized");
    }
  });
});

describe("Customer Module - updateCustomer()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully update an existing customer with partial or full payload (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Customer updated successfully.",
      data: { customerReference: "CUST-REF-001" },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    // Testing a partial update (e.g., updating only the phone number and reference)
    const payload = {
      customerReference: "CUST-REF-001",
      phoneNumber: "+2348099998888",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.customer.updateCustomer(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/customer-update",
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

  test("should throw PaymishError when update payload fails API validation (400 Bad Request)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Invalid request payload. Check `customerReference` and try again.",
      errors: {
        customerReference: ["Customer reference does not exist."],
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
      await paymish.customer.updateCustomer({
        customerReference: "INVALID-REF",
        firstName: "Jane",
      });
      throw new Error("Expected updateCustomer to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe(
        "Invalid request payload. Check `customerReference` and try again."
      );
      expect(error.statusCode).toBe(400);
      expect(error.errors).toHaveProperty("customerReference");
    }
  });

  test("should throw early validation error if customerReference is missing", async () => {
    await expect(
      paymish.customer.updateCustomer({
        firstName: "John",
        lastName: "Doe",
      })
    ).rejects.toThrow("Invalid payload: 'customerReference' is required to update a customer.");

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when request is unauthorized (401 Unauthorized)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Unauthorized access. Provided Bearer token is invalid or expired.",
      errors: null,
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.customer.updateCustomer({
        customerReference: "CUST-REF-001",
        firstName: "John",
      });
      throw new Error("Expected updateCustomer to throw 401 PaymishError");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("Unauthorized");
    }
  });
});

describe("Customer Module - listCustomers()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should automatically inject default page and limit when params are omitted (200 OK)", async () => {
    const mockResponseBody = { status: "success", data: [] };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    // Calling with no parameters
    const result = await paymish.customer.listCustomers();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Notice how the URL now expects the default page=1 and limit=10
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/list?page=1&limit=10",
      expect.objectContaining({ method: "GET" })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should allow developer parameters to override defaults (200 OK)", async () => {
    const mockResponseBody = { status: "success", data: [] };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    // Developer explicitly passes custom page, limit, and search parameters
    const result = await paymish.customer.listCustomers({ page: 3, limit: 50, search: "Alice" });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Notice how page and limit use the developer's values (3 and 50) instead of 1 and 10
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/list?page=3&limit=50&search=Alice",
      expect.objectContaining({ method: "GET" })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw PaymishError when API returns a 400 Bad Request error", async () => {
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
      await paymish.customer.listCustomers();
      throw new Error("Expected listCustomers to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid query parameters.");
    }
  });
});

describe("Customer Module - blacklistCustomer()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully blacklist a customer (200 OK)", async () => {
    const mockResponseBody = {
      message: "Update customer status successfully.",
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
      customerReference: "CUST_49089e7a-5000-4ab1-b107-f921feec0468",
      isBlackListed: true,
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.customer.blacklistCustomer(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/black-listed",
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

  test("should successfully whitelist a customer by passing isBlackListed: false (200 OK)", async () => {
    const mockResponseBody = {
      message: "Update customer status successfully.",
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
      customerReference: "CUST_49089e7a-5000-4ab1-b107-f921feec0468",
      isBlackListed: false,
    };

    const result = await paymish.customer.blacklistCustomer(payload);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/black-listed",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(payload),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error when required fields are missing or invalid", async () => {
    // Missing isBlackListed
    await expect(
      paymish.customer.blacklistCustomer({
        customerReference: "CUST_12345",
      })
    ).rejects.toThrow(
      "Invalid payload: 'customerReference' (string) and 'isBlackListed' (boolean) are required fields."
    );

    // Non-boolean isBlackListed
    await expect(
      paymish.customer.blacklistCustomer({
        customerReference: "CUST_12345",
        isBlackListed: "true",
      })
    ).rejects.toThrow(
      "Invalid payload: 'customerReference' (string) and 'isBlackListed' (boolean) are required fields."
    );

    // Missing customerReference
    await expect(
      paymish.customer.blacklistCustomer({
        isBlackListed: true,
      })
    ).rejects.toThrow(
      "Invalid payload: 'customerReference' (string) and 'isBlackListed' (boolean) are required fields."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when server responds with 400 Bad Request", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Bad request.",
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
      await paymish.customer.blacklistCustomer({
        customerReference: "CUST_INVALID",
        isBlackListed: true,
      });
      throw new Error("Expected blacklistCustomer to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request.");
    }
  });
});

describe("Customer Module - getCustomerById()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve customer details by direct integer ID (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Record retrieved successfully",
      data: { customerId: 101, email: "john@example.com" },
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
    const result = await paymish.customer.getCustomerById(101, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/get-customer-by-id?customerId=101",
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

  test("should support passing an object payload containing customerId integer", async () => {
    const mockResponseBody = {
      status: "success",
      data: { customerId: 202 },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const result = await paymish.customer.getCustomerById({ customerId: 202 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/customer-service/external/v1/get-customer-by-id?customerId=202",
      expect.objectContaining({ method: "GET" })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if customerId is missing or empty", async () => {
    await expect(paymish.customer.getCustomerById()).rejects.toThrow(
      "Invalid parameter: 'customerId' must be a valid integer."
    );

    await expect(paymish.customer.getCustomerById("")).rejects.toThrow(
      "Invalid parameter: 'customerId' must be a valid integer."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw early validation error if customerId is not a valid integer", async () => {
    // Non-numeric string ID
    await expect(paymish.customer.getCustomerById("CUST-REF-ABC")).rejects.toThrow(
      "Invalid parameter: 'customerId' must be a valid integer."
    );

    // Floating-point number
    await expect(paymish.customer.getCustomerById(12.34)).rejects.toThrow(
      "Invalid parameter: 'customerId' must be a valid integer."
    );

    // Boolean value
    await expect(paymish.customer.getCustomerById(true)).rejects.toThrow(
      "Invalid parameter: 'customerId' must be a valid integer."
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
      await paymish.customer.getCustomerById(9999);
      throw new Error("Expected getCustomerById to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Customer not found.");
    }
  });

  test("should throw PaymishError when request is unauthorized (401 Unauthorized)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Unauthorized access.",
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.customer.getCustomerById(101);
      throw new Error("Expected getCustomerById to throw 401 PaymishError");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("Unauthorized");
    }
  });
});
