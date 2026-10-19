class Banks {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves the list of banks supported by Paymish.
   * GET /api/transaction-service/external/v1/bank
   *
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing supported banks
   */
  async list(options = {}) {
    return this.client.request("GET", "/api/transaction-service/external/v1/bank", null, options);
  }
}

module.exports = Banks;
