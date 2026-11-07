class Settlements {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a list of settlements with optional filtering and pagination.
   * GET /api/transaction-service/external/v1/settlements
   *
   * @param {Object} [params] - Optional query parameters
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of results to return per page
   * @param {string} [params.status] - Settlement status (e.g., Paid, Unpaid)
   * @param {string} [params.from] - Settlement date on or after this day (YYYY-MM-DD)
   * @param {string} [params.to] - Settlement date on or before this day (YYYY-MM-DD)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listSettlements(params = {}, options = {}) {
    let queryParams = {};

    if (params !== null && typeof params === "object") {
      queryParams = params;
    }

    const searchParams = new URLSearchParams();
    if (queryParams.page !== undefined && queryParams.page !== null && queryParams.page !== "") {
      searchParams.append("page", String(queryParams.page));
    }
    if (queryParams.limit !== undefined && queryParams.limit !== null && queryParams.limit !== "") {
      searchParams.append("limit", String(queryParams.limit));
    }
    if (
      queryParams.status !== undefined &&
      queryParams.status !== null &&
      queryParams.status !== ""
    ) {
      searchParams.append("status", String(queryParams.status));
    }
    if (queryParams.from !== undefined && queryParams.from !== null && queryParams.from !== "") {
      searchParams.append("from", String(queryParams.from));
    }
    if (queryParams.to !== undefined && queryParams.to !== null && queryParams.to !== "") {
      searchParams.append("to", String(queryParams.to));
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/settlements${queryString ? `?${queryString}` : ""}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves a list of transactions associated with a specific settlement reference.
   * GET /api/transaction-service/external/v1/settlements/{reference}/transactions
   *
   * @param {string|Object} reference - Settlement reference string or options object containing reference
   * @param {string} [reference.reference] - The settlement reference (e.g. PAY_xxx)
   * @param {Object} [params] - Optional query parameters for pagination
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of results to return per page
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listSettlementTransactions(reference, params = {}, options = {}) {
    let settlementRef;

    if (reference !== null && typeof reference === "object") {
      settlementRef = reference.reference;
    } else {
      settlementRef = reference;
    }

    if (settlementRef === undefined || settlementRef === null || settlementRef === "") {
      throw new Error(
        "Invalid parameter: 'reference' is required to list settlement transactions."
      );
    }

    let queryParams = {};
    let reqOptions = options;

    if (params !== null && typeof params === "object") {
      queryParams = params;
    }

    const searchParams = new URLSearchParams();
    if (queryParams.page !== undefined && queryParams.page !== null && queryParams.page !== "") {
      searchParams.append("page", String(queryParams.page));
    }
    if (queryParams.limit !== undefined && queryParams.limit !== null && queryParams.limit !== "") {
      searchParams.append("limit", String(queryParams.limit));
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/settlements/${encodeURIComponent(
      settlementRef
    )}/transactions${queryString ? `?${queryString}` : ""}`;

    return this.client.request("GET", endpoint, null, reqOptions);
  }
}

module.exports = Settlements;
