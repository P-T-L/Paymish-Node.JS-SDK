class PaymentPages {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Check if a custom payment page link exists.
   * POST /api/payment-service/external/v1/payment-pages/custom-link-check-exist
   *
   * @param {Object} payload - Payload containing customLink
   * @param {string} payload.customLink - The custom link to check for its existence
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async checkCustomLinkExists(payload, options = {}) {
    if (!payload || !payload.customLink) {
      throw new Error(
        "Invalid payload: 'customLink' is required to check if a custom link exists."
      );
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/custom-link-check-exist",
      payload,
      options
    );
  }
}

module.exports = PaymentPages;
