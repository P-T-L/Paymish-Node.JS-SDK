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

  /**
   * Creates a new subscription.
   * POST /api/payment-service/external/v1/subscription
   *
   * @param {Object} payload - Subscription creation payload
   * @param {number} payload.planId - The ID of the subscription plan (required)
   * @param {string} payload.planName - The name of the subscription plan (required)
   * @param {string} payload.customerId - The ID of the customer subscribing (required)
   * @param {number} payload.amount - The amount charged for the subscription (required)
   * @param {string} payload.nextPaymentDate - The date of the next payment (required)
   * @param {string} payload.startDate - The start date of the subscription (required)
   * @param {string} payload.subscriptionCode - A unique code for the subscription (required)
   * @param {number} payload.paymentCount - The number of payments made so far (required)
   * @param {string} payload.interval - The interval of payments, e.g., monthly, yearly (required)
   * @param {string} payload.status - The status of the subscription, e.g., active, canceled (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createSubscription(payload, options = {}) {
    if (
      !payload ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.planName ||
      !payload.customerId ||
      payload.amount === undefined ||
      payload.amount === null ||
      !payload.nextPaymentDate ||
      !payload.startDate ||
      !payload.subscriptionCode ||
      payload.paymentCount === undefined ||
      payload.paymentCount === null ||
      !payload.interval ||
      !payload.status
    ) {
      throw new Error(
        "Invalid payload: 'planId', 'planName', 'customerId', 'amount', 'nextPaymentDate', 'startDate', 'subscriptionCode', 'paymentCount', 'interval', and 'status' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/subscription",
      payload,
      options
    );
  }

  /**
   * Retrieves a subscription by its unique ID.
   * GET /api/payment-service/external/v1/subscription/{id}
   *
   * @param {number|string|Object} identifier - Subscription ID or options object containing id
   * @param {number|string} [identifier.id] - The ID of the subscription to retrieve
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getSubscriptionById(identifier, options = {}) {
    let subscriptionId;

    if (identifier !== null && typeof identifier === "object") {
      subscriptionId = identifier.id;
    } else {
      subscriptionId = identifier;
    }

    if (subscriptionId === undefined || subscriptionId === null || subscriptionId === "") {
      throw new Error("Invalid parameter: 'id' is required to retrieve a subscription.");
    }

    const endpoint = `/api/payment-service/external/v1/subscription/${encodeURIComponent(
      subscriptionId
    )}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates an existing subscription by ID.
   * PUT /api/payment-service/external/v1/subscription/{id}
   *
   * @param {number|string|Object} identifier - Subscription ID or options object containing id
   * @param {number|string} [identifier.id] - The ID of the subscription to update
   * @param {Object} payload - Update payload containing fields to update
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateSubscription(identifier, payload, options = {}) {
    let subscriptionId;
    let requestPayload = payload;
    let reqOptions = options;

    if (identifier !== null && typeof identifier === "object" && identifier.id !== undefined) {
      subscriptionId = identifier.id;
    } else if (typeof identifier === "number" || typeof identifier === "string") {
      subscriptionId = identifier;
    } else if (identifier !== null && typeof identifier === "object" && payload === undefined) {
      subscriptionId = identifier.id;
      requestPayload = identifier;
    }

    if (subscriptionId === undefined || subscriptionId === null || subscriptionId === "") {
      throw new Error("Invalid parameter: 'id' is required to update a subscription.");
    }

    if (!requestPayload || typeof requestPayload !== "object") {
      throw new Error("Invalid payload: Update payload is required.");
    }

    const endpoint = `/api/payment-service/external/v1/subscription/${encodeURIComponent(
      subscriptionId
    )}`;

    return this.client.request("PUT", endpoint, requestPayload, reqOptions);
  }

  /**
   * Deletes a subscription by its unique ID.
   * DELETE /api/payment-service/external/v1/subscription/{id}
   *
   * @param {number|string|Object} identifier - Subscription ID or options object containing id
   * @param {number|string} [identifier.id] - The ID of the subscription to delete
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async deleteSubscription(identifier, options = {}) {
    let subscriptionId;

    if (identifier !== null && typeof identifier === "object") {
      subscriptionId = identifier.id;
    } else {
      subscriptionId = identifier;
    }

    if (subscriptionId === undefined || subscriptionId === null || subscriptionId === "") {
      throw new Error("Invalid parameter: 'id' is required to delete a subscription.");
    }

    const endpoint = `/api/payment-service/external/v1/subscription/${encodeURIComponent(
      subscriptionId
    )}`;

    return this.client.request("DELETE", endpoint, null, options);
  }
}

module.exports = Subscription;
