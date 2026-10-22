const Paymish = require("../index");
const { PaymishError } = require("../src/errors");

describe("Dispute Module - createDispute()", () => {
  let paymish;

  beforeEach(() => {
    paymish = new Paymish();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should successfully create a dispute with payload object (200 OK)", async () => {
    const mockResponseBody = {
      message: "Create dispute successfully",
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
      transactionRef: "PM-TXN-123",
      disputeReason: "Unauthorized charge",
      disputeDescription: "Customer did not recognize this transaction.",
    };

    const authHeaders = { Authorization: "Bearer sk_test_secret_key" };
    const result = await paymish.dispute.createDispute(payload, {
      headers: authHeaders,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paymish.com/api/dispute-service/external/v1/create-dispute",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_secret_key",
          "Idempotency-Key": expect.stringMatching(/^sdk_auto_/),
        }),
        body: expect.any(FormData),
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual(mockResponseBody);
  });

  test("should throw early validation error if required dispute fields are missing", async () => {
    await expect(
      paymish.dispute.createDispute({
        transactionRef: "PM-TXN-123",
      })
    ).rejects.toThrow(
      "Invalid payload: 'transactionRef', 'disputeReason', and 'disputeDescription' are required."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
