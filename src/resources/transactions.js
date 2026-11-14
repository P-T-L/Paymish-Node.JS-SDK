class Transactions {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Verifies a transaction by its reference.
   * GET /api/transaction-service/external/v1/verify/{reference}
   *
   * @param {string} reference - The transaction reference (required)
   * @param {Object} [options] - Optional request overrides
   * @returns {Promise<Object>} API response payload
   */
  async verifyTransaction(reference, options = {}) {
    if (!reference || typeof reference !== "string" || reference.trim() === "") {
      throw new Error(
        "Invalid parameter: 'reference' is required as a non-empty string to verify a transaction."
      );
    }

    return this.client.request(
      "GET",
      `/api/transaction-service/external/v1/verify/${encodeURIComponent(reference)}`,
      null,
      options
    );
  }
}

module.exports = Transactions;
