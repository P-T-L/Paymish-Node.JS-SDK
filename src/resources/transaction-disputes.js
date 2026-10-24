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

  /**
   * Creates a new transaction-level dispute.
   * POST /api/transaction-service/external/v1/disputes
   *
   * @param {Object} [payload] - Optional dispute creation payload
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createDispute(payload = {}, options = {}) {
    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/disputes",
      payload,
      options
    );
  }
}

module.exports = TransactionDisputes;
