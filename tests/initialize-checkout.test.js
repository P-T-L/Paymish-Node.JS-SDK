const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("InitializeCheckout Module", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("initializeTransaction()", () => {
    test("should successfully initialize a transaction with required fields (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        transactionId: "abcd1234efgh5678",
        message: "Transaction initiated successfully.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const payload = {
        email: "customer@email.com",
        amount: "10000",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.initializeCheckout.initializeTransaction(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-initialize",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer sk_test_secret_key",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if email or amount is missing", async () => {
      await expect(
        paymish.initializeCheckout.initializeTransaction({ amount: "10000" })
      ).rejects.toThrow(
        "Invalid payload: 'email' and 'amount' are required to initialize a transaction."
      );

      await expect(
        paymish.initializeCheckout.initializeTransaction({ email: "customer@email.com" })
      ).rejects.toThrow(
        "Invalid payload: 'email' and 'amount' are required to initialize a transaction."
      );

      await expect(paymish.initializeCheckout.initializeTransaction(null)).rejects.toThrow(
        "Invalid payload: 'email' and 'amount' are required to initialize a transaction."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when payload fails API validation (422 Unprocessable Entity)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Unable to initialize transaction.",
        errors: {
          amount: ["Amount must be greater than zero."],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.initializeCheckout.initializeTransaction({
          email: "customer@email.com",
          amount: 0,
        });
        throw new Error("Expected initializeTransaction to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(422);
        expect(error.message).toBe("Unable to initialize transaction.");
        expect(error.errors).toHaveProperty("amount");
      }
    });
  });

  describe("initializeDva()", () => {
    test("should successfully initialize a DVA transaction (200 OK)", async () => {
      const mockResponseBody = {
        status: true,
        message: "Dynamic virtual account created successfully",
        data: {
          account_number: "1234567890",
          bank_name: "Test Bank",
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const payload = {
        email: "customer@email.com",
        amount: "10000",
        reference: "ww0yy74pd9tcih",
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.initializeCheckout.initializeDva(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-initialize/dva",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer sk_test_secret_key",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if email or amount is missing", async () => {
      await expect(paymish.initializeCheckout.initializeDva({ amount: "10000" })).rejects.toThrow(
        "Invalid payload: 'email' and 'amount' are required to initialize a DVA transaction."
      );

      await expect(
        paymish.initializeCheckout.initializeDva({ email: "customer@email.com" })
      ).rejects.toThrow(
        "Invalid payload: 'email' and 'amount' are required to initialize a DVA transaction."
      );

      await expect(paymish.initializeCheckout.initializeDva(null)).rejects.toThrow(
        "Invalid payload: 'email' and 'amount' are required to initialize a DVA transaction."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when payload fails API validation (422 Unprocessable Entity)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Unable to initialize transaction.",
        errors: {
          reference: ["Reference must be unique for each payment attempt."],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.initializeCheckout.initializeDva({
          email: "customer@email.com",
          amount: 10000,
          reference: "duplicate_ref",
        });
        throw new Error("Expected initializeDva to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(422);
        expect(error.message).toBe("Unable to initialize transaction.");
        expect(error.errors).toHaveProperty("reference");
      }
    });
  });
});
