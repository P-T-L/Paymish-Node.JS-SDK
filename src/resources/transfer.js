class Transfer {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves the list of banks for transfers.
   * GET /api/transaction-service/external/v1/transfer/all-banks
   *
   * @param {Object} [params] - Optional query parameters
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getAllBanks(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/transfer/all-banks${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Initiates a single transfer to a user.
   * POST /api/transaction-service/external/v1/transfer/create-single-transfer
   *
   * @param {Object} payload - Single transfer payload
   * @param {number} payload.amount - Amount to be transferred, in the smallest currency unit (required)
   * @param {string} payload.bankCode - Code of the bank where recipient's account is held (required)
   * @param {string} [payload.bankName] - Name of the bank where recipient's account is held
   * @param {string} payload.accountNumber - Recipient's bank account number (required)
   * @param {string} payload.accountName - Name associated with the recipient's bank account (required)
   * @param {string} payload.emailAddress - Email address for sending transfer notifications (required)
   * @param {string} [payload.transferNote] - Optional note or memo for the transfer
   * @param {string} payload.transferReference - Unique reference for the transfer transaction (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createSingleTransfer(payload, options = {}) {
    if (
      !payload ||
      payload.amount === undefined ||
      payload.amount === null ||
      !payload.bankCode ||
      !payload.accountNumber ||
      !payload.accountName ||
      !payload.emailAddress ||
      !payload.transferReference
    ) {
      throw new Error(
        "Invalid payload: 'amount', 'bankCode', 'accountNumber', 'accountName', 'emailAddress', and 'transferReference' are required to create a single transfer."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transfer/create-single-transfer",
      payload,
      options
    );
  }

  /**
   * Retrieves a paginated list of transfers with required and optional query filters.
   * GET /api/transaction-service/external/v1/transfer/get-transfer-list
   *
   * @param {Object} params - Query parameters
   * @param {number} params.businessId - The unique identifier of the business (required)
   * @param {number} params.limit - The maximum number of records to return (required)
   * @param {number} params.page - The current page number for pagination (required)
   * @param {string} [params.transferReference] - The reference number of the transfer
   * @param {string} [params.status] - The status of the transfer (e.g. Successful, Failed, Pending)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getTransferList(params = {}, options = {}) {
    if (
      !params ||
      params.businessId === undefined ||
      params.businessId === null ||
      params.limit === undefined ||
      params.limit === null ||
      params.page === undefined ||
      params.page === null
    ) {
      throw new Error(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve the transfer list."
      );
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/transaction-service/external/v1/transfer/get-transfer-list?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves the transfer balance for a business.
   * GET /api/transaction-service/external/v1/transfer/balance
   *
   * @param {Object} params - Query parameters
   * @param {number} params.businessId - The unique identifier of the business (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getBalance(params = {}, options = {}) {
    if (!params || params.businessId === undefined || params.businessId === null) {
      throw new Error("Invalid parameters: 'businessId' is required to retrieve the balance.");
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/transaction-service/external/v1/transfer/balance?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves transfer details.
   * GET /api/transaction-service/external/v1/transfer/transfer-details
   *
   * @param {Object} params - Query parameters
   * @param {string} params.transferCode - The unique code of the transfer (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getTransferDetails(params = {}, options = {}) {
    if (!params || !params.transferCode) {
      throw new Error(
        "Invalid parameters: 'transferCode' is required to retrieve transfer details."
      );
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/transaction-service/external/v1/transfer/transfer-details?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Submits a bulk transfer.
   * POST /api/transaction-service/external/v1/transfer/submit-bulk-transfer
   *
   * @param {Object} payload - Bulk transfer payload
   * @param {string} payload.debitBankCode - The bank code from which funds are debited (required)
   * @param {string} payload.debitAccountNumber - The account number from which funds are debited (required)
   * @param {Array<Object>} payload.data - Array of transfer items (required)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async submitBulkTransfer(payload, options = {}) {
    if (
      !payload ||
      !payload.debitBankCode ||
      !payload.debitAccountNumber ||
      !Array.isArray(payload.data)
    ) {
      throw new Error(
        "Invalid payload: 'debitBankCode', 'debitAccountNumber', and 'data' (array) are required to submit a bulk transfer."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transfer/submit-bulk-transfer",
      payload,
      options
    );
  }
}

module.exports = Transfer;
