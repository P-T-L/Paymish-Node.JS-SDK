const { PaymishError } = require("./errors");

class HttpClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "https://api.paymish.com";
    this.timeout = options.timeout || 10000; // Default timeout: 10 seconds
  }

  /**
   * Helper method for all outbound requests
   */
  async request(
    method,
    endpoint,
    body = null,
    headers = {},
    customTimeout = null,
  ) {
    const url = `${this.baseUrl}${endpoint}`;
    const timeoutMs = customTimeout || this.timeout;

    const config = {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      signal: AbortSignal.timeout(timeoutMs),
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers?.get?.("content-type") || "";
      const isJson = contentType.includes("application/json");

      let data;

      if (isJson) {
        data = await response.json();
      } else {
        // Fallback for non-JSON content (HTML/plain text error pages from WAF or proxies)
        const rawText = await response.text();

        if (!response.ok) {
          throw new PaymishError(
            `HTML or Non-JSON response received from server (${response.status} ${response.statusText})`,
            response.status,
            { rawResponseBody: rawText.slice(0, 500) },
            body,
          );
        }

        throw new PaymishError(
          "Unexpected non-JSON response payload received from API server.",
          response.status,
          { rawResponseBody: rawText.slice(0, 500) },
          body,
        );
      }

      // Handle standard Paymish API application errors
      if (!response.ok || data.status === "error") {
        throw new PaymishError(
          data.message || "An error occurred during the request",
          response.status,
          data.errors || null,
          body,
        );
      }

      return data;
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        throw new PaymishError(
          `Request timed out after ${timeoutMs} ms`,
          408,
          { timeout: true },
          body,
        );
      }

      throw error; // Re-throw if already a PaymishError
    }
  }
}

module.exports = HttpClient;
