"use client"
import { useState, useRef } from "react"
import { useAuth, SERVER } from "@/context/auth-context"

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const { token } = useAuth()

  function handleSubmit(e) {
    e.preventDefault()
    if (text.trim() === "") return
    onSend({ type: "text", content: text.trim() })
    setText("")
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large (max 10MB)")
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const res = await fetch(`${SERVER}/api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: ev.target.result }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        const type = file.type.startsWith("video/") ? "video" : "image"
        onSend({ type, content: "", media: data.url })
      } catch (err) {
        alert("Upload failed: " + err.message)
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex", gap: "0.5rem", padding: "0.75rem",
      borderTop: "1px solid #2a2a2a", boxSizing: "border-box",
    }}>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
        padding: "0.6rem 0.7rem", borderRadius: "6px",
        background: uploading ? "#1a1a1a" : "#2a2a2a", color: "#ccc", border: "none",
        cursor: uploading ? "default" : "pointer", fontSize: "1rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, opacity: uploading ? 0.5 : 1,
      }}>
        {uploading ? (
          <span style={{ fontSize: "0.8rem" }}>...</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile}
        style={{ display: "none" }} />
      <input
        type="text" placeholder="Type a message..." value={text}
        onChange={e => setText(e.target.value)}
        style={{
          flex: 1, padding: "0.6rem 0.8rem", borderRadius: "6px",
          background: "#0f0f0f", border: "1px solid #333", color: "#e5e5e5",
          fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
        }}
      />
      <button type="submit" style={{
        background: "#93c5fd", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0", flexShrink: 0, width: "36px", height: "36px",
        borderRadius: "50%", alignSelf: "center",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginLeft: "3px" }}>
          <polygon points="5,3 19,12 5,21" fill="#fff" />
        </svg>
      </button>
    </form>
  )
}
