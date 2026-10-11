class Customer {
  /**
   * @param {import ("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new customer record
   * POST /api/customer-service/external/v1/create
   *
   * @param {Object} payload - Customer creation details
   * @param {string} payload.email - Customer's email address (required)
   * @param {string} payload.firstName - Customer's first name (required)
   * @param {string} payload.lastName - Customer's last name (required)
   * @param {string} payload.phoneNumber - Customer's phone number (required)
   * @param {number} payload.countryId - ID of the customer's country (required)
   * @param {number} [payload.dialingCodeId] - ID of the dialing code
   * @param {number} [payload.businessId] - ID of the business associated with the customer
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createCustomer(payload, options = {}) {
    if (
      !payload ||
      !payload.email ||
      !payload.firstName ||
      !payload.lastName ||
      !payload.phoneNumber ||
      payload.countryId == null
    ) {
      throw new Error(
        "Invalid payload: 'email', 'firstName', 'lastName', 'phoneNumber', and 'countryId' are required fields."
      );
    }

    return this.client.request(
      "POST",
      "/api/customer-service/external/v1/create",
      payload,
      options
    );
  }

  /**
   * Updates an existing customer record
   * PUT /api/customer-service/external/v1/customer-update
   *
   * @param {Object} payload - Customer update details
   * @param {string} payload.customerReference - Reference ID for the customer (required)
   * @param {string} [payload.firstName] - Customer's first name
   * @param {string} [payload.lastName] - Customer's last name
   * @param {string} [payload.phoneNumber] - Customer's phone number
   * @param {number} [payload.dialingCodeId] - ID of the dialing code
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateCustomer(payload, options = {}) {
    if (!payload || !payload.customerReference) {
      throw new Error("Invalid payload: 'customerReference' is required to update a customer.");
    }

    return this.client.request(
      "PUT",
      "/api/customer-service/external/v1/customer-update",
      payload,
      options
    );
  }

  /**
   * Retrieves a paginated list of customers
   * GET /api/customer-service/external/v1/list
   *
   * @param {Object} [params] - Query parameters for filtering and pagination (e.g. businessId, page, limit, search)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the customer list
   */
  async listCustomers(params = {}, options = {}) {
    // Merge provided params with default pagination values if omitted
    const queryParams = {
      page: 1,
      limit: 10,
      ...params,
    };
    let endpoint = "/api/customer-service/external/v1/list";
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

module.exports = Customer;
