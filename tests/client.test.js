const HttpClient = require("../src/client");

describe("HttpClient Base URL Guard", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test("should throw an error for non-HTTP protocols (e.g. file://)", () => {
    expect(() => {
      new HttpClient({ baseUrl: "file:///etc/passwd" });
    }).toThrow('Invalid baseUrl protocol "file:". Only "http:" and "https:" are allowed.');
  });

  test("should throw an error for completely invalid URLs", () => {
    expect(() => {
      new HttpClient({ baseUrl: "not-a-valid-url" });
    }).toThrow('Invalid baseUrl provided: "not-a-valid-url". Must be a valid URL.');
  });

  test("should accept valid HTTPS and HTTP URLs and trim trailing slashes", () => {
    const client = new HttpClient({
      baseUrl: "https://sandbox-api.paymish.com/",
    });
    expect(client.baseUrl).toBe("https://sandbox-api.paymish.com");
  });

  test("should retry on 502 Bad Gateway and succeed on second attempt", async () => {
    const client = new HttpClient({ maxRetries: 2, retryDelayMs: 10 });
    const mockSuccessResponseBody = {
      status: "success",
      data: { token: "retry_success_token" },
    };

    // Mock first call failing with 502, second call succeeding with 200
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValueOnce({ status: "error", message: "Bad Gateway" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValueOnce(mockSuccessResponseBody),
      });

    const response = await client.request("POST", "/api/test");

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response).toEqual(mockSuccessResponseBody);
  });
});

describe("HttpClient Idempotency Key Support", () => {
  let client;

  beforeEach(() => {
    global.fetch = jest.fn();
    client = new HttpClient({
      baseUrl: "https://sandbox-api.paymish.com",
      maxRetries: 2,
      retryDelayMs: 1,
    });

    if (jest.isMockFunction(client._sleep)) {
      client._sleep.mockResolvedValue(undefined);
    } else {
      jest.spyOn(client, "_sleep").mockResolvedValue(undefined);
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should use explicitly provided idempotencyKey in options", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "success", data: {} }),
    });

    await client.request(
      "POST",
      "/v1/payments",
      { amount: 5000 },
      { idempotencyKey: "custom_key_123" }
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toBe("custom_key_123");
  });

  test("should accept explicit Idempotency-Key passed inside headers object", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "success", data: {} }),
    });

    await client.request(
      "POST",
      "/v1/payments",
      { amount: 5000 },
      { headers: { "Idempotency-Key": "header_key_456" } }
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toBe("header_key_456");
  });

  test("should auto-generate an idempotency key for POST requests when none provided", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "success", data: {} }),
    });

    await client.request("POST", "/v1/payments", { amount: 5000 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toMatch(/^sdk_auto_[a-f0-9-]+$/i);
  });

  test("should auto-generate an idempotency key for PUT and PATCH requests", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValueOnce({ status: "success" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValueOnce({ status: "success" }),
      });

    await client.request("PUT", "/v1/users/123", { name: "Alice" });
    await client.request("PATCH", "/v1/users/123", { status: "active" });

    const [, putConfig] = global.fetch.mock.calls[0];
    const [, patchConfig] = global.fetch.mock.calls[1];

    expect(putConfig.headers["Idempotency-Key"]).toMatch(/^sdk_auto_/);
    expect(patchConfig.headers["Idempotency-Key"]).toMatch(/^sdk_auto_/);
  });

  test("should NOT attach an Idempotency-Key for GET requests", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "success", data: [] }),
    });

    await client.request("GET", "/v1/payments");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, config] = global.fetch.mock.calls[0];
    expect(config.headers["Idempotency-Key"]).toBeUndefined();
  });

  test("should preserve the SAME explicit idempotency key across retry attempts on 500 error", async () => {
    // Attempt 1: 500 Error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "error", message: "Server error" }),
    });

    // Attempt 2: 200 Success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "success" }),
    });

    await client.request(
      "POST",
      "/v1/transfers",
      { amount: 1000 },
      { idempotencyKey: "fixed_retry_key_789" }
    );

    expect(global.fetch).toHaveBeenCalledTimes(2);

    const [, attempt1Config] = global.fetch.mock.calls[0];
    const [, attempt2Config] = global.fetch.mock.calls[1];

    expect(attempt1Config.headers["Idempotency-Key"]).toBe("fixed_retry_key_789");
    expect(attempt2Config.headers["Idempotency-Key"]).toBe("fixed_retry_key_789");
  });

  test("should preserve the SAME auto-generated idempotency key across network timeout retries", async () => {
    const timeoutError = new Error("Request timed out");
    timeoutError.name = "TimeoutError";

    // Attempt 1: Timeout error
    global.fetch.mockRejectedValueOnce(timeoutError);

    // Attempt 2: 200 Success
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValueOnce({ status: "success" }),
      text: jest.fn().mockResolvedValueOnce('{"status": "success"}'),
    });

    await client.request("POST", "/v1/refunds", { transaction_id: "tx_123" });

    expect(global.fetch).toHaveBeenCalledTimes(2);

    const [, attempt1Config] = global.fetch.mock.calls[0];
    const [, attempt2Config] = global.fetch.mock.calls[1];

    const generatedKey = attempt1Config.headers["Idempotency-Key"];

    expect(generatedKey).toMatch(/^sdk_auto_/);
    expect(attempt2Config.headers["Idempotency-Key"]).toBe(generatedKey);
  });
});
