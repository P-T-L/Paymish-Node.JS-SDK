const HttpClient = require("../src/client");

describe("HttpClient Base URL Guard", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test("should throw an error for non-HTTP protocols (e.g. file://)", () => {
    expect(() => {
      new HttpClient({ baseUrl: "file:///etc/passwd" });
    }).toThrow(
      'Invalid baseUrl protocol "file:". Only "http:" and "https:" are allowed.',
    );
  });

  test("should throw an error for completely invalid URLs", () => {
    expect(() => {
      new HttpClient({ baseUrl: "not-a-valid-url" });
    }).toThrow(
      'Invalid baseUrl provided: "not-a-valid-url". Must be a valid URL.',
    );
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
        json: jest
          .fn()
          .mockResolvedValueOnce({ status: "error", message: "Bad Gateway" }),
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
