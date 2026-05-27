import db from './db.js'

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      display_name  TEXT NOT NULL UNIQUE,
      city          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id            TEXT PRIMARY KEY,
      user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
      decision_text TEXT NOT NULL,
      category      TEXT,
      impact_level  TEXT,
      co2_kg        REAL,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_co2 (
      id          TEXT PRIMARY KEY,
      user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
      decision_id TEXT REFERENCES decisions(id) ON DELETE CASCADE,
      co2_saved   REAL,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS badges (
      id        TEXT PRIMARY KEY,
      user_id   TEXT REFERENCES users(id) ON DELETE CASCADE,
      badge_id  TEXT NOT NULL,
      earned_at TEXT DEFAULT (datetime('now')),
      UNIQUE (user_id, badge_id)
    );

    CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_saved_co2_user ON saved_co2(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_badges_user    ON badges(user_id);
  `)
}
