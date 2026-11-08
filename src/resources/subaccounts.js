class Subaccounts {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new subaccount.
   * POST /api/transaction-service/external/v1/subaccounts/
   *
   * @param {Object} payload - Subaccount creation payload
   * @param {string} payload.business_name - Name of the business associated with the subaccount (required)
   * @param {string} payload.account_number - Account number of the subaccount (required)
   * @param {number} payload.percentage_charge - Percentage charge for the subaccount (required)
   * @param {string} payload.currency - Currency code for the subaccount (e.g., NGN) (required)
   * @param {number} payload.bank - Code representing the bank associated with the subaccount (required)
   * @param {string} payload.account_name - Account name of the subaccount (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createSubaccount(payload, options = {}) {
    if (
      !payload ||
      !payload.business_name ||
      !payload.account_number ||
      payload.percentage_charge === undefined ||
      payload.percentage_charge === null ||
      !payload.currency ||
      payload.bank === undefined ||
      payload.bank === null ||
      !payload.account_name
    ) {
      throw new Error(
        "Invalid payload: 'business_name', 'account_number', 'percentage_charge', 'currency', 'bank', and 'account_name' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/subaccounts/",
      payload,
      options
    );
  }
}

module.exports = Subaccounts;
