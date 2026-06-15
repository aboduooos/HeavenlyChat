const path = require("path")

let db

if (process.env.DATABASE_URL) {
  const { Pool } = require("pg")
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  db = {
    async run(sql, params = []) {
      const client = await pool.connect()
      try { return await client.query(sql, params) }
      finally { client.release() }
    },
    async get(sql, params = []) {
      const client = await pool.connect()
      try {
        const r = await client.query(sql, params)
        return r.rows[0] || null
      } finally { client.release() }
    },
    async all(sql, params = []) {
      const client = await pool.connect()
      try {
        const r = await client.query(sql, params)
        return r.rows
      } finally { client.release() }
    },
    async exec(sql) {
      const client = await pool.connect()
      try { return await client.query(sql) }
      finally { client.release() }
    },
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      text_color VARCHAR(7) DEFAULT '#e5e5e5',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      type VARCHAR(50) NOT NULL DEFAULT 'text',
      media TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
  `)
  try { db.exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#e5e5e5'`) } catch (e) {}
} else {
  const Database = require("better-sqlite3")
  db = new Database(path.join(__dirname, "chat.db"))

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      text_color TEXT DEFAULT '#e5e5e5',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'text',
      media TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username);
  `)

  try { db.exec("ALTER TABLE users ADD COLUMN avatar TEXT") } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN text_color TEXT DEFAULT '#e5e5e5'") } catch (e) {}
  try { db.exec("ALTER TABLE messages ADD COLUMN type TEXT NOT NULL DEFAULT 'text'") } catch (e) {}
  try { db.exec("ALTER TABLE messages ADD COLUMN media TEXT") } catch (e) {}
}

async function createUser(username, passwordHash, avatar, textColor) {
  if (process.env.DATABASE_URL) {
    const r = await db.run("INSERT INTO users (username, password_hash, avatar, text_color) VALUES ($1, $2, $3, $4)", [username, passwordHash, avatar || null, textColor || '#e5e5e5'])
    return r
  } else {
    const stmt = db.prepare("INSERT INTO users (username, password_hash, avatar, text_color) VALUES (?, ?, ?, ?)")
    return stmt.run(username, passwordHash, avatar || null, textColor || '#e5e5e5')
  }
}

async function getUserByUsername(username) {
  if (process.env.DATABASE_URL) {
    return await db.get("SELECT * FROM users WHERE username = $1", [username])
  } else {
    return db.prepare("SELECT * FROM users WHERE username = ?").get(username)
  }
}

async function updateUsername(oldUsername, newUsername) {
  if (process.env.DATABASE_URL) {
    return await db.run("UPDATE users SET username = $1 WHERE username = $2", [newUsername, oldUsername])
  } else {
    const stmt = db.prepare("UPDATE users SET username = ? WHERE username = ?")
    return stmt.run(newUsername, oldUsername)
  }
}

async function updateAvatar(username, avatar) {
  if (process.env.DATABASE_URL) {
    return await db.run("UPDATE users SET avatar = $1 WHERE username = $2", [avatar, username])
  } else {
    const stmt = db.prepare("UPDATE users SET avatar = ? WHERE username = ?")
    return stmt.run(avatar, username)
  }
}

async function updateTextColor(username, textColor) {
  if (process.env.DATABASE_URL) {
    return await db.run("UPDATE users SET text_color = $1 WHERE username = $2", [textColor, username])
  } else {
    const stmt = db.prepare("UPDATE users SET text_color = ? WHERE username = ?")
    return stmt.run(textColor, username)
  }
}

async function saveMessage(username, content, type = "text", media = null) {
  if (process.env.DATABASE_URL) {
    return await db.run("INSERT INTO messages (username, content, type, media) VALUES ($1, $2, $3, $4)", [username, content, type, media])
  } else {
    const stmt = db.prepare("INSERT INTO messages (username, content, type, media) VALUES (?, ?, ?, ?)")
    stmt.run(username, content, type, media)
  }
}

async function getRecentMessages() {
  if (process.env.DATABASE_URL) {
    return await db.all(`
      SELECT m.id, m.username, m.content, m.type, m.media, m.created_at, u.avatar, u.text_color AS "textColor"
      FROM messages m
      LEFT JOIN users u ON m.username = u.username
      ORDER BY m.created_at ASC
    `)
  } else {
    return db.prepare(`
      SELECT m.id, m.username, m.content, m.type, m.media, m.created_at, u.avatar, u.text_color AS "textColor"
      FROM messages m
      LEFT JOIN users u ON m.username = u.username
      ORDER BY m.created_at ASC
    `).all()
  }
}

async function clearMessages() {
  if (process.env.DATABASE_URL) {
    return await db.run("DELETE FROM messages")
  } else {
    db.exec("DELETE FROM messages")
  }
}

module.exports = { createUser, getUserByUsername, updateUsername, updateAvatar, updateTextColor, saveMessage, getRecentMessages, clearMessages }
