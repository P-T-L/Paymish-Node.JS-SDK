class SplitPages {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new split page.
   * POST /api/transaction-service/external/v1/split-page
   *
   * @param {Object} payload - Split page creation payload
   * @param {string} payload.name - Name of the split page (required)
   * @param {string} payload.type - The type of split (e.g., percentage, fixed) (required)
   * @param {string} payload.currency - Currency code for the split (e.g., NGN) (required)
   * @param {number} payload.integration - Integration identifier for the split (required)
   * @param {string} payload.domain - Domain associated with the split page (required)
   * @param {boolean} payload.active - Indicates if the split page is active (required)
   * @param {string} [payload.bearer_type] - Type of bearer associated with the split
   * @param {string} [payload.bearer_subaccount] - Subaccount associated with the bearer
   * @param {string} [payload.createdAt] - Date and time when the split page was created
   * @param {string} [payload.updatedAt] - Date and time when the split page was last updated
   * @param {boolean} [payload.is_dynamic] - Indicates if the split is dynamic
   * @param {Array<Object>} [payload.subaccounts] - Array of subaccounts
   * @param {number} [payload.id] - Unique identifier of the split page
   * @param {string} [payload.split_code] - Unique code identifying the split
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createSplitPage(payload, options = {}) {
    if (
      !payload ||
      !payload.name ||
      !payload.type ||
      !payload.currency ||
      payload.integration === undefined ||
      payload.integration === null ||
      !payload.domain ||
      payload.active === undefined ||
      payload.active === null
    ) {
      throw new Error(
        "Invalid payload: 'name', 'type', 'currency', 'integration', 'domain', and 'active' are required."
      );
    }

    const requestPayload = {
      name: payload.name,
      type: payload.type,
      currency: payload.currency,
      integration: payload.integration,
      domain: payload.domain,
      active: payload.active,
      ...(payload.bearer_type !== undefined && { bearer_type: payload.bearer_type }),
      ...(payload.bearer_subaccount !== undefined && {
        bearer_subaccount: payload.bearer_subaccount,
      }),
      ...(payload.createdAt !== undefined && { createdAt: payload.createdAt }),
      ...(payload.updatedAt !== undefined && { updatedAt: payload.updatedAt }),
      ...(payload.is_dynamic !== undefined && { is_dynamic: payload.is_dynamic }),
      ...(payload.subaccounts !== undefined && { subaccounts: payload.subaccounts }),
      ...(payload.id !== undefined && { id: payload.id }),
      ...(payload.split_code !== undefined && { split_code: payload.split_code }),
    };

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/split-page",
      requestPayload,
      options
    );
  }
}

module.exports = SplitPages;
