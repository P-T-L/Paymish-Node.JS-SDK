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
}

module.exports = Invoices;
