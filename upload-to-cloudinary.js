const cloudinary = require("cloudinary").v2
const fs = require("fs")
const path = require("path")
const Database = require("better-sqlite3")

cloudinary.config({
  cloud_name: "dpqwn2gwk",
  api_key: "871551859617297",
  api_secret: "Zd27SS6V0HNVnG8JXZxpXl-VKxc",
})

const db = new Database(path.join(__dirname, "chat.db"))
const uploadsDir = path.join(__dirname, "uploads")
const files = fs.readdirSync(uploadsDir)

async function upload() {
  for (const file of files) {
    const filePath = path.join(uploadsDir, file)
    const ext = path.extname(file).slice(1)
    const resourceType = ["mp4", "webm", "mov"].includes(ext) ? "video" : "image"
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        public_id: path.parse(file).name,
      })
      const oldUrl = `/uploads/${file}`
      const newUrl = result.secure_url
      console.log(`${file} -> ${newUrl}`)
      db.prepare("UPDATE messages SET media = ? WHERE media = ?").run(newUrl, oldUrl)
      db.prepare("UPDATE users SET avatar = ? WHERE avatar = ?").run(newUrl, oldUrl)
    } catch (e) {
      console.log(`FAIL ${file}: ${e.message}`)
    }
  }
  console.log("Done!")
}

upload()
