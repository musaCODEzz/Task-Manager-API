// db.js
const Database = require("better-sqlite3");

// Create or open the SQLite database
const db = new Database("database.sqlite");

// Create tasks table if it doesn’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`).run();

module.exports = db;
