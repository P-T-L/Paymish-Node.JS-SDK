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

  /**
   * Retrieves virtual account details by ID.
   * GET /api/transaction-service/external/v1/virtual-accounts/{id}
   *
   * @param {string|number} id - The unique identifier of the virtual account (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getVirtualAccount(id, options = {}) {
    if (id === undefined || id === null || id === "") {
      throw new Error("Invalid parameter: 'id' is required to retrieve a virtual account.");
    }

    const encodedId = encodeURIComponent(String(id).trim());
    const endpoint = `/api/transaction-service/external/v1/virtual-accounts/${encodedId}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates a virtual account by ID.
   * PUT /api/transaction-service/external/v1/virtual-accounts/{id}
   *
   * @param {string|number} id - The unique identifier of the virtual account (required)
   * @param {Object} payload - Update payload
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateVirtualAccount(id, payload = {}, options = {}) {
    if (id === undefined || id === null || id === "") {
      throw new Error("Invalid parameter: 'id' is required to update a virtual account.");
    }

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload: payload object is required to update a virtual account.");
    }

    const encodedId = encodeURIComponent(String(id).trim());
    const endpoint = `/api/transaction-service/external/v1/virtual-accounts/${encodedId}`;

    return this.client.request("PUT", endpoint, payload, options);
  }
}

module.exports = VirtualAccounts;
