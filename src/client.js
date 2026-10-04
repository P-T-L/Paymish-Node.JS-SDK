const { PaymishError } = require("./errors");

const { randomUUID } = require("crypto");

class HttpClient {
  constructor(options = {}) {
    const rawBaseUrl = options.baseUrl || "https://api.paymish.com";
    this.baseUrl = this._validateAndNormalizeBaseUrl(rawBaseUrl);
    this.timeout = options.timeout || 10000; // Default timeout: 10 seconds
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 500;
  }

  /**
   * Validates and normalizes the provided baseUrl to prevent SSRF and protocol misuse
   * @param {string} urlString
   * @returns {string} Normalized base URL without trailing slashes
   */
  _validateAndNormalizeBaseUrl(urlString) {
    if (typeof urlString !== "string" || !urlString.trim()) {
      throw new Error("Invalid baseUrl: Base URL must be a non-empty string");
    }

    try {
      const parsedUrl = new URL(urlString);

      // Enforce HTTP/HTTPS protocols (blocks file://, ftp://, gopher://, etc.)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error(
          `Invalid baseUrl protocol "${parsedUrl.protocol}". Only "http:" and "https:" are allowed.`
        );
      }

      // Ensure hostname is present
      if (!parsedUrl.hostname) {
        throw new Error("Invalid baseUrl: Missing hostname.");
      }

      // Return clean base URL without trailing slash
      return urlString.replace(/\/+$/, "");
    } catch (error) {
      if (error.message.includes("protocol") || error.message.includes("hostname")) {
        throw error;
      }

      throw new Error(`Invalid baseUrl provided: "${urlString}". Must be a valid URL.`);
    }
  }

  /**
   * Helper method to delay execution for exponential backoff
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper method for all outbound requests
   */
  async request(method, endpoint, body = null, options = {}, customTimeout = null) {
    const url = `${this.baseUrl}${endpoint}`;

    // Handle case where positional parameter 'options' is passed purely as a headers object
    const optionsObj = options || {};
    const isPlainHeadersObj =
      !optionsObj.idempotencyKey && !optionsObj.headers && !optionsObj.customTimeout;
    const requestHeaders = isPlainHeadersObj
      ? { ...optionsObj }
      : { ...(optionsObj.headers || {}) };
    const timeoutMs = customTimeout || optionsObj.customTimeout || this.timeout;

    // Resolve Idempotency Key (Explicit option > Explicit header > Auto-generated for POST/PUT/PATCH)
    const explicitIdempotencyKey =
      optionsObj.idempotencyKey ||
      requestHeaders["Idempotency-Key"] ||
      requestHeaders["idempotency-key"];
    const isStateChanging = ["POST", "PUT", "PATCH"].includes(method.toUpperCase());
    const idempotencyKey =
      explicitIdempotencyKey || (isStateChanging ? `sdk_auto_${randomUUID()}` : null);

    // Prepare Base Headers (Ensuring the same key persists across all retries)
    const finalHeaders = {
      "Content-Type": "application/json",
      ...requestHeaders,
    };

    if (idempotencyKey) {
      finalHeaders["Idempotency-Key"] = idempotencyKey;
    }

    let attempt = 0;

    while (attempt <= this.maxRetries) {
      attempt++;

      const config = {
        method,
        headers: finalHeaders,
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

          // Check if non-JSON response is a retryable 5xx error
          if (response.status >= 500 && attempt <= this.maxRetries) {
            const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
            await this._sleep(delay);
            continue;
          }

          throw new PaymishError(
            `HTML or Non-JSON response received from server (${response.status} ${response.statusText})`,
            response.status,
            { rawResponseBody: rawText.slice(0, 500) },
            body
          );
        }

        // Check if application JSON response is a 5xx error that can be retried
        if (response.status >= 500 && attempt <= this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this._sleep(delay);
          continue;
        }

        // Handle standard client 4xx errors or other unhandled errors
        if (!response.ok || data.status === "error") {
          throw new PaymishError(
            data.message || "An error occurred during the request",
            response.status,
            data.errors || null,
            body
          );
        }

        return data;
      } catch (error) {
        const isTimeout = error.name === "TimeoutError" || error.name === "AbortError";

        // Retry network timeouts if attempts remaining
        if (isTimeout && attempt <= this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await this._sleep(delay);
          continue;
        }

        if (isTimeout) {
          throw new PaymishError(
            `Request timed out after ${timeoutMs} ms`,
            408,
            { timeout: true },
            body
          );
        }

        throw error; // Re-throw if already a PaymishError or non-retryable error
      }
    }
  }
}

module.exports = HttpClient;
