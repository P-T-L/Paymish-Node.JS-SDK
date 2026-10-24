class TransactionDisputes {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves the list of transaction-level disputes.
   * GET /api/transaction-service/external/v1/disputes
   *
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the list of transaction disputes
   */
  async listDisputes(options = {}) {
    return this.client.request(
      "GET",
      "/api/transaction-service/external/v1/disputes",
      null,
      options
    );
  }
}

module.exports = TransactionDisputes;
