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

  /**
   * Retrieves full details for the authenticated business profile
   * GET /api/user-service/external/v1/get-business-detail
   *
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing business details
   */
  async getDetails(options = {}) {
    return this.client.request(
      "GET",
      "/api/user-service/external/v1/get-business-detail",
      null,
      options
    );
  }

  /**
   * Adds a new business profile
   * POST /api/user-service/external/v1/add-new-business
   *
   * @param {Object} payload - Business creation details
   * @param {number} payload.countryId - The country identifier
   * @param {string} payload.businessName - The name of the business
   * @param {number} payload.businessCategory - The business category identifier
   * @param {string} [payload.businessDescription] - Optional business description
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createBusiness(payload, options = {}) {
    if (
      !payload ||
      payload.countryId == null ||
      !payload.businessName ||
      payload.businessCategory == null
    ) {
      throw new Error(
        "Invalid payload: 'countryId', 'businessName', and 'businessCategory' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/user-service/external/v1/add-new-business",
      payload,
      options
    );
  }
}

module.exports = Business;
