class Recipients {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of transfer recipients for a business.
   * GET /api/transaction-service/external/v1/transfer/get-recipient-list
   *
   * @param {Object} params - Query parameters
   * @param {string} params.businessId - The unique identifier for the business (required)
   * @param {number} params.limit - Number of results to return per page (required)
   * @param {number} params.page - Current page number for pagination (required)
   * @param {boolean} [params.status] - Filter by recipient status (true for active, false for inactive)
   * @param {string} [params.searchRecipientAccountName] - Search filter for recipient account name
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getRecipientList(params = {}, options = {}) {
    if (
      !params ||
      params.businessId === undefined ||
      params.businessId === null ||
      params.businessId === "" ||
      params.limit === undefined ||
      params.limit === null ||
      params.page === undefined ||
      params.page === null
    ) {
      throw new Error(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve the recipient list."
      );
    }

    const searchParams = new URLSearchParams({
      businessId: String(params.businessId),
      limit: String(params.limit),
      page: String(params.page),
    });

    if (params.status !== undefined && params.status !== null) {
      searchParams.append("status", String(params.status));
    }

    if (
      params.searchRecipientAccountName !== undefined &&
      params.searchRecipientAccountName !== null &&
      params.searchRecipientAccountName !== ""
    ) {
      searchParams.append("searchRecipientAccountName", String(params.searchRecipientAccountName));
    }

    const endpoint = `/api/transaction-service/external/v1/transfer/get-recipient-list?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves details for a specific recipient by recipient code.
   * GET /api/transaction-service/external/v1/transfer/get-recipient-details
   *
   * @param {Object|string} identifier - Recipient code string or object containing recipientCode
   * @param {string} [identifier.recipientCode] - Code of the recipient to retrieve details for
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getRecipientDetails(identifier, options = {}) {
    let recipientCode;

    if (identifier !== null && typeof identifier === "object") {
      recipientCode = identifier.recipientCode;
    } else {
      recipientCode = identifier;
    }

    if (recipientCode === undefined || recipientCode === null || recipientCode === "") {
      throw new Error(
        "Invalid parameter: 'recipientCode' is required to retrieve recipient details."
      );
    }

    const searchParams = new URLSearchParams({ recipientCode: String(recipientCode) });
    const endpoint = `/api/transaction-service/external/v1/transfer/get-recipient-details?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }
}

module.exports = Recipients;
