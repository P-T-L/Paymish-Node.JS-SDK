class Transaction {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of transaction documents with required and optional query filters.
   * GET /api/transaction-service/external/v1/list
   *
   * @param {Object} params - Query parameters
   * @param {number} params.businessId - Unique identifier for the business (required)
   * @param {number} params.limit - Number of records to return (required)
   * @param {number} params.page - Current page number (required)
   * @param {string} [params.reference] - Customer reference
   * @param {string} [params.transactionReference] - Transaction reference
   * @param {string} [params.pageId] - Page ID
   * @param {string} [params.status] - Transaction status (completed/fail/initiated/reversed)
   * @param {string} [params.channel] - Transaction channel (NIBSS/CARD/EBILL/NQR/USSD)
   * @param {string} [params.amount] - Transaction amount
   * @param {string} [params.search] - Search string
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getDocuments(params = {}, options = {}) {
    if (
      !params ||
      params.businessId === undefined ||
      params.businessId === null ||
      params.limit === undefined ||
      params.limit === null ||
      params.page === undefined ||
      params.page === null
    ) {
      throw new Error(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve transaction documents."
      );
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/transaction-service/external/v1/list?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Transaction;
