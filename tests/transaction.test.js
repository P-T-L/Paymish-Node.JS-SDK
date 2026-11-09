const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Transaction Resource", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish({ baseUrl: "https://api.paymish.com" });
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getDocuments()", () => {
    test("should successfully retrieve transaction documents with required and optional query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Documents retrieved successfully",
        data: [{ id: 1, reference: "REF_123" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const params = {
        businessId: 100,
        limit: 10,
        page: 1,
        status: "completed",
        channel: "CARD",
      };

      const result = await paymish.transaction.getDocuments(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/list?businessId=100&limit=10&page=1&status=completed&channel=CARD",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required parameters (businessId, limit, page) are missing", async () => {
      await expect(
        paymish.transaction.getDocuments({
          businessId: 100,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve transaction documents."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid query parameters.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.getDocuments({
          businessId: 100,
          limit: 10,
          page: 1,
        });
        throw new Error("Expected getDocuments to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid query parameters.");
      }
    });
  });

  describe("transactionWithCard()", () => {
    test("should successfully execute a transaction with card (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transaction successful",
        data: { reference: "TRX_CARD_123" },
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
        businessId: 24,
        customerId: 5,
        planId: 5,
        channel: "card",
        amount: 100,
        cardNumber: 5123450161003312,
        expiryYear: 2024,
        expiryMonth: 12,
        cvv: 123,
      };

      const result = await paymish.transaction.transactionWithCard(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-card",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required card transaction fields are missing", async () => {
      await expect(
        paymish.transaction.transactionWithCard({
          businessId: 24,
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', 'cardNumber', 'expiryYear', 'expiryMonth', and 'cvv' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Card charge failed.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.transactionWithCard({
          businessId: 24,
          customerId: 5,
          planId: 5,
          channel: "card",
          amount: 100,
          cardNumber: 5123450161003312,
          expiryYear: 2024,
          expiryMonth: 12,
          cvv: 123,
        });
        throw new Error("Expected transactionWithCard to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Card charge failed.");
      }
    });
  });

  describe("transactionWithNdd()", () => {
    test("should successfully create a transaction with NDD (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "NDD transaction initiated successfully",
        data: { reference: "TRX_NDD_123" },
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
        businessId: 8,
        customerId: 165,
        planId: 10,
        channel: "NDD",
        amount: 152,
        ndd: { mandateId: "MND_123" },
        message: "Test message",
      };

      const result = await paymish.transaction.transactionWithNdd(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-ndd",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required NDD transaction fields are missing", async () => {
      await expect(
        paymish.transaction.transactionWithNdd({
          businessId: 8,
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', and 'ndd' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid NDD mandate details.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.transactionWithNdd({
          businessId: 8,
          customerId: 165,
          planId: 10,
          channel: "NDD",
          amount: 152,
          ndd: {},
        });
        throw new Error("Expected transactionWithNdd to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid NDD mandate details.");
      }
    });
  });

  describe("transactionWithQr()", () => {
    test("should successfully initiate a transaction with QR (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "QR transaction initiated successfully",
        data: { reference: "TRX_QR_123" },
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
        businessId: 8,
        customerId: 165,
        planId: 10,
        channel: "NQR",
        amount: 152,
        mch_no: "M0000005463",
        sub_mch_no: "S0000007263",
      };

      const result = await paymish.transaction.transactionWithQr(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-qr",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required QR transaction fields are missing", async () => {
      await expect(
        paymish.transaction.transactionWithQr({
          businessId: 8,
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'customerId', 'planId', 'channel', 'amount', 'mch_no', and 'sub_mch_no' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid merchant QR details.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.transactionWithQr({
          businessId: 8,
          customerId: 165,
          planId: 10,
          channel: "NQR",
          amount: 152,
          mch_no: "M0000005463",
          sub_mch_no: "S0000007263",
        });
        throw new Error("Expected transactionWithQr to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid merchant QR details.");
      }
    });
  });

  describe("getBankList()", () => {
    test("should successfully retrieve bank list without query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Banks retrieved successfully",
        data: [{ id: 1, name: "Access Bank" }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transaction.getBankList();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/bank-list",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully retrieve bank list with query parameters (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Banks retrieved successfully",
        data: [],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const result = await paymish.transaction.getBankList({ isLive: true });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/bank-list?isLive=true",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Failed to retrieve bank list.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.getBankList({ isLive: "invalid" });
        throw new Error("Expected getBankList to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Failed to retrieve bank list.");
      }
    });
  });

  describe("transactionWithBank()", () => {
    test("should successfully create a transaction with bank (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Bank transaction initiated successfully",
        data: { reference: "TRX_BANK_123" },
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
        businessId: 18,
        customerId: 8,
        channel: "NIBSS",
        amount: 100,
        AccountNumber: "1780004070",
        DestinationInstitutionCode: "999998",
      };

      const result = await paymish.transaction.transactionWithBank(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-bank",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required bank transaction fields are missing", async () => {
      await expect(
        paymish.transaction.transactionWithBank({
          businessId: 18,
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'customerId', 'channel', 'amount', 'AccountNumber', and 'DestinationInstitutionCode' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid bank account details.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.transactionWithBank({
          businessId: 18,
          customerId: 8,
          channel: "NIBSS",
          amount: 100,
          AccountNumber: "1780004070",
          DestinationInstitutionCode: "999998",
        });
        throw new Error("Expected transactionWithBank to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid bank account details.");
      }
    });
  });

  describe("verifyBankDetails()", () => {
    test("should successfully verify bank details (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Account verified successfully",
        data: { accountName: "John Doe", accountNumber: "0051762787" },
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
        DestinationInstitutionCode: "999998",
        AccountNumber: "0051762787",
        isLive: false,
      };

      const result = await paymish.transaction.verifyBankDetails(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/bank-verify",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required fields are missing", async () => {
      await expect(
        paymish.transaction.verifyBankDetails({
          AccountNumber: "0051762787",
        })
      ).rejects.toThrow(
        "Invalid payload: 'DestinationInstitutionCode' and 'AccountNumber' are required to verify bank details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Account resolution failed.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.verifyBankDetails({
          DestinationInstitutionCode: "999998",
          AccountNumber: "0000000000",
        });
        throw new Error("Expected verifyBankDetails to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Account resolution failed.");
      }
    });
  });

  describe("transactionWithUssd()", () => {
    test("should successfully create a transaction with USSD (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "USSD transaction initiated successfully",
        data: { reference: "TRX_USSD_123" },
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
        businessId: 18,
        customerId: 8,
        channel: "USSD",
        amount: 100,
        message: "message",
      };

      const result = await paymish.transaction.transactionWithUssd(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-ussd",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required USSD transaction fields are missing", async () => {
      await expect(
        paymish.transaction.transactionWithUssd({
          businessId: 18,
        })
      ).rejects.toThrow(
        "Invalid payload: 'businessId', 'customerId', 'channel', and 'amount' are required."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid USSD request details.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.transactionWithUssd({
          businessId: 18,
          customerId: 8,
          channel: "USSD",
          amount: 100,
        });
        throw new Error("Expected transactionWithUssd to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid USSD request details.");
      }
    });
  });

  describe("verifyUssdTransaction()", () => {
    test("should successfully verify USSD transaction (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "USSD transaction verified successfully",
        data: { status: "completed" },
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
        ussdTransactionId: "24091010410290301050",
        isLive: false,
      };

      const result = await paymish.transaction.verifyUssdTransaction(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/transaction-with-ussd-verify",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if ussdTransactionId is missing", async () => {
      await expect(paymish.transaction.verifyUssdTransaction({})).rejects.toThrow(
        "Invalid payload: 'ussdTransactionId' is required to verify a USSD transaction."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "USSD transaction not found or invalid ID.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.verifyUssdTransaction({
          ussdTransactionId: "invalid_id",
        });
        throw new Error("Expected verifyUssdTransaction to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("USSD transaction not found or invalid ID.");
      }
    });
  });

  describe("refundTransaction()", () => {
    test("should successfully initiate a transaction refund (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Transaction refund initiated successfully",
        data: { refundReference: "RFD_12345" },
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
        transactionRef: "TXN_waTjNBitbamwNnLuavU1xd",
        amount: 100,
      };

      const result = await paymish.transaction.refundTransaction(payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/refund-transaction",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
          }),
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if transactionRef or amount is missing", async () => {
      await expect(
        paymish.transaction.refundTransaction({
          transactionRef: "TXN_waTjNBitbamwNnLuavU1xd",
        })
      ).rejects.toThrow(
        "Invalid payload: 'transactionRef' and 'amount' are required to refund a transaction."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Transaction cannot be refunded.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.refundTransaction({
          transactionRef: "TXN_waTjNBitbamwNnLuavU1xd",
          amount: 100,
        });
        throw new Error("Expected refundTransaction to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Transaction cannot be refunded.");
      }
    });
  });

  describe("getRefundList()", () => {
    test("should successfully retrieve refund list with required and optional query params (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Refund list retrieved successfully",
        data: [{ id: 1, refundRefId: "RFD_12345", amount: 100 }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const params = {
        businessId: 100,
        limit: 10,
        page: 1,
        status: "completed",
        filterAmount: "gt",
        amount: 50,
      };

      const result = await paymish.transaction.getRefundList(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/refund-list?businessId=100&limit=10&page=1&status=completed&filterAmount=gt&amount=50",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if required query params are missing", async () => {
      await expect(
        paymish.transaction.getRefundList({
          businessId: 100,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId', 'limit', and 'page' are required to retrieve the refund list."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (400 Bad Request)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Invalid query parameters.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.getRefundList({
          businessId: 100,
          limit: 10,
          page: 1,
        });
        throw new Error("Expected getRefundList to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Invalid query parameters.");
      }
    });
  });

  describe("getRefundDetails()", () => {
    test("should successfully retrieve refund details using businessId and reference (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Refund details retrieved successfully",
        data: { refundRefId: "RFD_12345", status: "completed" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const params = {
        businessId: 100,
        reference: "TXN_waTjNBitbamwNnLuavU1xd",
      };

      const result = await paymish.transaction.getRefundDetails(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/refund-details?businessId=100&reference=TXN_waTjNBitbamwNnLuavU1xd",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should successfully retrieve refund details using businessId and refundId (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Refund details retrieved successfully",
        data: { refundRefId: "RFD_12345" },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const params = {
        businessId: 100,
        refundId: "RFD_12345",
      };

      const result = await paymish.transaction.getRefundDetails(params);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/refund-details?businessId=100&refundId=RFD_12345",
        expect.any(Object)
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if businessId is missing or both reference and refundId are missing", async () => {
      await expect(
        paymish.transaction.getRefundDetails({
          businessId: 100,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId' and either 'reference' or 'refundId' are required to retrieve refund details."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Refund not found.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.getRefundDetails({
          businessId: 100,
          refundId: "INVALID_RFD",
        });
        throw new Error("Expected getRefundDetails to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Refund not found.");
      }
    });
  });

  describe("getRefundByReference()", () => {
    test("should successfully retrieve refund details by reference (200 OK)", async () => {
      const mockResponseBody = {
        status: "success",
        message: "Refund details retrieved successfully",
        data: { reference: "REF_98765", amount: 100 },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponseBody),
      });

      const params = {
        businessId: 100,
        reference: "REF_98765",
      };

      const result = await paymish.transaction.getRefundByReference(params);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.paymish.com/api/transaction-service/external/v1/refund-by-reference?businessId=100&reference=REF_98765",
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        })
      );

      expect(result).toEqual(mockResponseBody);
    });

    test("should throw early validation error if businessId or reference is missing", async () => {
      await expect(
        paymish.transaction.getRefundByReference({
          businessId: 100,
        })
      ).rejects.toThrow(
        "Invalid parameters: 'businessId' and 'reference' are required to retrieve refund details by reference."
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw PaymishError when request fails (404 Not Found)", async () => {
      const mockErrorBody = {
        status: "error",
        message: "Refund reference not found.",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: (header) => (header === "content-type" ? "application/json" : null),
        },
        json: jest.fn().mockResolvedValueOnce(mockErrorBody),
      });

      try {
        await paymish.transaction.getRefundByReference({
          businessId: 100,
          reference: "INVALID_REF",
        });
        throw new Error("Expected getRefundByReference to throw PaymishError, but it succeeded.");
      } catch (error) {
        expect(error).toBeInstanceOf(PaymishError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Refund reference not found.");
      }
    });
  });
});
