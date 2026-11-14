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
}

module.exports = Transfer;
