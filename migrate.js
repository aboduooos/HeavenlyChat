const Database = require("better-sqlite3")
const path = require("path")
const { Pool } = require("pg")

const local = new Database(path.join(__dirname, "chat.db"))

const pg = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  const users = local.prepare("SELECT * FROM users").all()
  console.log("Users found:", users.length)
  for (const u of users) {
    try {
      await pg.query(
        "INSERT INTO users (username, password_hash, avatar, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING",
        [u.username, u.password_hash, u.avatar, u.created_at]
      )
      console.log("  OK:", u.username)
    } catch (e) {
      console.log("  FAIL:", u.username, e.message)
    }
  }

  const msgs = local.prepare("SELECT * FROM messages ORDER BY id ASC").all()
  console.log("Messages found:", msgs.length)
  let done = 0
  for (const m of msgs) {
    try {
      await pg.query(
        "INSERT INTO messages (username, content, type, media, created_at) VALUES ($1, $2, $3, $4, $5)",
        [m.username, m.content, m.type, m.media, m.created_at]
      )
      done++
    } catch (e) {
      console.log("  FAIL msg", m.id, e.message)
    }
  }
  console.log(`Migrated ${done}/${msgs.length} messages`)
  await pg.end()
  console.log("Migration complete!")
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
