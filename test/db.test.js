const { expect } = require("chai");
const Database = require("better-sqlite3");

describe("Database Tests", () => {
  let db;

  // Setup: use in-memory database for each test
  beforeEach(() => {
    db = new Database(":memory:"); // in-memory SQLite
    db.prepare(`
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER DEFAULT 0
      )
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it("should insert a new task", () => {
    const stmt = db.prepare("INSERT INTO tasks (title) VALUES (?)");
    const result = stmt.run("Test Task");

    expect(result.changes).to.equal(1); // one row inserted
    expect(result.lastInsertRowid).to.be.a("number");
  });

  it("should fetch all tasks", () => {
    db.prepare("INSERT INTO tasks (title) VALUES (?)").run("Task 1");
    db.prepare("INSERT INTO tasks (title) VALUES (?)").run("Task 2");

    const tasks = db.prepare("SELECT * FROM tasks").all();

    expect(tasks).to.be.an("array").with.lengthOf(2);
    expect(tasks[0]).to.have.property("title");
  });

  it("should update a task", () => {
    const insert = db.prepare("INSERT INTO tasks (title) VALUES (?)");
    const { lastInsertRowid } = insert.run("Incomplete Task");

    const update = db.prepare("UPDATE tasks SET done = ? WHERE id = ?");
    const result = update.run(1, lastInsertRowid);

    expect(result.changes).to.equal(1);

    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(lastInsertRowid);
    expect(updatedTask.done).to.equal(1);
  });

  it("should delete a task", () => {
    const insert = db.prepare("INSERT INTO tasks (title) VALUES (?)");
    const { lastInsertRowid } = insert.run("Delete Me");

    const del = db.prepare("DELETE FROM tasks WHERE id = ?");
    const result = del.run(lastInsertRowid);

    expect(result.changes).to.equal(1);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(lastInsertRowid);
    expect(task).to.be.undefined;
  });
});
