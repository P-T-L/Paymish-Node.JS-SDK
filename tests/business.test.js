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
