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

  /**
   * Retrieves a dedicated virtual account by customer ID
   * GET /api/transaction-service/external/v1/dedicated-virtual-accounts/{customerId}
   *
   * @param {string|number|Object} identifier - Customer ID or options object containing customerId/id
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the virtual account details
   */
  async getAccountByCustomerId(identifier, options = {}) {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? identifier.customerId || identifier.id
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error(
        "Invalid parameter: 'customerId' is required to retrieve a dedicated virtual account."
      );
    }

    const endpoint = `/api/transaction-service/external/v1/dedicated-virtual-accounts/${encodeURIComponent(customerId)}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates a dedicated virtual account by customer ID
   * PUT /api/transaction-service/external/v1/dedicated-virtual-accounts/{customerId}
   *
   * @param {string|number|Object} identifier - Customer ID or options object containing customerId/id
   * @param {Object} payload - Payload containing updated account details
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateAccountByCustomerId(identifier, payload, options = {}) {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? identifier.customerId || identifier.id
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error(
        "Invalid parameter: 'customerId' is required to update a dedicated virtual account."
      );
    }

    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to update a dedicated virtual account."
      );
    }

    const endpoint = `/api/transaction-service/external/v1/dedicated-virtual-accounts/${encodeURIComponent(customerId)}`;

    return this.client.request("PUT", endpoint, payload, options);
  }

  /**
   * Requeries the status of a dedicated virtual account
   * GET /api/transaction-service/external/v1/dedicated-virtual-accounts/requery
   *
   * @param {Object} params - Query parameters for requerying (account_number and provider_slug are required)
   * @param {string} params.account_number - The account number to requery
   * @param {string} params.provider_slug - The bank provider slug (e.g. gtb, zenith, wema-bank)
   * @param {string} [params.date] - Optional date filter
   * @param {Object} [options] Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing requery results
   */
  async requeryAccount(params = {}, options = {}) {
    if (!params || !params.account_number || !params.provider_slug) {
      throw new Error(
        "Invalid parameters: 'account_number' and 'provider_slug' are required query parameters."
      );
    }

    let endpoint = "/api/transaction-service/external/v1/dedicated-virtual-accounts/requery";
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
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

  /**
   * Assigns a dedicated virtual account
   * POST /api/transaction-service/external/v1/dedicated-virtual-accounts/assign
   *
   * @param {Object} payload - Payload containing account assignment details
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async assignAccount(payload, options = {}) {
    if (!payload || !payload.first_name || !payload.last_name || !payload.email || !payload.phone) {
      throw new Error(
        "Invalid payload: 'email', 'first_name', 'last_name', and 'phone' are required fields."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/dedicated-virtual-accounts/assign",
      payload,
      options
    );
  }
}

module.exports = DedicatedVirtualAccount;
