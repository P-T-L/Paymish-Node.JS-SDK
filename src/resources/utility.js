class Utility {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Fetches biller groups.
   * GET /api/payment-service/external/v1/utility/biller-groups
   *
   * @param {Object} [params] - Optional query parameters
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async fetchBillerGroups(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/payment-service/external/v1/utility/biller-groups${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Utility;
