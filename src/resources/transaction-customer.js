class TransactionCustomer {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of transaction customers
   * GET /api/transaction-service/external/v1/customers
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination (e.g. page, limit, search)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the customer list
   */
  async listCustomers(params = {}, options = {}) {
    let endpoint = "/api/transaction-service/external/v1/customers";

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = TransactionCustomer;
