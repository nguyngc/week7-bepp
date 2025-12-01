const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Express app (already connects to DB)
const api = supertest(app);
const Job = require("../models/jobModel");

// Seed data for tests
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

// Reset the jobs collection before each test
beforeEach(async () => {
  await Job.deleteMany({});
  await Job.insertMany(jobs);
});

// ---------------- GET ----------------
describe("GET /api/jobs", () => {
  it("should return all jobs as JSON", async () => {
    const response = await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
    expect(response.body[0].title).toBe(jobs[0].title);
  });
});

describe("GET /api/jobs/:id", () => {
  it("should return one job by ID", async () => {
    const job = await Job.findOne();
    const response = await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(job.title);
  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });
});
// ---------------- POST ----------------
describe("POST /api/jobs", () => {
  it("should create a new job", async () => {
    const newJob ={
    title: "Job 3",
    type: "Full-Time",
    description: "Job 3 Description",
    company: {
      name: "Company name",
      contactEmail: "email@outlook.com",
      contactPhone: "01234566"
    }
  };

    const response = await api
      .post("/api/jobs")
      .send(newJob)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(newJob.title);

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
  });
});

// ---------------- PUT ----------------
describe("PUT /api/jobs/:id", () => {
  it("should update a job with partial data", async () => {
    const job = await Job.findOne();
    const updatedJob = { title: "Updated title" };

    const response = await api
      .put(`/api/jobs/${job._id}`)
      .send(updatedJob)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.info).toBe(updatedJob.info);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.title).toBe(updatedJob.title);
  });

  it("should return 400 for invalid job ID", async () => {
    const invalidId = "12345"; // invalid format, not a valid ObjectId
    await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
  });
});

// ---------------- DELETE ----------------
describe("DELETE /api/jobs/:id", () => {
  it("should delete a job by ID", async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`).expect(204);

    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();
  });

  it("should return 400 for invalid job ID", async () => {
    const invalidId = "12345"; // invalid format
    await api.delete(`/api/jobs/${invalidId}`).expect(400);
  });
});


// Close DB connection once after all tests in this file
afterAll(async () => {
  await mongoose.connection.close();
});


