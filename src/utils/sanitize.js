const SENSITIVE_KEYS = [
  "secret_key",
  "public_key",
  "token",
  "authorization",
  "password",
  "api_key",
];

/**
 * Deeply sanitizes an object or string, redacting sensitive fields
 *
 * @param {any} data - Object or string to sanitize
 * @returns {any} Sanitized data copy with sensitive values masked
 */
function sanitize(data) {
  if (!data) return data;

  if (typeof data === "string") {
    // Redact JWT tokens or long secret key strings if present directly
    return data.replace(
      /(sk_[a-zA-Z0-9_]+|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/g,
      "[REDACTED]"
    );
  }

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) return data.map(sanitize);

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey)
    );

    if (isSensitive && typeof value === "string") {
      // Keep first 4 characters for debugging, redact the rest
      sanitized[key] = value.length > 8 ? `${value.slice(0, 4)}***[REDACTED]` : "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = { sanitize };
