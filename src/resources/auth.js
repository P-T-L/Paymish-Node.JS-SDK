class Auth {
  /**
   * @param {import("../client")} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Generates an authentication token using public and secret keys
   * POST /api/user-service/external/v1/generate-token
   *
   * @param {Object} credentials - { public_key: string, secret_key: string }
   * @param {Object} [options] - Additional request options (e.g. custom headers, timeout)
   * @returns {Promise<Object>} API response payload containing the JWT token
   */
  async generateToken(credentials, options = {}) {
    if (!credentials || !credentials.public_key || !credentials.secret_key) {
      throw new Error("Both public_key and secret_key are required to generate a token.");
    }

    return this.client.request(
      "POST",
      "/api/user-service/external/v1/generate-token",
      {
        public_key: credentials.public_key,
        secret_key: credentials.secret_key,
      },
      options
    );
  }
}

module.exports = Auth;
