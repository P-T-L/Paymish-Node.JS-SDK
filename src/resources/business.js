class Business {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Changes the mode (live or not live) of the business
   * POST /api/user-service/external/v1/change-business-mode
   *
   * @param {Object|boolean} payload - Object containing {isLive: boolean} or directly a boolean value
   * @param {boolean} [payload.isLive] - Set to true for Live mode, false for `not Live` mode
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async changeMode(payload, options = {}) {
    const isLive = typeof payload === "boolean" ? payload : payload?.isLive;

    if (typeof isLive !== "boolean") {
      throw new Error("Invalid payload: 'isLive' must be a boolean value (true or false).");
    }

    return this.client.request(
      "POST",
      "/api/user-service/external/v1/change-business-mode",
      { isLive },
      options
    );
  }
}

module.exports = Business;
