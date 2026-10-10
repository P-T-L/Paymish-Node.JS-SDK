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
}

module.exports = Customer;
