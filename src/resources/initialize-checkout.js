class InitializeCheckout {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Initializes a transaction.
   * POST /api/transaction-service/external/v1/transaction-initialize
   *
   * @param {Object} payload - Initialization details
   * @param {string} payload.email - Customer's email address
   * @param {string|number} payload.amount - Amount in currency subunits (e.g. kobo/cents)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async initializeTransaction(payload, options = {}) {
    if (!payload || !payload.email || payload.amount === undefined || payload.amount === null) {
      throw new Error(
        "Invalid payload: 'email' and 'amount' are required to initialize a transaction."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-initialize",
      payload,
      options
    );
  }

  /**
   * Initializes a transaction with a Dynamic Virtual Account (DVA).
   * POST /api/transaction-service/external/v1/transaction-initialize/dva
   *
   * @param {Object} payload - Initialization details
   * @param {string} payload.email - Customer's email address
   * @param {string|number} payload.amount - Amount in currency subunits (e.g. kobo/cents)
   * @param {string} [payload.reference] - Optional unique reference for this transaction
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload containing virtual account details
   */
  async initializeDva(payload, options = {}) {
    if (!payload || !payload.email || payload.amount === undefined || payload.amount === null) {
      throw new Error(
        "Invalid payload: 'email' and 'amount' are required to initialize a DVA transaction."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-initialize/dva",
      payload,
      options
    );
  }
}

module.exports = InitializeCheckout;
