"use client"
import { useState, useEffect, useRef } from "react"
import { useAuth, SERVER } from "@/context/auth-context"

export default function GifPicker({ onSelect, onClose }) {
  const [gifs, setGifs] = useState([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    fetch(`${SERVER}/api/gifs/trending`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      if (data.error === "missing_key") {
        setError("missing_key")
      } else {
        setGifs(data.gifs || [])
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [token])

  async function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    try {
      const r = await fetch(`${SERVER}/api/gifs/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await r.json()
      if (data.error === "missing_key") {
        setError("missing_key")
      } else {
        setGifs(data.gifs || [])
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div style={{
      position: "absolute", bottom: "100%", left: 0, right: 0,
      background: "#1a1a1a", border: "1px solid #333", borderRadius: "10px 10px 0 0",
      overflow: "hidden", zIndex: 200, display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", borderBottom: "1px solid #333" }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
          <input ref={inputRef} type="text" placeholder="Search GIFs..." value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, padding: "0.4rem 0.6rem", borderRadius: "6px",
              background: "#0f0f0f", border: "1px solid #444", color: "#e5e5e5",
              fontSize: "0.85rem", outline: "none",
            }}
          />
          <button type="submit" style={{
            padding: "0.4rem 0.7rem", borderRadius: "6px", background: "#2563eb",
            color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem",
          }}>Search</button>
        </form>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#999", cursor: "pointer",
          fontSize: "1.2rem", padding: "0.2rem",
        }}>✕</button>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px",
        padding: "4px", maxHeight: "300px", overflowY: "auto",
      }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "2rem" }}>Loading...</div>
        ) : error === "missing_key" ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#f87171", padding: "1rem", fontSize: "0.85rem", lineHeight: 1.5 }}>
            GIPHY API key not set.<br />
            Add <b>GIPHY_API_KEY</b> in Render env vars.<br /><br />
            Get a free key at<br />
            <span style={{ color: "#93c5fd" }}>developers.giphy.com</span><br />
            (takes 2 min, free tier)
          </div>
        ) : gifs.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "2rem" }}>No GIFs found</div>
        ) : gifs.map(g => (
          <img key={g.id} src={g.preview} alt={g.title || "GIF"}
            onClick={() => onSelect(g.url)}
            style={{
              width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "4px",
              cursor: "pointer", background: "#0f0f0f",
            }}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  )
}
