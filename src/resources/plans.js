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
}

module.exports = Plans;
