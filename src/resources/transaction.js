class Transaction {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves a paginated list of transaction documents with required and optional query filters.
   * GET /api/transaction-service/external/v1/list
   *
   * @param {Object} params - Query parameters
   * @param {number} params.businessId - Unique identifier for the business (required)
   * @param {number} params.limit - Number of records to return (required)
   * @param {number} params.page - Current page number (required)
   * @param {string} [params.reference] - Customer reference
   * @param {string} [params.transactionReference] - Transaction reference
   * @param {string} [params.pageId] - Page ID
   * @param {string} [params.status] - Transaction status (completed/fail/initiated/reversed)
   * @param {string} [params.channel] - Transaction channel (NIBSS/CARD/EBILL/NQR/USSD)
   * @param {string} [params.amount] - Transaction amount
   * @param {string} [params.search] - Search string
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getDocuments(params = {}, options = {}) {
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
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve transaction documents."
      );
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/transaction-service/external/v1/list?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Initiates a transaction with a card.
   * POST /api/transaction-service/external/v1/transaction-with-card
   *
   * @param {Object} payload - Transaction with card payload
   * @param {number} payload.businessId - Unique identifier for the business (required)
   * @param {number} payload.customerId - Unique identifier for the customer (required)
   * @param {number} payload.planId - Unique identifier for the plan (required)
   * @param {string} payload.channel - The channel through which the transaction is made (required)
   * @param {number} payload.amount - Amount of the transaction (required)
   * @param {number} payload.cardNumber - Card number used for the transaction (required)
   * @param {number} payload.expiryYear - Expiry year of the card (required)
   * @param {number} payload.expiryMonth - Expiry month of the card (required)
   * @param {number} payload.cvv - CVV of the card (required)
   * @param {string} [payload.ipAddress] - IP address of the customer making the transaction
   * @param {number} [payload.fees] - Fees associated with the transaction
   * @param {string} [payload.message] - Additional message or information related to the transaction
   * @param {boolean} [payload.isLive] - Indicates if the transaction is in a live environment
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async transactionWithCard(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      payload.customerId === undefined ||
      payload.customerId === null ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.channel ||
      payload.amount === undefined ||
      payload.amount === null ||
      payload.cardNumber === undefined ||
      payload.cardNumber === null ||
      payload.expiryYear === undefined ||
      payload.expiryYear === null ||
      payload.expiryMonth === undefined ||
      payload.expiryMonth === null ||
      payload.cvv === undefined ||
      payload.cvv === null
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', 'cardNumber', 'expiryYear', 'expiryMonth', and 'cvv' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-with-card",
      payload,
      options
    );
  }

  /**
   * Creates a transaction with NDD (Direct Debit).
   * POST /api/transaction-service/external/v1/transaction-with-ndd
   *
   * @param {Object} payload - Transaction with NDD payload
   * @param {number} payload.businessId - ID of the business (required)
   * @param {number} payload.customerId - ID of the customer (required)
   * @param {number} payload.planId - ID of the plan (required)
   * @param {string} payload.channel - Channel of the transaction (required)
   * @param {number} payload.amount - Amount of the transaction (required)
   * @param {Object} payload.ndd - NDD details object (required)
   * @param {string} [payload.ipAddress] - IP address of the transaction
   * @param {number} [payload.fees] - Fees associated with the transaction
   * @param {string} [payload.message] - Message associated with the transaction
   * @param {boolean} [payload.isLive] - Flag indicating if the transaction is live
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async transactionWithNdd(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      payload.customerId === undefined ||
      payload.customerId === null ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.channel ||
      payload.amount === undefined ||
      payload.amount === null ||
      !payload.ndd ||
      typeof payload.ndd !== "object"
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', and 'ndd' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-with-ndd",
      payload,
      options
    );
  }

  /**
   * Initiates a transaction with a QR code.
   * POST /api/transaction-service/external/v1/transaction-with-qr
   *
   * @param {Object} payload - Transaction with QR payload
   * @param {number} payload.businessId - Unique identifier for the business (required)
   * @param {number} payload.customerId - Unique identifier for the customer (required)
   * @param {number} payload.planId - Unique identifier for the plan (required)
   * @param {string} payload.channel - The channel through which the transaction is made (required)
   * @param {number} payload.amount - Amount of the transaction (required)
   * @param {string} payload.mch_no - Merchant number (required)
   * @param {string} payload.sub_mch_no - Sub-merchant number (required)
   * @param {string} [payload.ipAddress] - IP address of the customer making the transaction
   * @param {number} [payload.fees] - Fees associated with the transaction
   * @param {string} [payload.message] - Additional message or information related to the transaction
   * @param {boolean} [payload.isLive] - Indicates if the transaction is in a live environment
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async transactionWithQr(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      payload.customerId === undefined ||
      payload.customerId === null ||
      payload.planId === undefined ||
      payload.planId === null ||
      !payload.channel ||
      payload.amount === undefined ||
      payload.amount === null ||
      !payload.mch_no ||
      !payload.sub_mch_no
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', 'mch_no', and 'sub_mch_no' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-with-qr",
      payload,
      options
    );
  }

  /**
   * Retrieves the list of banks.
   * GET /api/transaction-service/external/v1/bank-list
   *
   * @param {Object} [params] - Query parameters
   * @param {boolean} [params.isLive] - Flag to indicate if the environment is live
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getBankList(params = {}, options = {}) {
    const searchParams = new URLSearchParams();

    if (params !== null && typeof params === "object") {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/transaction-service/external/v1/bank-list${
      queryString ? `?${queryString}` : ""
    }`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Creates a transaction with a bank.
   * POST /api/transaction-service/external/v1/transaction-with-bank
   *
   * @param {Object} payload - Transaction with bank payload
   * @param {number} payload.businessId - ID of the business (required)
   * @param {number} payload.customerId - ID of the customer (required)
   * @param {string} payload.channel - Channel of the transaction (required)
   * @param {number} payload.amount - Amount of the transaction (required)
   * @param {string} payload.AccountNumber - Account number for the transaction (required)
   * @param {string} payload.DestinationInstitutionCode - Institution code of the destination bank (required)
   * @param {number} [payload.pageId] - ID of the page
   * @param {number} [payload.orderId] - ID of the order
   * @param {string} [payload.ipAddress] - IP address associated with the transaction
   * @param {number} [payload.fees] - Fees associated with the transaction
   * @param {string} [payload.message] - Message associated with the transaction
   * @param {string} [payload.location] - Location coordinates
   * @param {boolean} [payload.isLive] - Flag indicating if the transaction is live
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async transactionWithBank(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      payload.customerId === undefined ||
      payload.customerId === null ||
      !payload.channel ||
      payload.amount === undefined ||
      payload.amount === null ||
      !payload.AccountNumber ||
      !payload.DestinationInstitutionCode
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'customerId', 'channel', 'amount', 'AccountNumber', and 'DestinationInstitutionCode' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-with-bank",
      payload,
      options
    );
  }

  /**
   * Verifies bank details (account number and destination institution code).
   * POST /api/transaction-service/external/v1/bank-verify
   *
   * @param {Object} payload - Bank verification payload
   * @param {string} payload.DestinationInstitutionCode - Institution code of the destination bank (required)
   * @param {string} payload.AccountNumber - Account number to verify (required)
   * @param {boolean} [payload.isLive] - Flag indicating if the verification is live
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async verifyBankDetails(payload, options = {}) {
    if (!payload || !payload.DestinationInstitutionCode || !payload.AccountNumber) {
      throw new Error(
        "Invalid payload: 'DestinationInstitutionCode' and 'AccountNumber' are required to verify bank details."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/bank-verify",
      payload,
      options
    );
  }

  /**
   * Creates a transaction with USSD.
   * POST /api/transaction-service/external/v1/transaction-with-ussd
   *
   * @param {Object} payload - Transaction with USSD payload
   * @param {number} payload.businessId - ID of the business (required)
   * @param {number} payload.customerId - ID of the customer (required)
   * @param {string} payload.channel - Channel of the transaction (required)
   * @param {number} payload.amount - Amount of the transaction (required)
   * @param {number} [payload.pageId] - ID of the page
   * @param {number} [payload.orderId] - ID of the order
   * @param {string} [payload.ipAddress] - IP address associated with the transaction
   * @param {number} [payload.fees] - Fees associated with the transaction
   * @param {string} [payload.message] - Message associated with the transaction
   * @param {string} [payload.location] - Location coordinates
   * @param {boolean} [payload.isLive] - Flag indicating if the transaction is live
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async transactionWithUssd(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      payload.customerId === undefined ||
      payload.customerId === null ||
      !payload.channel ||
      payload.amount === undefined ||
      payload.amount === null
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'customerId', 'channel', and 'amount' are required."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-with-ussd",
      payload,
      options
    );
  }

  /**
   * Verifies a transaction initiated with USSD.
   * POST /api/transaction-service/external/v1/transaction-with-ussd-verify
   *
   * @param {Object} payload - USSD transaction verification payload
   * @param {string} payload.ussdTransactionId - The USSD transaction ID to verify (required)
   * @param {boolean} [payload.isLive] - Flag indicating if the verification is in a live environment
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async verifyUssdTransaction(payload, options = {}) {
    if (!payload || !payload.ussdTransactionId) {
      throw new Error(
        "Invalid payload: 'ussdTransactionId' is required to verify a USSD transaction."
      );
    }

    return this.client.request(
      "POST",
      "/api/transaction-service/external/v1/transaction-with-ussd-verify",
      payload,
      options
    );
  }
}

module.exports = Transaction;
