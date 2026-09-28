const { PaymishError } = require("./errors");

class HttpClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "https://api.paymish.com";
  }

  // Helper method for all outbound HTTP requests
  async request(method, endpoint, body = null, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      method,
      headers: { "Content-Type": "application/json", ...headers },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

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
  }
}

module.exports = HttpClient;
