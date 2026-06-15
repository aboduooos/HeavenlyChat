"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [guestLoading, setGuestLoading] = useState(false)
  const { login, guestLogin, token } = useAuth()
  const router = useRouter()

  if (token) {
    router.push("/chat")
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    try {
      await login(username, password)
      router.push("/chat")
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleGuest() {
    setError("")
    setGuestLoading(true)
    try {
      await guestLogin()
      router.push("/chat")
    } catch (err) {
      setError(err.message)
    }
    setGuestLoading(false)
  }

  return (
    <div className="auth-bg" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form onSubmit={handleSubmit} style={{
        background: "#1a1a1a", padding: "2rem", borderRadius: "8px",
        width: "100%", maxWidth: "360px",
      }}>
        <h1 style={{ marginBottom: "0.25rem", fontSize: "1.5rem", background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HeavenlyChat</h1>
        <p style={{ color: "#999", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Login to your account</p>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
        )}

        <input
          type="text" placeholder="Username" required
          value={username} onChange={e => setUsername(e.target.value)}
          style={{
            width: "100%", padding: "0.7rem", marginBottom: "0.75rem",
            background: "#0f0f0f", border: "1px solid #333", borderRadius: "4px",
            color: "#e5e5e5", fontSize: "0.95rem", outline: "none",
          }}
        />
        <input
          type="password" placeholder="Password" required
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
          Log in
        </button>

        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "1rem", textAlign: "center" }}>
          No account? <Link href="/signup" style={{ color: "#2563eb" }}>Sign up</Link>
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "#333" }} />
          <span style={{ color: "#666", fontSize: "0.8rem" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#333" }} />
        </div>

        <button onClick={handleGuest} disabled={guestLoading} style={{
          width: "100%", marginTop: "1rem", padding: "0.7rem",
          background: "transparent", color: "#93c5fd",
          border: "1px solid #93c5fd", borderRadius: "4px",
          fontSize: "0.95rem", cursor: "pointer", opacity: guestLoading ? 0.6 : 1,
        }}>
          {guestLoading ? "Joining..." : "Join as Visitor"}
        </button>
      </form>
    </div>
  )
}
