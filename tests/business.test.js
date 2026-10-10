const Paymish = require("..");
const { PaymishError } = require("../src/errors");

describe("Business Module - changeMode()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish(); // Instantiate SDK before each test
    global.fetch = jest.fn(); // Reset global fetch mock state
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully change business mode when passing object payload { isLive: false } (200 OK)", async () => {
    const mockResponseBody = { data: "value" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (header) => (header === "content-type" ? "application/json" : null) },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.business.changeMode({ isLive: false }, { headers: authHeaders });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/user-service/external/v1/change-business-mode",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_secret_key",
          "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
        }),
        body: JSON.stringify({ isLive: false }),
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should support passing a direct boolean argument (e.g. changeMode(true))", async () => {
    const mockResponseBody = { data: "value" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (header) => (header === "content-type" ? "application/json" : null) },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const result = await paymish.business.changeMode(true);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/user-service/external/v1/change-business-mode",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ isLive: true }) })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw PaymishError when payload fails API validation (400 Bad Request)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Invalid request payload. Check `isLive` and try again.",
      errors: { isLive: ["`isLive` is required."] },
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: (header) => (header === "content-type" ? "application/json" : null) },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.business.changeMode({ isLive: false });
      throw new Error("Expected changeMode to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Invalid request payload. Check `isLive` and try again.");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toHaveProperty("isLive");
      expect(error.errors.isLive).toContain("`isLive` is required.");
    }
  });

  test("should throw early validation error if isLive is missing or not a boolean", async () => {
    // Test invalid non-boolean types without making a network request
    await expect(paymish.business.changeMode({ isLive: "invalid_string" })).rejects.toThrow(
      "Invalid payload: 'isLive' must be a boolean value (true or false)."
    );

    await expect(paymish.business.changeMode(null)).rejects.toThrow(
      "Invalid payload: 'isLive' must be a boolean value (true or false)."
    );

    await expect(paymish.business.changeMode()).rejects.toThrow(
      "Invalid payload: 'isLive' must be a boolean value (true or false)."
    );

    // Verify early return prevented network requests
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
      headers: { get: (header) => (header === "content-type" ? "application/json" : null) },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.business.changeMode({ isLive: true });
      throw new Error("Expected changeMode to throw 401 PaymishError");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("Unauthorized");
    }
  });
});

describe("Business Module - getDetails()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve business details (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Record retrieved successfully",
      data: { reference: "PM-REF-12345", status: "success" },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (header) => (header === "content-type" ? "application/json" : null) },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.business.getDetails({ headers: authHeaders });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/user-service/external/v1/get-business-detail",
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
    expect(result.data.reference).toBe("PM-REF-12345");
  });

  test("should throw PaymishError when record is not found (404 Not Found)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Requested record was not found.",
      errors: { reference: ["Check the identifier and merchant context before retrying."] },
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: (header) => (header === "content-type" ? "application/json" : null) },
      json: jest.fn().mockResolvedValueOnce(mockErrorBody),
    });

    try {
      await paymish.business.getDetails();
      throw new Error("Expected getDetails to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Requested record was not found.");
      expect(error.statusCode).toBe(404);
      expect(error.errors).toHaveProperty("reference");
      expect(error.errors.reference).toContain(
        "Check the identifier and merchant context before retrying."
      );
    }
  });
});

describe("Business Module - createBusiness()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a new business (200 OK)", async () => {
    const mockResponseBody = {
      message: "Business created successfully.",
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
      countryId: 1,
      businessName: "24",
      businessCategory: 2,
      businessDescription: "234",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.business.createBusiness(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/user-service/external/v1/add-new-business",
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
      message: "Invalid request payload. Check `countryId` and try again.",
      errors: {
        countryId: ["`countryId` is required."],
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
      // Pass valid types to bypass client-side check so API response triggers PaymishError
      await paymish.business.createBusiness({
        countryId: 0, // Mocking invalid scenario sent to API
        businessName: "Test",
        businessCategory: 1,
      });
      throw new Error("Expected createBusiness to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Invalid request payload. Check `countryId` and try again.");
      expect(error.statusCode).toBe(400);
      expect(error.errors).toHaveProperty("countryId");
      expect(error.errors.countryId).toContain("`countryId` is required.");
    }
  });

  test("should throw early validation error if required fields are missing", async () => {
    await expect(
      paymish.business.createBusiness({
        businessName: "Test",
        businessCategory: 1,
      })
    ).rejects.toThrow(
      "Invalid payload: 'countryId', 'businessName', and 'businessCategory' are required."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("Business Module - listBusinesses()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve list of businesses (200 OK)", async () => {
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
    const result = await paymish.business.listBusinesses({ headers: authHeaders });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/user-service/external/v1/business-list",
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

  test("should throw PaymishError when unauthorized or record not found (401 Unauthorized)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Requested record was not found.",
      errors: {
        reference: ["Check the identifier and merchant context before retrying."],
      },
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
      await paymish.business.listBusinesses();
      throw new Error("Expected listBusinesses to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.message).toBe("Requested record was not found.");
      expect(error.statusCode).toBe(401);
      expect(error.errors).toHaveProperty("reference");
      expect(error.errors.reference).toContain(
        "Check the identifier and merchant context before retrying."
      );
    }
  });
});
