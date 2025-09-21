const request = require("supertest");
const { expect } = require("chai");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

// We recreate the app here instead of importing index.js
// (so tests don’t start the server twice)
function createApp() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  const db = new sqlite3.Database(":memory:"); // in-memory DB for tests

  db.serialize(() => {
    db.run(`CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0
    )`);
  });

  // Routes
  app.get("/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(rows);
    });
  });

  app.post("/tasks", (req, res) => {
    const { title } = req.body;
    db.run("INSERT INTO tasks (title) VALUES (?)", [title], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, title, done: 0 });
    });
  });

  app.put("/tasks/:id", (req, res) => {
    const { done } = req.body;
    db.run("UPDATE tasks SET done = ? WHERE id = ?", [done, req.params.id], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updated: this.changes });
    });
  });

  app.delete("/tasks/:id", (req, res) => {
    db.run("DELETE FROM tasks WHERE id = ?", req.params.id, function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });

  return app;
}

describe("Tasks API", () => {
  let app;
  beforeEach(() => {
    app = createApp();
  });

  it("should add a new task", async () => {
    const res = await request(app).post("/tasks").send({ title: "Test Task" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("id");
    expect(res.body.title).to.equal("Test Task");
    expect(res.body.done).to.equal(0);
  });

  it("should fetch all tasks", async () => {
    await request(app).post("/tasks").send({ title: "Task 1" });
    await request(app).post("/tasks").send({ title: "Task 2" });

    const res = await request(app).get("/tasks");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.equal(2);
  });

  it("should update a task", async () => {
    const task = await request(app).post("/tasks").send({ title: "Update Me" });
    const id = task.body.id;

    const res = await request(app).put(`/tasks/${id}`).send({ done: 1 });
    expect(res.status).to.equal(200);
    expect(res.body.updated).to.equal(1);
  });

  it("should delete a task", async () => {
    const task = await request(app).post("/tasks").send({ title: "Delete Me" });
    const id = task.body.id;

    const res = await request(app).delete(`/tasks/${id}`);
    expect(res.status).to.equal(200);
    expect(res.body.deleted).to.equal(1);
  });
});
