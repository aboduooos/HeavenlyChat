const Database = require("better-sqlite3")
const path = require("path")
const { Pool } = require("pg")

const local = new Database(path.join(__dirname, "chat.db"))
const pg = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
})

async function sync() {
  // Update avatar URLs in PostgreSQL from SQLite
  const users = local.prepare("SELECT username, avatar FROM users WHERE avatar LIKE '/uploads/%' OR avatar LIKE 'https://res.cloudinary.com/%'").all()
  for (const u of users) {
    await pg.query("UPDATE users SET avatar = $1 WHERE username = $2", [u.avatar, u.username])
    console.log("User avatar:", u.username, "->", u.avatar?.slice(0, 40))
  }

  // Update media URLs in PostgreSQL from SQLite
  const msgs = local.prepare("SELECT id, media FROM messages WHERE media LIKE '/uploads/%' OR media LIKE 'https://res.cloudinary.com/%'").all()
  for (const m of msgs) {
    await pg.query("UPDATE messages SET media = $1 WHERE id = $2", [m.media, m.id])
  }
  console.log("Synced", msgs.length, "messages")

  await pg.end()
  console.log("Done!")
}

sync().catch(e => { console.error(e); process.exit(1) })
