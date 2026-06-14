"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { EditableAvatar, CropModal } from "@/components/settings-panel"

export default function Signup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [avatar, setAvatar] = useState(null)
  const [cropSrc, setCropSrc] = useState(null)
  const [error, setError] = useState("")
  const { signup, token } = useAuth()
  const router = useRouter()
  const fileRef = useRef(null)

  if (token) {
    router.push("/chat")
    return null
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setCropSrc(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleCrop(dataUrl) {
    setCropSrc(null)
    setAvatar(dataUrl)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    try {
      await signup(username, password, avatar)
      router.push("/chat")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-bg" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form onSubmit={handleSubmit} style={{
        background: "#1a1a1a", padding: "2rem", borderRadius: "8px",
        width: "100%", maxWidth: "360px",
      }}>
        <h1 style={{ marginBottom: "0.25rem", fontSize: "1.5rem", background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HeavenlyChat</h1>
        <p style={{ color: "#999", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Create an account</p>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <EditableAvatar
            avatar={avatar}
            username={username}
            onClick={() => fileRef.current?.click()}
            size={72}
          />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect}
            style={{ display: "none" }} />
        </div>

        <input
          type="text" placeholder="Username" required minLength={3}
          value={username} onChange={e => setUsername(e.target.value)}
          style={{
            width: "100%", padding: "0.7rem", marginBottom: "0.75rem",
            background: "#0f0f0f", border: "1px solid #333", borderRadius: "4px",
            color: "#e5e5e5", fontSize: "0.95rem", outline: "none",
          }}
        />
        <input
          type="password" placeholder="Password" required minLength={4}
          value={password} onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%", padding: "0.7rem", marginBottom: "1.25rem",
            background: "#0f0f0f", border: "1px solid #333", borderRadius: "4px",
            color: "#e5e5e5", fontSize: "0.95rem", outline: "none",
          }}
        />
        <button type="submit" style={{
          width: "100%", padding: "0.7rem", background: "#2563eb", color: "#fff",
          border: "none", borderRadius: "4px", fontSize: "0.95rem", cursor: "pointer",
        }}>
          Sign up
        </button>

        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "1rem", textAlign: "center" }}>
          Already have an account? <Link href="/login" style={{ color: "#2563eb" }}>Log in</Link>
        </p>
      </form>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onCrop={handleCrop}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
