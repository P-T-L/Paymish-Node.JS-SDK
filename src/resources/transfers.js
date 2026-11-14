class Transfers {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a list of transfers.
   * GET /api/transaction-service/external/v1/get-transfer-list
   *
   * @param {Object} [params] - Optional query parameters
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listTransfers(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/get-transfer-list${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves a list of recipients.
   * GET /api/transaction-service/external/v1/get-recipient-list
   *
   * @param {Object} [params] - Optional query parameters
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listRecipients(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/get-recipient-list${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Transfers;
