class Subscription {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of all subscriptions with optional query filters.
   * GET /api/payment-service/external/v1/subscription/all
   *
   * @param {Object} [params] - Query parameters for pagination and filtering
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of records per page
   * @param {string} [params.name] - Filter subscriptions by name
   * @param {string} [params.status] - Filter subscriptions by status (e.g., active, expired)
   * @param {number} [params.amount] - Filter subscriptions by amount
   * @param {string} [params.expiry_start] - Filter subscriptions expiring after a specific date
   * @param {string} [params.expiry_end] - Filter subscriptions expiring before a specific date
   * @param {string} [params.sort] - Sort subscriptions by a specific field (e.g., createdAt)
   * @param {string} [params.order] - Sort order (asc for ascending, desc for descending)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getAllSubscriptions(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/payment-service/external/v1/subscription/all${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Subscription;
