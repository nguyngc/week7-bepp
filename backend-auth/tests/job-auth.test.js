const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Express app (already connects to DB)
const api = supertest(app);
const Job = require("../models/jobModel");
const User = require("../models/userModel");

// Seed data
const jobs = [
  {
    title: "Job 1",
    type: "Full-Time",
    description: "Job 1 Description",
    company: {
      name: "Company name",
      contactEmail: "email@outlook.com",
      contactPhone: "01234566"
    }
  },
  {
    title: "Job 2",
    type: "Full-Time",
    description: "Job 2 Description",
    company: {
      name: "Company name",
      contactEmail: "email@outlook.com",
      contactPhone: "01234566"
    }
  },
];

let token = null;

// Create a user and get a token before all tests
beforeAll(async () => {
  await User.deleteMany({});
  const result = await api.post("/api/users/signup").send({
    name: "John Doe",
    email: "john@example.com",
    password: "R3g5T7#gh",
    phone_number: "1234567890",
    gender: "Male",
    date_of_birth: "1990-01-01",
    membership_status: "Inactive",
  });
  token = result.body.token;
});

describe("Protected Job Routes", () => {
  beforeEach(async () => {
    await Job.deleteMany({});
    await Promise.all([
      api.post("/api/jobs").set("Authorization", "Bearer " + token).send(jobs[0]),
      api.post("/api/jobs").set("Authorization", "Bearer " + token).send(jobs[1]),
    ]);
  });

  // ---------------- GET ----------------
  it("should return all jobs as JSON when GET /api/jobs is called", async () => {
    const response = await api
      .get("/api/jobs")
      .set("Authorization", "Bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
  });


  // ---------------- POST ----------------
  it("should create one job when POST /api/jobs is called", async () => {
    const newJob = {
    title: "Job 1",
    type: "Full-Time",
    description: "Job 1 Description",
    company: {
      name: "Company name",
      contactEmail: "email@outlook.com",
      contactPhone: "01234566"
    }
  };
    const response = await api
      .post("/api/jobs")
      .set("Authorization", "Bearer " + token)
      .send(newJob)
      .expect(201);

    expect(response.body.title).toBe(newJob.title);
  });

  // ---------------- GET by ID ----------------
  it("should return one job by ID", async () => {
    const job = await Job.findOne();
    const response = await api
      .get(`/api/jobs/${job._id}`)
      .set("Authorization", "Bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(job.title);
  });

  // ---------------- PUT ----------------
  it("should update one job by ID", async () => {
    const job = await Job.findOne();
    const updatedJob = { title: "Updated job information."};

    const response = await api
      .put(`/api/jobs/${job._id}`)
      .set("Authorization", "Bearer " + token)
      .send(updatedJob)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(updatedJob.title);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.title).toBe(updatedJob.title);
  });

  // ---------------- DELETE ----------------
  it("should delete one job by ID", async () => {
    const job = await Job.findOne();
    await api
      .delete(`/api/jobs/${job._id}`)
      .set("Authorization", "Bearer " + token)
      .expect(204);

    const jobCheck = await Job.findById(job._id);
    expect(jobCheck).toBeNull();
  });
});

// Close DB connection once after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
