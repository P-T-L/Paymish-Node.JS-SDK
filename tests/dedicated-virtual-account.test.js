const Paymish = require("..");
const { PaymishError } = require("../src/errors");

describe("DedicatedVirtualAccount Module - createAccount()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a dedicated virtual account (200 OK / 201 Created)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Dedicated virtual account created successfully",
      data: {
        accountNumber: "1234567890",
        accountName: "John Doe - Paymish",
        bankName: "Test Bank",
      },
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
      customerId: "tx_cust_123",
      preferredBank: "test-bank",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.dedicatedVirtualAccount.createAccount(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts",
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

  test("should throw early validation error if payload is missing or not an object", async () => {
    await expect(paymish.dedicatedVirtualAccount.createAccount(null)).rejects.toThrow(
      "Invalid payload: A valid payload object is required to create a dedicated virtual account."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when server responds with 400 Bad Request", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Validation failed for account creation.",
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
      await paymish.dedicatedVirtualAccount.createAccount({ customerId: "" });
      throw new Error("Expected createAccount to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed for account creation.");
    }
  });
});

describe("DedicatedVirtualAccount Module - listAccounts()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve accounts with default page and limit (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Accounts retrieved successfully",
      data: { accounts: [] },
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
    const result = await paymish.dedicatedVirtualAccount.listAccounts(
      {},
      {
        headers: authHeaders,
      }
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts?page=1&limit=10",
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

  test("should allow developer parameters to override default pagination", async () => {
    const mockResponseBody = { status: "success", data: { accounts: [{ accountNumber: "123" }] } };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const result = await paymish.dedicatedVirtualAccount.listAccounts({ page: 2, limit: 25 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts?page=2&limit=25",
      expect.objectContaining({ method: "GET" })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw PaymishError when server responds with 400 Bad Request", async () => {
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
      await paymish.dedicatedVirtualAccount.listAccounts({ page: -1 });
      throw new Error("Expected listAccounts to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid query parameters.");
    }
  });
});

describe("DedicatedVirtualAccount Module - getAccountByCustomerId()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully retrieve account details by direct customer ID (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Virtual account retrieved successfully",
      data: { accountNumber: "1234567890", customerId: "tx_cust_123" },
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
    const result = await paymish.dedicatedVirtualAccount.getAccountByCustomerId("tx_cust_123", {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts/tx_cust_123",
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

  test("should support passing an object payload containing customerId", async () => {
    const mockResponseBody = { status: "success", data: { accountNumber: "9876543210" } };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const result = await paymish.dedicatedVirtualAccount.getAccountByCustomerId({
      customerId: "tx_cust_456",
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts/tx_cust_456",
      expect.objectContaining({ method: "GET" })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if customerId is missing or empty", async () => {
    await expect(paymish.dedicatedVirtualAccount.getAccountByCustomerId()).rejects.toThrow(
      "Invalid parameter: 'customerId' is required to retrieve a dedicated virtual account."
    );

    await expect(paymish.dedicatedVirtualAccount.getAccountByCustomerId("")).rejects.toThrow(
      "Invalid parameter: 'customerId' is required to retrieve a dedicated virtual account."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when account is not found (404 Not Found)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Virtual account not found.",
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
      await paymish.dedicatedVirtualAccount.getAccountByCustomerId("non_existent");
      throw new Error("Expected getAccountByCustomerId to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Virtual account not found.");
    }
  });
});

describe("DedicatedVirtualAccount Module - updateAccountByCustomerId()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully update virtual account details by customer ID (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Virtual account updated successfully",
      data: { customerId: "tx_cust_123", status: "updated" },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = { accountName: "John Updated" };
    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };

    const result = await paymish.dedicatedVirtualAccount.updateAccountByCustomerId(
      "tx_cust_123",
      payload,
      { headers: authHeaders }
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts/tx_cust_123",
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

  test("should support passing an object identifier containing customerId", async () => {
    const mockResponseBody = { status: "success", message: "Account updated" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const payload = { preferredBank: "new-bank" };
    const result = await paymish.dedicatedVirtualAccount.updateAccountByCustomerId(
      { customerId: "tx_cust_456" },
      payload
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts/tx_cust_456",
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
      paymish.dedicatedVirtualAccount.updateAccountByCustomerId("", { name: "Test" })
    ).rejects.toThrow(
      "Invalid parameter: 'customerId' is required to update a dedicated virtual account."
    );

    // Missing payload
    await expect(
      paymish.dedicatedVirtualAccount.updateAccountByCustomerId("tx_cust_123", null)
    ).rejects.toThrow(
      "Invalid payload: A valid payload object is required to update a dedicated virtual account."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when server responds with 404 Not Found", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Virtual account not found.",
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
      await paymish.dedicatedVirtualAccount.updateAccountByCustomerId("non_existent", {
        name: "Test",
      });
      throw new Error(
        "Expected updateAccountByCustomerId to throw PaymishError, but it succeeded."
      );
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Virtual account not found.");
    }
  });
});

describe("DedicatedVirtualAccount Module - requeryAccount()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully requery virtual account with required and optional query parameters (200 OK)", async () => {
    const mockResponseBody = {
      status: "success",
      message: "Virtual account requery successful",
      data: { accountNumber: "1234567890", status: "ACTIVE" },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: (header) => (header === "content-type" ? "application/json" : null),
      },
      json: jest.fn().mockResolvedValueOnce(mockResponseBody),
    });

    const queryParams = {
      account_number: "1234567890",
      provider_slug: "test-provider",
      date: "2026-10-17",
    };
    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };

    const result = await paymish.dedicatedVirtualAccount.requeryAccount(queryParams, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/transaction-service/external/v1/dedicated-virtual-accounts/requery?account_number=1234567890&provider_slug=test-provider&date=2026-10-17",
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

  test("should throw early validation error if required query parameters are missing", async () => {
    // Missing provider_slug
    await expect(
      paymish.dedicatedVirtualAccount.requeryAccount({ account_number: "1234567890" })
    ).rejects.toThrow(
      "Invalid parameters: 'account_number' and 'provider_slug' are required query parameters."
    );

    // Missing account_number
    await expect(
      paymish.dedicatedVirtualAccount.requeryAccount({ provider_slug: "test-provider" })
    ).rejects.toThrow(
      "Invalid parameters: 'account_number' and 'provider_slug' are required query parameters."
    );

    // Completely empty parameters object
    await expect(paymish.dedicatedVirtualAccount.requeryAccount({})).rejects.toThrow(
      "Invalid parameters: 'account_number' and 'provider_slug' are required query parameters."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should throw PaymishError when requery fails (400 Bad Request)", async () => {
    const mockErrorBody = {
      status: "error",
      message: "Invalid account number or provider slug provided.",
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
      await paymish.dedicatedVirtualAccount.requeryAccount({
        account_number: "invalid",
        provider_slug: "invalid-provider",
      });
      throw new Error("Expected requeryAccount to throw PaymishError, but it succeeded.");
    } catch (error) {
      expect(error).toBeInstanceOf(PaymishError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid account number or provider slug provided.");
    }
  });
});
