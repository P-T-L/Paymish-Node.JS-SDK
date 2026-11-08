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

  /**
   * Retrieves a paginated list of all split pages with optional filters.
   * GET /api/transaction-service/external/v1/split-page/all
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - The page number to retrieve (required)
   * @param {number} params.limit - The number of items per page (required)
   * @param {string} params.sort - Sorting criteria (required)
   * @param {string} [params.searchString] - A search string to filter results
   * @param {boolean} [params.status] - Filter by status (active/inactive)
   * @param {string} [params.splitType] - The type of split (e.g., percentage, fixed)
   * @param {boolean} [params.category] - Filter by category
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getAllSplitPages(params = {}, options = {}) {
    if (
      !params ||
      params.page === undefined ||
      params.page === null ||
      params.limit === undefined ||
      params.limit === null ||
      params.sort === undefined ||
      params.sort === null ||
      params.sort === ""
    ) {
      throw new Error(
        "Invalid parameters: 'page', 'limit', and 'sort' are required to retrieve split pages."
      );
    }

    const searchParams = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      sort: String(params.sort),
    });

    if (
      params.searchString !== undefined &&
      params.searchString !== null &&
      params.searchString !== ""
    ) {
      searchParams.append("searchString", String(params.searchString));
    }
    if (params.status !== undefined && params.status !== null) {
      searchParams.append("status", String(params.status));
    }
    if (params.splitType !== undefined && params.splitType !== null && params.splitType !== "") {
      searchParams.append("splitType", String(params.splitType));
    }
    if (params.category !== undefined && params.category !== null) {
      searchParams.append("category", String(params.category));
    }

    const endpoint = `/api/transaction-service/external/v1/split-page/all?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves a split page by its unique identifier.
   * GET /api/transaction-service/external/v1/split-page/{id}
   *
   * @param {number|string|Object} identifier - Split page ID or options object containing id
   * @param {number|string} [identifier.id] - The split page id
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getSplitPageById(identifier, options = {}) {
    let splitPageId;

    if (identifier !== null && typeof identifier === "object") {
      splitPageId = identifier.id;
    } else {
      splitPageId = identifier;
    }

    if (splitPageId === undefined || splitPageId === null || splitPageId === "") {
      throw new Error("Invalid parameter: 'id' is required to retrieve a split page.");
    }

    const endpoint = `/api/transaction-service/external/v1/split-page/${encodeURIComponent(
      splitPageId
    )}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates an existing split page by ID.
   * PUT /api/transaction-service/external/v1/split-page/{id}
   *
   * @param {number|string|Object} identifier - Split page ID or options object containing id
   * @param {number|string} [identifier.id] - The split page ID
   * @param {Object} payload - Update payload containing fields to update (e.g. name)
   * @param {string} [payload.name] - Name of the split page
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateSplitPage(identifier, payload, options = {}) {
    let splitPageId;
    let requestPayload = payload;
    let reqOptions = options;

    if (identifier !== null && typeof identifier === "object" && identifier.id !== undefined) {
      splitPageId = identifier.id;
    } else if (typeof identifier === "number" || typeof identifier === "string") {
      splitPageId = identifier;
    } else if (identifier !== null && typeof identifier === "object" && payload === undefined) {
      // Handle case where single object containing id and payload properties is passed
      splitPageId = identifier.id;
      requestPayload = identifier;
    }

    if (splitPageId === undefined || splitPageId === null || splitPageId === "") {
      throw new Error("Invalid parameter: 'id' is required to update a split page.");
    }

    if (!requestPayload || typeof requestPayload !== "object") {
      throw new Error("Invalid payload: Update payload is required.");
    }

    const endpoint = `/api/transaction-service/external/v1/split-page/${encodeURIComponent(
      splitPageId
    )}`;

    return this.client.request("PUT", endpoint, requestPayload, reqOptions);
  }

  /**
   * Deletes a split page by its ID.
   * DELETE /api/transaction-service/external/v1/split-page/{id}
   *
   * @param {number|string|Object} identifier - Split page ID or options object containing id
   * @param {number|string} [identifier.id] - The split page ID
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async deleteSplitPage(identifier, options = {}) {
    let splitPageId;

    if (identifier !== null && typeof identifier === "object") {
      splitPageId = identifier.id;
    } else {
      splitPageId = identifier;
    }

    if (splitPageId === undefined || splitPageId === null || splitPageId === "") {
      throw new Error("Invalid parameter: 'id' is required to delete a split page.");
    }

    const endpoint = `/api/transaction-service/external/v1/split-page/${encodeURIComponent(
      splitPageId
    )}`;

    return this.client.request("DELETE", endpoint, null, options);
  }
}

module.exports = SplitPages;
