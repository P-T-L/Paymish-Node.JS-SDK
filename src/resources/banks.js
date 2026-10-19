class Banks {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves the list of banks supported by Paymish.
   * GET /api/transaction-service/external/v1/bank
   *
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing supported banks
   */
  async list(options = {}) {
    return this.client.request("GET", "/api/transaction-service/external/v1/bank", null, options);
  }

  /**
   * Confirms that an account number exists at a bank and returns the account details.
   * GET /api/transaction-service/external/v1/bank/resolve
   *
   * @param {Object} params - Query parameters for account resolution
   * @param {string} params.account_number - The 10-digit (NUBAN) account number
   * @param {string} params.bank_code - The bank's code from List Banks
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload with resolved accounter holder info
   */
  async resolveAccount(params, options = {}) {
    if (!params || !params.account_number || !params.bank_code) {
      throw new Error(
        "Invalid parameters: Both 'account_number' and 'bank_code' are required to resolve an account."
      );
    }

    const queryParams = new URLSearchParams({
      account_number: params.account_number,
      bank_code: params.bank_code,
    }).toString();

    return this.client.request(
      "GET",
      `/api/transaction-service/external/v1/bank/resolve?${queryParams}`,
      null,
      options
    );
  }
}

module.exports = Banks;
