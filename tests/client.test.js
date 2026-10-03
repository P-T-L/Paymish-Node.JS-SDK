const HttpClient = require("../src/client");

describe("HttpClient Base URL Guard", () => {
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
});
