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

  /**
   * Retrieves a transaction-level dispute by its ID.
   * GET /api/transaction-service/external/v1/disputes/{id}
   *
   * @param {string|number|Object} disputeId - The dispute ID string/number or object containing id or disputeId
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing dispute details
   */
  async getDisputeById(disputeId, options = {}) {
    const id =
      typeof disputeId === "object" && disputeId !== null
        ? disputeId.disputeId || disputeId.id
        : disputeId;

    if (!id && id !== 0) {
      throw new Error("Invalid parameter: 'disputeId' is required to retrieve dispute details.");
    }

    return this.client.request(
      "GET",
      `/api/transaction-service/external/v1/disputes/${id}`,
      null,
      options
    );
  }
}

module.exports = TransactionDisputes;
