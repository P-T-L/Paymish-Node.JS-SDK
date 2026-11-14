class Transactions {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Verifies a transaction by its reference.
   * GET /api/transaction-service/external/v1/verify/{reference}
   *
   * @param {string} reference - The transaction reference (required)
   * @param {Object} [options] - Optional request overrides
   * @returns {Promise<Object>} API response payload
   */
  async verifyTransaction(reference, options = {}) {
    if (!reference || typeof reference !== "string" || reference.trim() === "") {
      throw new Error(
        "Invalid parameter: 'reference' is required as a non-empty string to verify a transaction."
      );
    }

    return this.client.request(
      "GET",
      `/api/transaction-service/external/v1/verify/${encodeURIComponent(reference)}`,
      null,
      options
    );
  }

  /**
   * Retrieves transaction statistics.
   * GET /api/transaction-service/external/v1/listStatistics
   *
   * @param {Object} [params] - Optional query parameters
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getTransactionStatistics(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/listStatistics${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Exports transactions as a CSV list.
   * GET /api/transaction-service/external/v1/csv-list
   *
   * @param {Object} [params] - Optional query parameters (e.g. businessId, from, to, status)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async exportTransactionsCsv(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/csv-list${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Lists PayPlus banks.
   * GET /api/transaction-service/external/v1/bank-list-payplus
   *
   * @param {Object} [params] - Optional query parameters
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listPayPlusBanks(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/bank-list-payplus${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Fetches a transaction by its ID.
   * GET /api/transaction-service/external/v1/fetch/{id}
   *
   * @param {number|string} id - ID for the transaction to fetch (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async fetchTransaction(id, options = {}) {
    if (id === undefined || id === null || id === "") {
      throw new Error("Invalid parameter: 'id' is required to fetch a transaction.");
    }

    const encodedId = encodeURIComponent(String(id).trim());
    const endpoint = `/api/transaction-service/external/v1/fetch/${encodedId}`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Transactions;
