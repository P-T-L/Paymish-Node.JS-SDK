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
}

module.exports = Dispute;