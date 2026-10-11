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
