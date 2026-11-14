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

  /**
   * Fetches billers by biller group ID.
   * GET /api/payment-service/external/v1/utility/billers/group/{groupId}
   *
   * @param {number|string} groupId - The ID of the biller group (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async fetchBillersByGroupId(groupId, options = {}) {
    if (groupId === undefined || groupId === null || groupId === "") {
      throw new Error("Invalid parameter: 'groupId' is required to fetch billers by group ID.");
    }

    const encodedGroupId = encodeURIComponent(String(groupId).trim());
    const endpoint = `/api/payment-service/external/v1/utility/billers/group/${encodedGroupId}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Fetches packages by biller ID.
   * GET /api/payment-service/external/v1/utility/packages/biller/{billerId}
   *
   * @param {number|string} billerId - The ID of the biller (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async fetchPackagesByBillerId(billerId, options = {}) {
    if (billerId === undefined || billerId === null || billerId === "") {
      throw new Error("Invalid parameter: 'billerId' is required to fetch packages by biller ID.");
    }

    const encodedBillerId = encodeURIComponent(String(billerId).trim());
    const endpoint = `/api/payment-service/external/v1/utility/packages/biller/${encodedBillerId}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Performs a customer lookup for utilities.
   * POST /api/payment-service/external/v1/utility/transactions/customer-lookup
   *
   * @param {Object} payload - Customer lookup payload
   * @param {string} [payload.customerId] - Customer ID
   * @param {number} [payload.billerId] - Biller ID
   * @param {string} [payload.productName] - Product name
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async customerLookup(payload = {}, options = {}) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload: payload object is required for customer lookup.");
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/utility/transactions/customer-lookup",
      payload,
      options
    );
  }
}

module.exports = Utility;
