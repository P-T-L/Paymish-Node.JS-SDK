class TransactionCustomer {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of transaction customers
   * GET /api/transaction-service/external/v1/customers
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination (e.g. page, limit, search)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the customer list
   */
  async listCustomers(params = {}, options = {}) {
    let endpoint = "/api/transaction-service/external/v1/customers";

    if (params && Object.keys(params).length > 0) {
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
    }

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Creates a new customer in the transaction service
   * POST /api/transaction-service/external/v1/customers
   *
   * @param {Object} payload - Payload containing customer creation details
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload containing the created customer record
   */
  async createCustomer(payload, options = {}) {
    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to create a transaction customer."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/customers",
      payload,
      options
    );
  }

  /**
   * Retrieves transaction customer details by ID
   * GET /api/transaction-service/external/v1/customers/{id}
   *
   * @param {string|number|Object} identifier - Customer ID or an options object containing id/customerId
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing transaction customer details
   */
  async getCustomerById(identifier, options = {}) {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? identifier.id || identifier.customerId
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error("Invalid parameter: 'customerId' (or 'id') is required.");
    }

    const endpoint = `/api/transaction-service/external/v1/customers/${encodeURIComponent(customerId)}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates an existing transaction customer by ID
   * PUT /api/transaction-service/external/v1/customers/{id}
   *
   * @param {string|number|Object} identifier - Customer ID or options object containing id/customerId
   * @param {Object} payload - Payload containing updated customer details
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateCustomer(identifier, payload, options = {}) {
    const customerId =
      typeof identifier === "object" && identifier !== null
        ? identifier.id || identifier.customerId
        : identifier;

    if (customerId == null || customerId === "") {
      throw new Error(
        "Invalid parameter: 'customerId' (or 'id') is required to update a customer."
      );
    }

    if (!payload || typeof payload !== "object") {
      throw new Error(
        "Invalid payload: A valid payload object is required to update a transaction customer."
      );
    }

    const endpoint = `/api/transaction-service/external/v1/customers/${encodeURIComponent(customerId)}`;

    return this.client.request("PUT", endpoint, payload, options);
  }
}

module.exports = TransactionCustomer;
