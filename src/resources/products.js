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
}

module.exports = Products;
