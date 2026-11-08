class Subaccounts {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new subaccount.
   * POST /api/transaction-service/external/v1/subaccounts/
   *
   * @param {Object} payload - Subaccount creation payload
   * @param {string} payload.business_name - Name of the business associated with the subaccount (required)
   * @param {string} payload.account_number - Account number of the subaccount (required)
   * @param {number} payload.percentage_charge - Percentage charge for the subaccount (required)
   * @param {string} payload.currency - Currency code for the subaccount (e.g., NGN) (required)
   * @param {number} payload.bank - Code representing the bank associated with the subaccount (required)
   * @param {string} payload.account_name - Account name of the subaccount (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createSubaccount(payload, options = {}) {
    if (
      !payload ||
      !payload.business_name ||
      !payload.account_number ||
      payload.percentage_charge === undefined ||
      payload.percentage_charge === null ||
      !payload.currency ||
      payload.bank === undefined ||
      payload.bank === null ||
      !payload.account_name
    ) {
      throw new Error(
        "Invalid payload: 'business_name', 'account_number', 'percentage_charge', 'currency', 'bank', and 'account_name' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/subaccounts/",
      payload,
      options
    );
  }

  /**
   * Retrieves a paginated list of all subaccounts with required and optional filters.
   * GET /api/transaction-service/external/v1/subaccounts/all
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - The page number to retrieve (required)
   * @param {number} params.limit - The number of items per page (required)
   * @param {string} params.sort - Sorting criteria, e.g., ASC or DESC (required)
   * @param {string} params.sortKey - The key/field to sort by (required)
   * @param {string} [params.searchString] - A search string to filter results
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getAllSubaccounts(params = {}, options = {}) {
    if (
      !params ||
      params.page === undefined ||
      params.page === null ||
      params.limit === undefined ||
      params.limit === null ||
      params.sort === undefined ||
      params.sort === null ||
      params.sort === "" ||
      params.sortKey === undefined ||
      params.sortKey === null ||
      params.sortKey === ""
    ) {
      throw new Error(
        "Invalid parameters: 'page', 'limit', 'sort', and 'sortKey' are required to retrieve subaccounts."
      );
    }

    const searchParams = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      sort: String(params.sort),
      sortKey: String(params.sortKey),
    });

    if (
      params.searchString !== undefined &&
      params.searchString !== null &&
      params.searchString !== ""
    ) {
      searchParams.append("searchString", String(params.searchString));
    }

    const endpoint = `/api/transaction-service/external/v1/subaccounts/all?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Subaccounts;
