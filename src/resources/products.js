class Products {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Creates a new product.
   * POST /api/payment-service/external/v1/products/create-product
   *
   * @param {Object} payload - Product creation payload
   * @param {string} payload.businessId - The ID of the business
   * @param {string} payload.productName - Name of the product
   * @param {string} payload.productDescription - Description of the product
   * @param {string} payload.productPrice - Price of the product
   * @param {string} payload.quantityType - Type of quantity (e.g., unit, weight)
   * @param {number} payload.quantityStock - Quantity in stock
   * @param {boolean} payload.isPhysical - Indicates if the product is physical
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async createProduct(payload, options = {}) {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      !payload.productName ||
      !payload.productDescription ||
      payload.productPrice === undefined ||
      payload.productPrice === null ||
      !payload.quantityType ||
      payload.quantityStock === undefined ||
      payload.quantityStock === null ||
      payload.isPhysical === undefined ||
      payload.isPhysical === null
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'productName', 'productDescription', 'productPrice', 'quantityType', 'quantityStock', and 'isPhysical' are required."
      );
    }

    const requestPayload = {
      businessId: payload.businessId,
      productName: payload.productName,
      productDescription: payload.productDescription,
      productPrice: payload.productPrice,
      quantityType: payload.quantityType,
      quantityStock: payload.quantityStock,
      isPhysical: payload.isPhysical,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/create-product",
      requestPayload,
      options
    );
  }

  /**
   * Retrieves a paginated list of products with optional filters.
   * GET /api/payment-service/external/v1/products/get-products
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination
   * @param {boolean} [params.status] - Product status (true/false)
   * @param {string} [params.quantityType] - Stock type (Limited/Unlimited)
   * @param {number} [params.quantityStock] - Quantity in stock
   * @param {string} [params.quantityStockType] - Quantity stock type (moreThan/lessThan/equals)
   * @param {string} [params.productPrice] - Product price
   * @param {string} [params.productPriceType] - Product price type (moreThan/lessThan/equals)
   * @param {string} [params.searchPlanText] - Search plan text
   * @param {string} [params.startDate] - Start date (in ISO 8601 format)
   * @param {string} [params.endDate] - End date (in ISO 8601 format)
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getProducts(params = {}, options = {}) {
    let endpoint = "/api/payment-service/external/v1/products/get-products";

    if (params && typeof params === "object" && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Retrieves detailed information for a specific product.
   * GET /api/payment-service/external/v1/products/get-product-details
   *
   * @param {Object|string|number} identifier - Product ID or options object containing productId or id
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getProductDetails(identifier, options = {}) {
    let productId;

    if (identifier !== null && typeof identifier === "object") {
      productId = identifier.productId !== undefined ? identifier.productId : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error("Invalid parameter: 'productId' is required to retrieve product details.");
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-product-details?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Deletes or updates the status of an existing product.
   * POST /api/payment-service/external/v1/products/delete-product
   *
   * @param {Object} payload - Delete product payload
   * @param {string} payload.productId - The ID of the product
   * @param {boolean} payload.status - The product status action
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async deleteProduct(payload, options = {}) {
    if (
      !payload ||
      payload.productId === undefined ||
      payload.productId === null ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error("Invalid payload: 'productId' and 'status' are required.");
    }

    const requestPayload = {
      productId: payload.productId,
      status: payload.status,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/delete-product",
      requestPayload,
      options
    );
  }

  /**
   * Archives or unarchives an existing product.
   * POST /api/payment-service/external/v1/products/archive-product
   *
   * @param {Object} payload - Archive product payload
   * @param {string} payload.productId - The ID of the product
   * @param {boolean} payload.status - The product archive status action
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async archiveProduct(payload, options = {}) {
    if (
      !payload ||
      payload.productId === undefined ||
      payload.productId === null ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error("Invalid payload: 'productId' and 'status' are required.");
    }

    const requestPayload = {
      productId: payload.productId,
      status: payload.status,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/archive-product",
      requestPayload,
      options
    );
  }

  /**
   * Updates detailed information for an existing product.
   * PUT /api/payment-service/external/v1/products/update-product-details
   *
   * @param {Object} payload - Update product details payload
   * @param {string} payload.productId - The ID of the product to update
   * @param {string} payload.productName - The name of the product
   * @param {string} payload.productDescription - The description of the product
   * @param {string} payload.productPrice - The price of the product
   * @param {string} payload.quantityType - The type of quantity (Limited/Unlimited)
   * @param {number} payload.quantityStock - Quantity in stock
   * @param {number} payload.minOrder - Minimum order quantity
   * @param {number} payload.maxOrder - Maximum order quantity
   * @param {boolean} payload.lowStockAlert - Indicates if low stock alerts are enabled
   * @param {number} payload.notifyStock - The stock level at which notifications should be sent
   * @param {string} payload.shareableUrl - The URL that can be shared for the product
   * @param {string} payload.productBackgroundColor - The background color for the product
   * @param {string} payload.deliveryAddress - Delivery address option (Disabled/Required)
   * @param {string} payload.deliveryNote - Delivery note option (Disabled/Required/Optional)
   * @param {string} payload.redirectAfterPaymentLink - The link to redirect after payment
   * @param {string} payload.successMessage - The success message to show after the payment
   * @param {string} payload.sendNotification - Notification setting for the product
   * @param {boolean} payload.isActive - Indicates if the product is active
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async updateProductDetails(payload, options = {}) {
    if (
      !payload ||
      !payload.productId ||
      !payload.productName ||
      !payload.productDescription ||
      payload.productPrice === undefined ||
      payload.productPrice === null ||
      !payload.quantityType ||
      payload.quantityStock === undefined ||
      payload.quantityStock === null ||
      payload.minOrder === undefined ||
      payload.minOrder === null ||
      payload.maxOrder === undefined ||
      payload.maxOrder === null ||
      payload.lowStockAlert === undefined ||
      payload.lowStockAlert === null ||
      payload.notifyStock === undefined ||
      payload.notifyStock === null ||
      !payload.shareableUrl ||
      !payload.productBackgroundColor ||
      !payload.deliveryAddress ||
      !payload.deliveryNote ||
      !payload.redirectAfterPaymentLink ||
      !payload.successMessage ||
      !payload.sendNotification ||
      payload.isActive === undefined ||
      payload.isActive === null
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'productName', 'productDescription', 'productPrice', 'quantityType', 'quantityStock', 'minOrder', 'maxOrder', 'lowStockAlert', 'notifyStock', 'shareableUrl', 'productBackgroundColor', 'deliveryAddress', 'deliveryNote', 'redirectAfterPaymentLink', 'successMessage', 'sendNotification', and 'isActive' are required."
      );
    }

    const requestPayload = {
      productId: payload.productId,
      productName: payload.productName,
      productDescription: payload.productDescription,
      productPrice: payload.productPrice,
      quantityType: payload.quantityType,
      quantityStock: payload.quantityStock,
      minOrder: payload.minOrder,
      maxOrder: payload.maxOrder,
      lowStockAlert: payload.lowStockAlert,
      notifyStock: payload.notifyStock,
      shareableUrl: payload.shareableUrl,
      productBackgroundColor: payload.productBackgroundColor,
      deliveryAddress: payload.deliveryAddress,
      deliveryNote: payload.deliveryNote,
      redirectAfterPaymentLink: payload.redirectAfterPaymentLink,
      successMessage: payload.successMessage,
      sendNotification: payload.sendNotification,
      isActive: payload.isActive,
    };

    return this.client.request(
      "PUT",
      "/api/payment-service/external/v1/products/update-product-details",
      requestPayload,
      options
    );
  }

  /**
   * Uploads a media file for a product using multipart/form-data.
   * POST /api/payment-service/external/v1/products/product-upload-media
   *
   * @param {Object|FormData} payload - Product upload media payload or FormData instance
   * @param {string} [payload.productId] - The ID of the product
   * @param {any} [payload.media] - The media file or stream to upload
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async productUploadMedia(payload, options = {}) {
    let requestBody = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.productId === undefined ||
        payload.productId === null ||
        payload.media === undefined ||
        payload.media === null
      ) {
        throw new Error("Invalid payload: 'productId' and 'media' are required.");
      }

      const formData = new FormData();
      formData.append("productId", String(payload.productId));
      formData.append("media", payload.media);
      requestBody = formData;
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/product-upload-media",
      requestBody,
      options
    );
  }

  /**
   * Retrieves media associated with a specific product.
   * GET /api/payment-service/external/v1/products/get-product-media
   *
   * @param {Object|string|number} identifier - Product ID or options object containing productId or id
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getProductMedia(identifier, options = {}) {
    let productId;

    if (identifier !== null && typeof identifier === "object") {
      productId = identifier.productId !== undefined ? identifier.productId : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error("Invalid parameter: 'productId' is required to retrieve product media.");
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-product-media?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Deletes or updates the status of an existing product media item.
   * POST /api/payment-service/external/v1/products/delete-product-media
   *
   * @param {Object} payload - Delete product media payload
   * @param {string} payload.mediaId - The ID of the media item
   * @param {boolean} payload.status - The status action
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async deleteProductMedia(payload, options = {}) {
    if (
      !payload ||
      payload.mediaId === undefined ||
      payload.mediaId === null ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error("Invalid payload: 'mediaId' and 'status' are required.");
    }

    const requestPayload = {
      mediaId: payload.mediaId,
      status: payload.status,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/delete-product-media",
      requestPayload,
      options
    );
  }

  /**
   * Retrieves inventory details for a specific product.
   * GET /api/payment-service/external/v1/products/get-product-inventory-details
   *
   * @param {Object|string|number} identifier - Product ID or options object containing productId or id
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getProductInventoryDetails(identifier, options = {}) {
    let productId;

    if (identifier !== null && typeof identifier === "object") {
      productId = identifier.productId !== undefined ? identifier.productId : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve product inventory details."
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-product-inventory-details?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Uploads a file for digital download associated with a product using multipart/form-data.
   * POST /api/payment-service/external/v1/products/add-digital-download-files
   *
   * @param {Object|FormData} payload - Add digital download files payload or FormData instance
   * @param {string} [payload.productId] - The ID of the product
   * @param {any} [payload.media] - The file to upload for digital download
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async addDigitalDownloadFiles(payload, options = {}) {
    let requestBody = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.productId === undefined ||
        payload.productId === null ||
        payload.media === undefined ||
        payload.media === null
      ) {
        throw new Error("Invalid payload: 'productId' and 'media' are required.");
      }

      const formData = new FormData();
      formData.append("productId", String(payload.productId));
      formData.append("media", payload.media);
      requestBody = formData;
    }

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/add-digital-download-files",
      requestBody,
      options
    );
  }

  /**
   * Retrieves digital download files associated with a specific product.
   * GET /api/payment-service/external/v1/products/get-digital-download-files
   *
   * @param {Object|string|number} identifier - Product ID or options object containing productId or id
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout)
   * @returns {Promise<Object>} API response payload
   */
  async getDigitalDownloadFiles(identifier, options = {}) {
    let productId;

    if (identifier !== null && typeof identifier === "object") {
      productId = identifier.productId !== undefined ? identifier.productId : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve digital download files."
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-digital-download-files?${searchParams.toString()}`;

    return this.client.request("GET", endpoint, null, options);
  }

  /**
   * Renames an existing digital download file associated with a product.
   * PUT /api/payment-service/external/v1/products/rename-digital-download-files
   *
   * @param {Object} payload - Rename digital download file payload
   * @param {string} payload.productId - The ID of the product
   * @param {string} payload.digitalDownloadFileId - The ID of the digital download file to rename
   * @param {string} payload.fileName - The new name for the digital download file
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async renameDigitalDownloadFiles(payload, options = {}) {
    if (!payload || !payload.productId || !payload.digitalDownloadFileId || !payload.fileName) {
      throw new Error(
        "Invalid payload: 'productId', 'digitalDownloadFileId', and 'fileName' are required."
      );
    }

    const requestPayload = {
      productId: payload.productId,
      digitalDownloadFileId: payload.digitalDownloadFileId,
      fileName: payload.fileName,
    };

    return this.client.request(
      "PUT",
      "/api/payment-service/external/v1/products/rename-digital-download-files",
      requestPayload,
      options
    );
  }

  /**
   * Deletes or updates the status of an existing digital download file.
   * POST /api/payment-service/external/v1/products/delete-digital-download-files
   *
   * @param {Object} payload - Delete digital download file payload
   * @param {string} payload.productId - The ID of the product
   * @param {string} payload.digitalDownloadFileId - The ID of the digital download file
   * @param {boolean} payload.status - The status action
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async deleteDigitalDownloadFiles(payload, options = {}) {
    if (
      !payload ||
      !payload.productId ||
      !payload.digitalDownloadFileId ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'digitalDownloadFileId', and 'status' are required."
      );
    }

    const requestPayload = {
      productId: payload.productId,
      digitalDownloadFileId: payload.digitalDownloadFileId,
      status: payload.status,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/delete-digital-download-files",
      requestPayload,
      options
    );
  }

  /**
   * Sets the download link expiry configuration for a product.
   * PUT /api/payment-service/external/v1/products/set-download-link-expiry
   *
   * @param {Object} payload - Set download link expiry payload
   * @param {string} payload.productId - The ID of the product
   * @param {boolean} payload.isDownloadLinkExpiry - Flag to indicate if download link expiry is enabled
   * @param {string} payload.downloadLinkExpiryDuration - The duration for which the download link will be active
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async setDownloadLinkExpiry(payload, options = {}) {
    if (
      !payload ||
      !payload.productId ||
      payload.isDownloadLinkExpiry === undefined ||
      payload.isDownloadLinkExpiry === null ||
      !payload.downloadLinkExpiryDuration
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'isDownloadLinkExpiry', and 'downloadLinkExpiryDuration' are required."
      );
    }

    const requestPayload = {
      productId: payload.productId,
      isDownloadLinkExpiry: payload.isDownloadLinkExpiry,
      downloadLinkExpiryDuration: payload.downloadLinkExpiryDuration,
    };

    return this.client.request(
      "PUT",
      "/api/payment-service/external/v1/products/set-download-link-expiry",
      requestPayload,
      options
    );
  }

  /**
   * Adds delivery fees for a specific location to a product.
   * POST /api/payment-service/external/v1/products/add-delivery-fees
   *
   * @param {Object} payload - Add delivery fees payload
   * @param {string} payload.productId - The ID of the product
   * @param {string} payload.location - The location for which delivery fees are being added
   * @param {string} payload.fees - The amount of delivery fees
   * @param {Object} [options] - Optional request overrides (e.g. headers, timeout, idempotencyKey)
   * @returns {Promise<Object>} API response payload
   */
  async addDeliveryFees(payload, options = {}) {
    if (!payload || !payload.productId || !payload.location || !payload.fees) {
      throw new Error("Invalid payload: 'productId', 'location', and 'fees' are required.");
    }

    const requestPayload = {
      productId: payload.productId,
      location: payload.location,
      fees: payload.fees,
    };

    return this.client.request(
      "POST",
      "/api/payment-service/external/v1/products/add-delivery-fees",
      requestPayload,
      options
    );
  }
}

module.exports = Products;
