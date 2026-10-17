class DedicatedVirtualAccount {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new dedicated virtual account
   * POST /api/transaction-service/external/v1/dedicated-virtual-accounts
   *
   * @param {Object} payload - Payload containing account creation details
   * @param {Object} [options] - Optional per-request configuration overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload containing created account details
   */
  async createAccount(payload, options = {}) {
    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to create a dedicated virtual account."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/dedicated-virtual-accounts",
      payload,
      options
    );
  }

  /**
   * Retrieves a paginated list of dedicated virtual accounts
   * GET /api/transaction-service/external/v1/dedicated-virtual-accounts
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination (e.g. page, limit, search)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the accounts list
   */
  async listAccounts(params = {}, options = {}) {
    const queryParams = { page: 1, limit: 10, ...params };
    let endpoint = "/api/transaction-service/external/v1/dedicated-virtual-accounts";
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }

    const queryString = searchParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = DedicatedVirtualAccount;
