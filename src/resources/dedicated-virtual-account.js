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
}

module.exports = DedicatedVirtualAccount;
