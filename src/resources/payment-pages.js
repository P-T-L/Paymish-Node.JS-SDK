class PaymentPages {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Check if a custom payment page link exists.
   * POST /api/payment-service/external/v1/payment-pages/custom-link-check-exist
   *
   * @param {Object} payload - Payload containing customLink
   * @param {string} payload.customLink - The custom link to check for its existence
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async checkCustomLinkExists(payload, options = {}) {
    if (!payload || !payload.customLink) {
      throw new Error(
        "Invalid payload: 'customLink' is required to check if a custom link exists."
      );
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/custom-link-check-exist",
      payload,
      options
    );
  }

  /**
   * Creates a new payment page.
   * POST /api/payment-service/external/v1/payment-pages/create-pages
   *
   * @param {Object|FormData} payload - Payment page creation payload or FormData instance
   * @param {number} [payload.businessId] - The ID of the business
   * @param {string} [payload.pageName] - The name of the payment page
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createPaymentPage(payload, options = {}) {
    let formData = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.businessId === undefined ||
        payload.businessId === null ||
        !payload.pageName
      ) {
        throw new Error(
          "Invalid payload: 'businessId' and 'pageName' are required to create a payment page."
        );
      }

      formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, value);
          }
        }
      }
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/create-pages",
      formData,
      options
    );
  }

  /**
   * Retrieves a paginated list of payment pages with optional filters.
   * GET /api/payment-service/external/v1/payment-pages/get-pages
   *
   * @param {Object} [params] - Optional query parameters
   * @param {string} [params.status] - Status of the pages (Published/Unpublished)
   * @param {string} [params.searchPageText] - Text to search within page content or title
   * @param {string} [params.startDate] - Filter pages created after this start date
   * @param {string} [params.endDate] - Filter pages created before this end date
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of records per page
   * @param {string} [params.sort] - Sorting criteria on created date (e.g. "DESC", "ASC")
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing the list of payment pages
   */
  async getPaymentPages(params = {}, options = {}) {
    const queryParams = new URLSearchParams();

    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", params.status);
    }
    if (params.searchPageText !== undefined && params.searchPageText !== null) {
      queryParams.append("searchPageText", params.searchPageText);
    }
    if (params.startDate !== undefined && params.startDate !== null) {
      queryParams.append("startDate", params.startDate);
    }
    if (params.endDate !== undefined && params.endDate !== null) {
      queryParams.append("endDate", params.endDate);
    }
    if (params.page !== undefined && params.page !== null) {
      queryParams.append("page", params.page);
    }
    if (params.limit !== undefined && params.limit !== null) {
      queryParams.append("limit", params.limit);
    }
    if (params.sort !== undefined && params.sort !== null) {
      queryParams.append("sort", params.sort);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/payment-service/external/v1/payment-pages/get-pages?${queryString}`
      : "/api/payment-service/external/v1/payment-pages/get-pages";

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves details of a specific payment page by its ID.
   * GET /api/payment-service/external/v1/payment-pages/get-page-details
   *
   * @param {Object|string|number} params - Query parameters object containing pageId or direct pageId value
   * @param {number|string} [params.pageId] - The ID of the payment page to retrieve details for
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing payment page details
   */
  async getPageDetails(params, options = {}) {
    const pageId =
      typeof params === "object" && params !== null ? params.pageId || params.id : params;

    if (pageId === undefined || pageId === null || pageId === "") {
      throw new Error("Invalid parameter: 'pageId' is required to retrieve payment page details.");
    }

    const queryParams = new URLSearchParams();
    queryParams.append("pageId", pageId);

    const endpoint = `/api/payment-service/external/v1/payment-pages/get-page-details?${queryParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Updates the details of an existing payment page.
   * PUT /api/payment-service/external/v1/payment-pages/update-page-details
   *
   * @param {Object|FormData} payload - Payment page update payload or FormData instance
   * @param {number|string} [payload.pageId] - Unique identifier of the payment page to update
   * @param {string} [payload.pageName] - The name of the payment page
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updatePaymentPage(payload, options = {}) {
    let formData = payload;

    if (!(payload instanceof FormData)) {
      const pageId = payload && (payload.pageId !== undefined ? payload.pageId : payload.id);

      if (pageId === undefined || pageId === null || pageId === "") {
        throw new Error("Invalid payload: 'pageId' is required to update payment page details.");
      }

      formData = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, value);
          }
        }
      }
    }

    return this.client.request(
      "PUT",
      "/api/payment-service/external/v1/payment-pages/update-page-details",
      formData,
      options
    );
  }

  /**
   * Updates the status of a specific payment page.
   * PUT /api/payment-service/external/v1/payment-pages/update-page-status
   *
   * @param {Object} payload - Payload containing pageId and status
   * @param {number|string} payload.pageId - The ID of the payment page to update
   * @param {string} payload.status - The new status of the payment page (e.g. Published, Unpublished)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updatePageStatus(payload, options = {}) {
    if (
      !payload ||
      payload.pageId === undefined ||
      payload.pageId === null ||
      payload.pageId === "" ||
      !payload.status
    ) {
      throw new Error(
        "Invalid payload: 'pageId' and 'status' are required to update payment page status."
      );
    }

    return this.client.request(
      "PUT",
      "/api/payment-service/external/v1/payment-pages/update-page-status",
      payload,
      options
    );
  }

  /**
   * Deletes (or marks as deleted) a payment page.
   * POST /api/payment-service/external/v1/payment-pages/delete-page
   *
   * @param {Object} payload - Payload containing pageId and isDeleted
   * @param {number|string} payload.pageId - The ID of the payment page
   * @param {boolean} payload.isDeleted - Boolean flag indicating deletion state
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async deletePage(payload, options = {}) {
    if (
      !payload ||
      payload.pageId === undefined ||
      payload.pageId === null ||
      payload.pageId === "" ||
      payload.isDeleted === undefined ||
      payload.isDeleted === null
    ) {
      throw new Error(
        "Invalid payload: 'pageId' and 'isDeleted' are required to delete a payment page."
      );
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/delete-page",
      payload,
      options
    );
  }

  /**
   * Retrieves products associated with a payment page.
   * GET /api/payment-service/external/v1/payment-pages/payment-page-get-product
   *
   * @param {Object|string|number} params - Query parameters object containing pageId or direct pageId value
   * @param {number|string} params.pageId - The ID of the payment page (Required)
   * @param {string} [params.searchProduct] - Optional search query for products
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload containing associated products
   */
  async getAssociatedProducts(params, options = {}) {
    const pageId =
      typeof params === "object" && params !== null
        ? params.pageId !== undefined
          ? params.pageId
          : params.id
        : params;

    if (pageId === undefined || pageId === null || pageId === "") {
      throw new Error(
        "Invalid parameter: 'pageId' is required to retrieve products associated with a payment page."
      );
    }

    const searchProduct =
      typeof params === "object" && params !== null ? params.searchProduct : undefined;

    const queryParams = new URLSearchParams();
    queryParams.append("pageId", pageId);
    if (searchProduct !== undefined && searchProduct !== null && searchProduct !== "") {
      queryParams.append("searchProduct", searchProduct);
    }

    const endpoint = `/api/payment-service/external/v1/payment-pages/payment-page-get-product?${queryParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Adds products to a payment page.
   * POST /api/payment-service/external/v1/payment-pages/payment-page-add-product
   *
   * @param {Object} payload - Payload containing pageId and productIds
   * @param {number|string} payload.pageId - The ID of the payment page
   * @param {string|Array<number|string>} payload.productIds - Comma-separated string or array of product IDs to add
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async addProductToPaymentPage(payload, options = {}) {
    const pageId = payload && (payload.pageId !== undefined ? payload.pageId : payload.id);
    let productIds = payload && payload.productIds;

    if (!payload || pageId === undefined || pageId === null || pageId === "" || !productIds) {
      throw new Error(
        "Invalid payload: 'pageId' and 'productIds' are required to add products to a payment page."
      );
    }

    if (Array.isArray(productIds)) {
      productIds = productIds.join(",");
    }

    const requestPayload = {
      pageId,
      productIds: String(productIds),
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/payment-page-add-product",
      requestPayload,
      options
    );
  }

  /**
   * Deletes a product from a payment page.
   * POST /api/payment-service/external/v1/payment-pages/payment-page-delete-product
   *
   * @param {Object|number|string} payload - Payload containing paymentPageProductId or direct ID value
   * @param {number|string} payload.paymentPageProductId - The ID of the product on the payment page to delete
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async deleteProductFromPaymentPage(payload, options = {}) {
    const paymentPageProductId =
      typeof payload === "object" && payload !== null
        ? payload.paymentPageProductId !== undefined
          ? payload.paymentPageProductId
          : payload.id
        : payload;

    if (
      paymentPageProductId === undefined ||
      paymentPageProductId === null ||
      paymentPageProductId === ""
    ) {
      throw new Error(
        "Invalid payload: 'paymentPageProductId' is required to delete a product from a payment page."
      );
    }

    const requestPayload = {
      paymentPageProductId,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/payment-page-delete-product",
      requestPayload,
      options
    );
  }

  /**
   * Initiates a dynamic virtual account for a payment page checkout session.
   * POST /api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account
   *
   * @param {Object} payload - Payload containing accessCode and amount
   * @param {string} payload.accessCode - Checkout session access code (accepts access_code alias)
   * @param {number} payload.amount - Amount to be paid in Naira
   * @param {string} [payload.email] - Optional customer email
   * @param {string} [payload.pageReference] - Optional page reference (accepts page_reference alias)
   * @param {number} [payload.transferSelectedAt] - Epoch timestamp in ms when transfer was selected
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async initiateCheckoutDynamicVirtualAccount(payload, options = {}) {
    const accessCode = payload && (payload.accessCode || payload.access_code);
    const amount = payload && payload.amount;

    if (
      !payload ||
      !accessCode ||
      amount === undefined ||
      amount === null ||
      typeof amount !== "number"
    ) {
      throw new Error(
        "Invalid payload: 'accessCode' and numeric 'amount' are required to initiate a dynamic virtual account."
      );
    }

    const requestPayload = {
      accessCode,
      amount,
      ...(payload.email && { email: payload.email }),
      ...((payload.pageReference || payload.page_reference) && {
        pageReference: payload.pageReference || payload.page_reference,
      }),
      ...(payload.transferSelectedAt !== undefined && {
        transferSelectedAt: payload.transferSelectedAt,
      }),
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/payment-pages/initiate-initialize-checkout-dynamic-virtual-account",
      requestPayload,
      options
    );
  }
}

module.exports = PaymentPages;
