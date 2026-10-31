class Plans {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new payment plan.
   * POST /api/payment-service/external/v1/plans/create-plan
   *
   * @param {Object} payload - Plan creation payload
   * @param {number} payload.businessId - ID of the business
   * @param {string} payload.planName - Name of the plan
   * @param {string} payload.planDescription - Description of the plan
   * @param {number} payload.planAmount - Amount for the plan
   * @param {string} payload.interval - Interval of the plan (e.g. monthly, yearly)
   * @param {number} payload.maxNoOfPayment - Maximum number of payments allowed
   * @param {boolean} payload.isSubscriptionPageForThisPlan - Indicates if subscription page exists
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */ async createPlan(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      !payload.planName ||
      !payload.planDescription ||
      payload.planAmount === undefined ||
      payload.planAmount === null ||
      !payload.interval ||
      payload.maxNoOfPayment === undefined ||
      payload.maxNoOfPayment === null ||
      payload.isSubscriptionPageForThisPlan === undefined ||
      payload.isSubscriptionPageForThisPlan === null
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'planName', 'planDescription', 'planAmount', 'interval', 'maxNoOfPayment', and 'isSubscriptionPageForThisPlan' are required."
      );
    }

    const requestPayload = {
      businessId: payload.businessId,
      planName: payload.planName,
      planDescription: payload.planDescription,
      planAmount: payload.planAmount,
      interval: payload.interval,
      maxNoOfPayment: payload.maxNoOfPayment,
      isSubscriptionPageForThisPlan: payload.isSubscriptionPageForThisPlan,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/plans/create-plan",
      requestPayload,
      options
    );
  }

  /**
   * Retrieves a paginated list of payment plans with optional filters.
   * GET /api/payment-service/external/v1/plans/get-plans
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination
   * @param {string} [params.status] - Status filter (Active/Archived/Deleted)
   * @param {string} [params.interval] - Interval filter (Daily/Weekly/Monthly/Quarterly/Biannually/Annually)
   * @param {number} [params.noOfSubscriptions] - Number of subscriptions filter
   * @param {string} [params.noOfSubscriptionType] - Number of subscription type (moreThan/lessThan/equals)
   * @param {number} [params.amount] - Amount filter
   * @param {string} [params.amountType] - Amount type (moreThan/lessThan/equals)
   * @param {number} [params.revenueAmount] - Revenue amount filter
   * @param {string} [params.revenueType] - Revenue amount type (moreThan/lessThan/equals)
   * @param {string} [params.searchPlanText] - Search plan text
   * @param {string} [params.startDate] - Start date filter (YYYY-MM-DD)
   * @param {string} [params.endDate] - End date filter (YYYY-MM-DD)
   * @param {number} [params.limit] - Number of items per page
   * @param {number} [params.page] - Page number
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getPlans(params = {}, options = {}) {
    let endpoint = "/api/payment-service/external/v1/plans/get-plans";

    if (params && typeof params === "object" && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves detailed information for a specific payment plan.
   * GET /api/payment-service/external/v1/plans/get-plan-details
   *
   * @param {Object|number|string} identifier - Plan ID or options object containing planId
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getPlanDetails(identifier, options = {}) {
    let planId;

    if (identifier !== null && typeof identifier === "object") {
      planId = identifier.planId !== undefined ? identifier.planId : identifier.id;
    } else {
      planId = identifier;
    }

    if (planId === undefined || planId === null || planId === "") {
      throw new Error("Invalid parameter: 'planId' is required to retrieve plan details.");
    }

    const endpoint = `/api/payment-service/external/v1/plans/get-plan-details?planId=${encodeURIComponent(planId)}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates details for an existing payment plan.
   * PUT /api/payment-service/external/v1/plans/update-plan-details
   *
   * @param {Object} payload - Update plan details payload
   * @param {number} payload.planId - The ID of the plan to update
   * @param {string} payload.planName - The name of the plan
   * @param {string} payload.planDescription - A description of the plan
   * @param {number} payload.planAmount - The amount for the plan
   * @param {string} payload.interval - Interval of the plan (e.g., Daily, Weekly, Monthly)
   * @param {number} payload.maxNoOfPayment - Maximum number of payments allowed for the plan
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updatePlanDetails(payload, options = {}) {
    if (
      !payload ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.planName ||
      !payload.planDescription ||
      payload.planAmount === undefined ||
      payload.planAmount === null ||
      !payload.interval ||
      payload.maxNoOfPayment === undefined ||
      payload.maxNoOfPayment === null
    ) {
      throw new Error(
        "Invalid payload: 'planId', 'planName', 'planDescription', 'planAmount', 'interval', and 'maxNoOfPayment' are required."
      );
    }

    const requestPayload = {
      planId: payload.planId,
      planName: payload.planName,
      planDescription: payload.planDescription,
      planAmount: payload.planAmount,
      interval: payload.interval,
      maxNoOfPayment: payload.maxNoOfPayment,
    };

    return this.client.request(
      "PUT",
      "/api/payment-service/external/v1/plans/update-plan-details",
      requestPayload,
      options
    );
  }

  /**
   * Deletes or updates the status of an existing payment plan.
   * POST /api/payment-service/external/v1/plans/delete-plan
   *
   * @param {Object} payload - Delete plan payload
   * @param {number} payload.planId - The ID of the plan
   * @param {string} payload.status - The plan status action
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async deletePlan(payload, options = {}) {
    if (!payload || payload.planId === undefined || payload.planId === null || !payload.status) {
      throw new Error("Invalid payload: 'planId' and 'status' are required.");
    }

    const requestPayload = {
      planId: payload.planId,
      status: payload.status,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/plans/delete-plan",
      requestPayload,
      options
    );
  }

  /**
   * Retrieves a list of payment plans via the transaction service.
   * GET /api/transaction-service/external/v1/plans
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async listPlansTransactionService(params = {}, options = {}) {
    let endpoint = "/api/transaction-service/external/v1/plans";

    if (params && typeof params === "object" && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Creates a new payment plan via the transaction service.
   * POST /api/transaction-service/external/v1/plans
   *
   * @param {Object} [payload] - Optional payload data for creating the plan
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createPlanTransactionService(payload = {}, options = {}) {
    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/plans",
      payload,
      options
    );
  }
}

module.exports = Plans;
