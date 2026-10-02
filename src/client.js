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
      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new PaymishError(
          data.message || "An error occurred during the request",
          response.status,
          data.errors || null,
        );
      }

      return data;
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        throw new PaymishError(`Request timed out after ${timeoutMs} ms`, 408, {
          timeout: true,
        });
      }

      throw error;
    }
  }
}

module.exports = HttpClient;
