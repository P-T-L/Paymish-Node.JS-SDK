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
}

module.exports = Products;
