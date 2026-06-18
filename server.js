const http = require("http")
const path = require("path")
const fs = require("fs")

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason)
})
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err)
})

const JWT_SECRET = process.env.JWT_SECRET || "chatweb-secret-key-change-in-production"
const PORT = process.env.PORT || 3000

console.log("[startup] loading db...")
const { createUser, getUserByUsername, updateUsername, updateAvatar, updateTextColor, saveMessage, getRecentMessages, clearMessages, logEvent, getAnalytics, getAnalyticsSummary } = require("./db")

if (!process.env.DATABASE_URL) {
  console.warn("[startup] DATABASE_URL not set — using SQLite (chat.db). Data will be lost on server restart!")
}

console.log("[startup] configuring express...")
const express = require("express")
const { Server } = require("socket.io")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cloudinary = require("cloudinary").v2

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || "dpqwn2gwk",
    api_key: process.env.CLOUD_API_KEY || "871551859617297",
    api_secret: process.env.CLOUD_API_SECRET || "Zd27SS6V0HNVnG8JXZxpXl-VKxc",
  })
}

const app = express()
const server = http.createServer(app)

app.set("env", "production")

const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"], credentials: true },
  pingInterval: 25000,
  pingTimeout: 20000,
})

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") return res.sendStatus(200)
  next()
})
app.use(express.json({ limit: "10mb" }))

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }))

const onlineUsers = {}

setInterval(() => {
  io.to("general").emit("users", Object.values(onlineUsers))
}, 30000)

function verifyToken(authHeader) {
  if (!authHeader) return null
  try {
    const token = authHeader.replace("Bearer ", "")
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function randomTextColor() {
  const h = Math.floor(Math.random() * 360)
  let s = 55 + Math.floor(Math.random() * 25)
  let l = 55 + Math.floor(Math.random() * 20)
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

app.post("/api/signup", async (req, res) => {
  const { username, password, avatar } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" })
  }
  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" })
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" })
  }

  const existing = await getUserByUsername(username)
  if (existing) {
    return res.status(409).json({ error: "Username already taken" })
  }

  let savedAvatar = avatar || null
  if (avatar && avatar.startsWith("data:")) {
    savedAvatar = await saveBase64File(avatar)
  }

  const textColor = randomTextColor()
  const hash = bcrypt.hashSync(password, 10)
  await createUser(username, hash, savedAvatar, textColor)

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" })
  res.json({ token, username, avatar: savedAvatar, textColor })
})

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" })
  }

  const user = await getUserByUsername(username)
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" })
  }

  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" })
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" })
  res.json({ token, username, avatar: user.avatar || null, textColor: user.text_color || '#e5e5e5' })
})

app.post("/api/guest", async (req, res) => {
  try {
    function randomName() {
      const adj = ["Cool", "Wild", "Fast", "Bold", "Shy", "Neon", "Dark", "Lucky", "Sly", "Breezy", "Frost", "Jade", "Pixel", "Storm", "Ember"]
      const noun = ["Fox", "Wolf", "Bear", "Hawk", "Owl", "Panda", "Tiger", "Lynx", "Falcon", "Raven", "Coyote", "Viper", "Badger", "Finch", "Gecko"]
      return `${adj[Math.floor(Math.random() * adj.length)]}_${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 9000 + 1000)}`
    }

    let username
    for (let i = 0; i < 50; i++) {
      const candidate = randomName()
      const existing = await getUserByUsername(candidate)
      if (!existing) { username = candidate; break }
    }
    if (!username) return res.status(500).json({ error: "Could not generate unique username" })

    const textColor = randomTextColor()
    await createUser(username, "", null, textColor)
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" })
    res.json({ token, username, avatar: null, textColor })
  } catch (err) {
    console.error("[api/guest] error:", err)
    res.status(500).json({ error: "Server error: " + err.message })
  }
})

app.get("/api/me", async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  const user = await getUserByUsername(decoded.username)
  if (!user) return res.status(404).json({ error: "User not found" })

  res.json({ username: user.username, avatar: user.avatar || null, textColor: user.text_color || '#e5e5e5' })
})

app.post("/api/update-username", async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  const { newUsername } = req.body
  if (!newUsername || newUsername.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" })
  }

  const existing = await getUserByUsername(newUsername)
  if (existing) {
    return res.status(409).json({ error: "Username already taken" })
  }

  await updateUsername(decoded.username, newUsername)
  const token = jwt.sign({ username: newUsername }, JWT_SECRET, { expiresIn: "7d" })
  res.json({ token, username: newUsername })
})

app.post("/api/update-avatar", async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  let { avatar } = req.body
  if (!avatar) {
    return res.status(400).json({ error: "Avatar data required" })
  }

  if (avatar.startsWith("data:")) {
    avatar = await saveBase64File(avatar)
  }

  await updateAvatar(decoded.username, avatar)
  res.json({ avatar })
})

app.get("/api/messages", async (req, res) => {
  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).json({ error: "Invalid token" })
  }

  res.json(await getRecentMessages())
})

app.post("/api/update-color", async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  const { textColor } = req.body
  if (!textColor || !/^#[0-9a-fA-F]{6}$/.test(textColor)) {
    return res.status(400).json({ error: "Invalid color format. Use hex like #ff6b6b" })
  }

  await updateTextColor(decoded.username, textColor)
  res.json({ textColor })
})

app.post("/api/upload", async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  const { data } = req.body
  if (!data || !data.startsWith("data:")) {
    return res.status(400).json({ error: "Invalid file data" })
  }

  const url = await saveBase64File(data)
  res.json({ url })
})

app.post("/api/track", async (req, res) => {
  try {
    const { site, event_type, path, referrer, extra } = req.body
    if (!site || !event_type) return res.status(400).json({ error: "Missing site or event_type" })
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress
    await logEvent(site, event_type, { path, referrer, ip, userAgent: req.headers["user-agent"], extra })
    res.json({ ok: true })
  } catch (err) {
    console.error("[track] error:", err?.message || err)
    res.status(500).json({ error: "Tracking failed", detail: err?.message || String(err) })
  }
})

app.get("/api/analytics", async (req, res) => {
  const auth = verifyToken(req.headers.authorization)
  if (!auth) return res.status(401).json({ error: "Unauthorized" })
  try {
    const site = req.query.site
    if (!site) return res.status(400).json({ error: "Missing site query param" })
    const summary = await getAnalyticsSummary(site)
    const raw = site === "all" ? null : await getAnalytics(site)
    res.json({ summary, recent: raw })
  } catch (err) {
    console.error("[analytics] error:", err?.message || err)
    res.status(500).json({ error: "Failed to get analytics" })
  }
})

function saveBase64File(dataUrl) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return dataUrl

  const mime = matches[1]
  const buffer = Buffer.from(matches[2], "base64")
  const resourceType = mime.startsWith("video/") ? "video" : "image"
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const result = cloudinary.uploader.upload(`data:${mime};base64,${matches[2]}`, {
    resource_type: resourceType,
    public_id: name,
  })
  return result.then(r => r.secure_url)
}

io.on("connection", async (socket) => {
  let username
  try {
    const token = socket.handshake.auth.token
    if (!token) { socket.disconnect(); return }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      socket.emit("error_message", "token_" + (e.message.includes("expired") ? "expired" : "invalid"))
      socket.disconnect()
      return
    }
    username = decoded.username

    const user = await getUserByUsername(username)
    const avatar = user?.avatar || null
    const textColor = user?.text_color || '#e5e5e5'

    socket.data.username = username
    socket.data.avatar = avatar
    socket.data.textColor = textColor
    onlineUsers[username] = { username, avatar, textColor }
    socket.join("general")

    console.log(`[connect] ${username} connected (${Object.keys(onlineUsers).length} online)`)

    const msgs = await getRecentMessages()
    socket.emit("messages", msgs)

    const userList = Object.values(onlineUsers)
    io.to("general").emit("users", userList)
  } catch (err) {
    const msg = err?.message || String(err)
    console.error("[connection] error:", msg)
    socket.emit("error_message", msg)
    socket.disconnect()
    return
  }

  socket.on("send_message", async (data) => {
    try {
      const type = data?.type || "text"
      const content = data?.content?.trim() || ""
      let media = data?.media || null
      if (type === "text" && !content) return
      if (type !== "text" && !media) return

      if (type === "text" && content === "/clear") {
        if (username !== "mighty_seller") {
          socket.emit("error_message", "Only mighty_seller can clear the chat")
          return
        }
        await clearMessages()
        io.to("general").emit("messages_cleared")
        return
      }

      if (media && media.startsWith("data:")) {
        media = await saveBase64File(media)
      }

      await saveMessage(username, content, type, media)
      const msg = {
        username,
        content,
        type,
        media,
        avatar: socket.data.avatar,
        textColor: socket.data.textColor,
        created_at: new Date().toISOString(),
      }
      io.to("general").emit("new_message", msg)
    } catch (err) {
      console.error("[send_message] error:", err?.message || err)
      socket.emit("error_message", "Failed to send message")
    }
  })

  socket.on("disconnect", (reason) => {
    if (!username) return
    delete onlineUsers[username]
    const userList = Object.values(onlineUsers)
    io.to("general").emit("users", userList)
    console.log(`[disconnect] ${username} disconnected (${reason}) — ${Object.keys(onlineUsers).length} online`)
  })
})

const outDir = path.join(__dirname, "out")
if (fs.existsSync(outDir)) {
  app.use("/_next", express.static(path.join(outDir, "_next"), { maxAge: "1y" }))
  app.use(express.static(outDir, { maxAge: 0 }))
  app.get("/{*any}", (req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path.startsWith("/socket.io/")) return
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    const p = req.path === "/" ? "index.html" : `${req.path}.html`
    const f = path.join(outDir, p)
    if (fs.existsSync(f)) return res.sendFile(f)
    const d = path.join(outDir, req.path, "index.html")
    if (fs.existsSync(d)) return res.sendFile(d)
    res.sendFile(path.join(outDir, "index.html"))
  })
}

app.use((err, req, res, next) => {
  console.error("[error]", err)
  res.status(500).json({ error: "Internal server error" })
})

console.log("[startup] listening on port " + PORT + "...")
server.listen(PORT, () => {
  console.log(`[startup] Server running on http://0.0.0.0:${PORT}`)
})
