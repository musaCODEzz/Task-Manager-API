const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("static")); // serve frontend files

// Determine database path (local or Docker)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "db", "tasks.db");

// Database
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error("Database connection error:", err.message);
  else console.log(`Connected to SQLite database at ${DB_PATH}`);
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER DEFAULT 0
)`, (err) => {
  if (err) console.error("Table creation error:", err.message);
});

// Routes
// Get all tasks
app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

// Add task
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  db.run("INSERT INTO tasks (title) VALUES (?)", [title], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, title, done: 0 });
  });
});

// Update task
app.put("/tasks/:id", (req, res) => {
  const { done } = req.body;
  db.run("UPDATE tasks SET done = ? WHERE id = ?", [done, req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
