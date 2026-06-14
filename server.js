const express = require("express")
const http = require("http")
const path = require("path")
const fs = require("fs")
const cors = require("cors")
const { Server } = require("socket.io")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { createUser, getUserByUsername, updateUsername, updateAvatar, saveMessage, getRecentMessages, clearMessages } = require("./db")

const JWT_SECRET = process.env.JWT_SECRET || (() => { console.warn("WARNING: using default JWT_SECRET, set JWT_SECRET env var"); return "chatweb-secret-key-change-in-production" })()
const PORT = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)

const io = new Server(server, { cors: { origin: true, methods: ["GET", "POST"] } })

app.use(cors())
app.use(express.json({ limit: "10mb" }))

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }))

const onlineUsers = {}

function verifyToken(authHeader) {
  if (!authHeader) return null
  try {
    const token = authHeader.replace("Bearer ", "")
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
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
    savedAvatar = saveBase64File(avatar)
  }

  const hash = bcrypt.hashSync(password, 10)
  await createUser(username, hash, savedAvatar)

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" })
  res.json({ token, username, avatar: savedAvatar })
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
  res.json({ token, username, avatar: user.avatar || null })
})

app.get("/api/me", async (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  const user = await getUserByUsername(decoded.username)
  if (!user) return res.status(404).json({ error: "User not found" })

  res.json({ username: user.username, avatar: user.avatar || null })
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
    avatar = saveBase64File(avatar)
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

app.post("/api/upload", (req, res) => {
  const decoded = verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: "Invalid token" })

  const { data } = req.body
  if (!data || !data.startsWith("data:")) {
    return res.status(400).json({ error: "Invalid file data" })
  }

  const url = saveBase64File(data)
  res.json({ url })
})

function saveBase64File(dataUrl) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) return dataUrl

  const ext = matches[1].split("/")[1] || "bin"
  const buffer = Buffer.from(matches[2], "base64")
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = path.join(uploadsDir, name)
  fs.writeFileSync(filePath, buffer)
  return `/uploads/${name}`
}

io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token
  if (!token) {
    socket.disconnect()
    return
  }

  let username
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    username = decoded.username
  } catch {
    socket.disconnect()
    return
  }

  const user = await getUserByUsername(username)
  const avatar = user?.avatar || null

  socket.data.username = username
  socket.data.avatar = avatar
  onlineUsers[username] = { username, avatar }
  socket.join("general")

  socket.emit("messages", await getRecentMessages())

  const userList = Object.values(onlineUsers)
  io.to("general").emit("users", userList)

  socket.on("send_message", async (data) => {
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
      media = saveBase64File(media)
    }

    await saveMessage(username, content, type, media)
    const msg = {
      username,
      content,
      type,
      media,
      avatar,
      created_at: new Date().toISOString(),
    }
    io.to("general").emit("new_message", msg)
  })

  socket.on("disconnect", () => {
    delete onlineUsers[username]
    const userList = Object.values(onlineUsers)
    io.to("general").emit("users", userList)
  })
})

const outDir = path.join(__dirname, "out")
if (fs.existsSync(outDir)) {
  app.use(express.static(outDir, { maxAge: "1y", index: false }))
  app.get("/{*path}", (req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path.startsWith("/socket.io/")) return
    const p = req.path === "/" ? "index.html" : `${req.path}.html`
    const f = path.join(outDir, p)
    if (fs.existsSync(f)) return res.sendFile(f)
    const d = path.join(outDir, req.path, "index.html")
    if (fs.existsSync(d)) return res.sendFile(d)
    res.sendFile(path.join(outDir, "index.html"))
  })
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
