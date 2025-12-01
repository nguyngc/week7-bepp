const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // app.js already connects to DB
const api = supertest(app);
const User = require("../models/userModel");

// Clean the users collection before each test
beforeEach(async () => {
  await User.deleteMany({});
});

describe("User Routes", () => {
  describe("POST /api/users/signup", () => {
    it("✅ should signup a new user with valid credentials", async () => {
      const userData = {
        name: "User 1",
        email: "valid@example.com",
        password: "R3g5T7#gh",
        phone_number: "09-123-47890",
        gender: "F",
        date_of_birth: "1999-01-01",
        membership_status: "Active",
      };

      const result = await api.post("/api/users/signup").send(userData);

      expect(result.status).toBe(201);
      expect(result.body).toHaveProperty("token");

      // Extra check: user is actually saved in DB
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).not.toBeNull();
    });

    it("❌ should return an error with missing required fields", async () => {
      const userData = {
        name: "User 1",
        password: "R3g5T7#gh",
        phone_number: "1234567890",
        gender: "F",
        date_of_birth: "1990-01-01",
        membership_status: "Active",
      };

      const result = await api.post("/api/users/signup").send(userData);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });

    it("❌ should return an error with existing email", async () => {
      // First signup
      await api.post("/api/users/signup").send({
        name: "User 1",
        email: "valid@example.com",
        password: "R3g5T7#gh",
        phone_number: "1234567890",
        gender: "F",
        date_of_birth: "1990-01-01",
        membership_status: "Active",
      });

      // Then signup again with the same email
      const userData = {
        name: "User 1",
        email: "valid@example.com",
        password: "R3g5T7#gh",
        phone_number: "1234567890",
        gender: "F",
        date_of_birth: "1990-01-01",
        membership_status: "Active",
      };

      const result = await api.post("/api/users/signup").send(userData);

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });
  });

  describe("POST /api/users/login", () => {
    it("✅ should login a user with valid credentials", async () => {
      // First signup
      await api.post("/api/users/signup").send({
        name: "User 2",
        email: "login@example.com",
        password: "R3g5T7#gh",
        phone_number: "09-123-47890",
        gender: "F",
        date_of_birth: "1999-01-01",
        membership_status: "Active",
      });

      // Then login
      const result = await api.post("/api/users/login").send({
        email: "login@example.com",
        password: "R3g5T7#gh",
      });

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("token");
    });

    it("❌ should return an error with wrong password", async () => {
      const result = await api.post("/api/users/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(result.status).toBe(400);
      expect(result.body).toHaveProperty("error");
    });
  });
});

// Close DB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
