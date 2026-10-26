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

  /**
   * Creates a new payment page.
   * POST /api/payment-service/external/v1/payment-pages/create-pages
   *
   * @param {Object|FormData} payload - Payment page creation payload or FormData instance
   * @param {number} [payload.businessId] - The ID of the business
   * @param {string} [payload.pageName] - The name of the payment page
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createPaymentPage(payload, options = {}) {
    let formData = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.businessId === undefined ||
        payload.businessId === null ||
        !payload.pageName
      ) {
        throw new Error(
          "Invalid payload: 'businessId' and 'pageName' are required to create a payment page."
        );
      }

      formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, value);
          }
        }
      }
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/create-pages",
      formData,
      options
    );
  }
}

module.exports = PaymentPages;
