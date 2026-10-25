const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Invoices Module", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createInvoice()", () => {
    test("should successfully create an invoice with required fields (201 Created)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Request processed successfully",
        data: {
          reference: "PM-REF-12345",
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const payload = {
        customerEmail: "customer@email.com",
        amount: 5000.0,
        note: "Invoice for services",
        sendImmediately: true,
      };

      const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
      const result = await paymish.invoices.createInvoice(payload, {
        headers: authHeaders,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/payment-service/external/v1/invoices",
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

    test("should throw early validation error if customerEmail or amount is missing", async () => {
      await expect(paymish.invoices.createInvoice({ amount: 1000 })).rejects.toThrow(
        "Invalid payload: 'customerEmail' and 'amount' are required to create an invoice."
      );

      await expect(
        paymish.invoices.createInvoice({ customerEmail: "customer@email.com" })
      ).rejects.toThrow(
        "Invalid payload: 'customerEmail' and 'amount' are required to create an invoice."
      );

      await expect(paymish.invoices.createInvoice(null)).rejects.toThrow(
        "Invalid payload: 'customerEmail' and 'amount' are required to create an invoice."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when payload fails API validation (422 Unprocessable Entity)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid request payload. Check customerEmail and try again.",
        errors: {
          customerEmail: ["`customerEmail` is required."],
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
        await paymish.invoices.createInvoice({
          customerEmail: "invalid-email-format",
          amount: -100,
        });
        throw new Error("Expected createInvoice to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(422);
        expect(error.message).toBe("Invalid request payload. Check customerEmail and try again.");
        expect(error.errors).toHaveProperty("customerEmail");
      }
    });
  });
});
