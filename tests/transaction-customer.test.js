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
