class Dispute {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a dispute by uploading a document/evidence.
   * POST /api/dispute-service/external/v1/create-dispute
   *
   * @param {FormData|Object} payload - FormData instance or plain object containing dispute details
   * @param {string} payload.transactionRef - The reference of the transaction for the dispute
   * @param {string} payload.disputeReason - The reason for raising the dispute
   * @param {string} payload.disputeDescription - Detailed description of the dispute
   * @param {any} [payload.image] - Evidence file (File, Blob, or stream)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeouts)
   * @returns {Promise<Object>} API response payload
   */
  async createDispute(payload, options = {}) {
    let requestBody = payload;

    // If a plain object is passed instead of FormData, construct FormData automatically
    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        !payload.transactionRef ||
        !payload.disputeReason ||
        !payload.disputeDescription
      ) {
        throw new Error(
          "Invalid payload: 'transactionRef', 'disputeReason', and 'disputeDescription' are required."
        );
      }

      const formData = new FormData();
      formData.append("transactionRef", payload.transactionRef);
      formData.append("disputeReason", payload.disputeReason);
      formData.append("disputeDescription", payload.disputeDescription);

      if (payload.image) {
        formData.append("image", payload.image);
      }

      requestBody = formData;
    }

    return this.client.request(
      "POST",
      "/api/dispute-service/external/v1/create-dispute",
      requestBody,
      options
    );
  }

  /**
   * Retrieves a paginated list of disputes.
   * GET /api/dispute-service/external/v1/list
   *
   * @param {Object} [params] - Query parameters { limit, page, search }
   * @param {number} [params.limit=10] - Maximum number of disputes to retrieve per page
   * @param {number} [params.page=1] - The page number to retrieve
   * @param {string} [params.search] - Search string to filter disputes by transaction reference or customer details
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the list of disputes
   */
  async listDisputes(params = {}, options = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", params.limit ?? 10);
    queryParams.append("page", params.page ?? 1);

    if (params.search != null) {
      queryParams.append("search", params.search);
    }

    return this.client.request(
      "GET",
      `/api/dispute-service/external/v1/list?${queryParams.toString()}`,
      null,
      options
    );
  }

  /**
   * Retrieves dispute details by transaction reference.
   * GET /api/dispute-service/external/v1/dispute-details
   *
   * @param {string|Object} transactionRef - The transaction reference string or an object containing { transactionRef }
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing dispute details
   */
  async getDisputeDetails(transactionRef, options = {}) {
    const ref =
      typeof transactionRef === "object" && transactionRef !== null
        ? transactionRef.transactionRef || transactionRef.reference
        : transactionRef;

    if (!ref || typeof ref !== "string") {
      throw new Error(
        "Invalid parameter: 'transactionRef' is required to retrieve dispute details."
      );
    }

    const queryParams = new URLSearchParams({ transactionRef: ref }).toString();

    return this.client.request(
      "GET",
      `/api/dispute-service/external/v1/dispute-details?${queryParams}`,
      null,
      options
    );
  }

  /**
   * Updates an existing dispute record.
   * PUT /api/dispute-service/external/v1/update-dispute
   *
   * @param {Object} payload - Update details payload
   * @param {string} payload.tnxRef - The transaction reference
   * @param {string} payload.reason - The reason for the update
   * @param {string} payload.status - The new status of the dispute
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateDispute(payload, options = {}) {
    if (!payload || !payload.tnxRef || !payload.reason || !payload.status) {
      throw new Error(
        "Invalid payload: 'tnxRef', 'reason', and 'status' are required to update a dispute."
      );
    }

    return this.client.request(
      "PUT",
      "/api/dispute-service/external/v1/update-dispute",
      payload,
      options
    );
  }
}

module.exports = Dispute;
