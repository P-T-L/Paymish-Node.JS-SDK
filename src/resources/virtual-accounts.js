class VirtualAccounts {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a list of virtual accounts.
   * GET /api/transaction-service/external/v1/virtual-accounts
   *
   * @param {Object} [params] - Optional query parameters (e.g. page, limit)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listVirtualAccounts(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/virtual-accounts${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Creates a virtual account.
   * POST /api/transaction-service/external/v1/virtual-accounts
   *
   * @param {Object} payload - Virtual account creation payload
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createVirtualAccount(payload = {}, options = {}) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload: payload object is required to create a virtual account.");
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/virtual-accounts",
      payload,
      options
    );
  }
}

module.exports = VirtualAccounts;
