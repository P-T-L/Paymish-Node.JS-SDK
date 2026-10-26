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

  /**
   * Retrieves a paginated list of payment pages with optional filters.
   * GET /api/payment-service/external/v1/payment-pages/get-pages
   *
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.status] - Status of the pages (Published/Unpublished)
   * @param {string} [params.searchPageText] - Text to search within page content or title
   * @param {string} [params.startDate] - Filter pages created after this start date
   * @param {string} [params.endDate] - Filter pages created before this end date
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of records per page
   * @param {string} [params.sort] - Sorting criteria on created date (e.g. "DESC", "ASC")
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the list of payment pages
   */
  async getPaymentPages(params = {}, options = {}) {
    const queryParams = new URLSearchParams();

    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", params.status);
    }
    if (params.searchPageText !== undefined && params.searchPageText !== null) {
      queryParams.append("searchPageText", params.searchPageText);
    }
    if (params.startDate !== undefined && params.startDate !== null) {
      queryParams.append("startDate", params.startDate);
    }
    if (params.endDate !== undefined && params.endDate !== null) {
      queryParams.append("endDate", params.endDate);
    }
    if (params.page !== undefined && params.page !== null) {
      queryParams.append("page", params.page);
    }
    if (params.limit !== undefined && params.limit !== null) {
      queryParams.append("limit", params.limit);
    }
    if (params.sort !== undefined && params.sort !== null) {
      queryParams.append("sort", params.sort);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/payment-service/external/v1/payment-pages/get-pages?${queryString}`
      : "/api/payment-service/external/v1/payment-pages/get-pages";

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = PaymentPages;
