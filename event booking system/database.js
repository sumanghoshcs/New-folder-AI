const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "eventbooking.db");
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Initialize database schema
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('organizer', 'customer')),
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Events table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          organizer_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          location TEXT NOT NULL,
          total_tickets INTEGER NOT NULL,
          available_tickets INTEGER NOT NULL,
          price REAL NOT NULL,
          status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(organizer_id) REFERENCES users(id)
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          event_id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          number_of_tickets INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(event_id) REFERENCES events(id),
          FOREIGN KEY(customer_id) REFERENCES users(id)
        )
      `);

      // Jobs queue table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('booking_confirmation', 'event_update_notification')),
          payload TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          started_at DATETIME,
          completed_at DATETIME
        )
      `,
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  });
}

// Helper functions
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  run,
  get,
  all,
};
