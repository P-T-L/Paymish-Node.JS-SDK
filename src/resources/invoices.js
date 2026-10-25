class Invoices {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates an invoice
   * POST /api/payment-service/external/v1/invoices
   *
   * @param {Object} payload - Invoice creation payload
   * @param {string} payload.customerEmail - Customer's email address
   * @param {number} payload.amount - Invoice amount
   * @param {string} [payload.note] - Optional invoice note
   * @param {boolean} [payload.sendImmediately] - Defaults to true. When false, invoice is created as Draft and not mailed.
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createInvoice(payload, options = {}) {
    if (
      !payload ||
      !payload.customerEmail ||
      payload.amount === undefined ||
      payload.amount === null
    ) {
      throw new Error(
        "Invalid payload: 'customerEmail' and 'amount' are required to create an invoice."
      );
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/invoices",
      payload,
      options
    );
  }

  /**
   * Retrieves a paginated list of invoices with optional filters.
   * GET /api/payment-service/external/v1/invoices
   *
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.status] - Filter by invoice status
   * @param {string} [params.startDate] - Filter by start date
   * @param {string} [params.endDate] - Filter by end date
   * @param {string} [params.search] - Search by invoice ID or customer name/email
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Number of items per page
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the list of invoices
   */
  async listInvoices(params = {}, options = {}) {
    const queryParams = new URLSearchParams();

    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", params.status);
    }
    if (params.startDate !== undefined && params.startDate !== null) {
      queryParams.append("startDate", params.startDate);
    }
    if (params.endDate !== undefined && params.endDate !== null) {
      queryParams.append("endDate", params.endDate);
    }
    if (params.search !== undefined && params.search !== null) {
      queryParams.append("search", params.search);
    }
    if (params.page !== undefined && params.page !== null) {
      queryParams.append("page", params.page);
    }
    if (params.limit !== undefined && params.limit !== null) {
      queryParams.append("limit", params.limit);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/payment-service/external/v1/invoices?${queryString}`
      : "/api/payment-service/external/v1/invoices";

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Invoices;
