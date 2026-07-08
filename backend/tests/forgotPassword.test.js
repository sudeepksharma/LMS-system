require("dotenv").config();

const request = require("supertest");
const app = require("../src/app");

jest.mock("../src/services/user.service", () => ({
  findUserByEmail: jest.fn(),
}));

jest.mock("../src/config/db", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

jest.mock("../src/queues/email.queue", () => ({
  addEmailJob: jest.fn().mockResolvedValue(true),
}));

const { findUserByEmail } = require("../src/services/user.service");

describe("Forgot Password API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should never expose resetLink in response", async () => {
    findUserByEmail.mockResolvedValue({
      id: 1,
      name: "John",
      email: "john@test.com",
    });

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "john@test.com",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.resetLink).toBeUndefined();

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
      })
    );
  });
});