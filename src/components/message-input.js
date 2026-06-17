"use client"
import { useState, useRef, useCallback } from "react"
import { useAuth, SERVER } from "@/context/auth-context"
import GifPicker from "./gif-picker"

export default function MessageInput({ onSend, onGifOpen }) {
  const [uploading, setUploading] = useState(false)
  const [showGifs, setShowGifs] = useState(false)
  const fileRef = useRef(null)
  const inputRef = useRef(null)
  const { token } = useAuth()

  const sendText = useCallback(() => {
    const text = (inputRef.current?.textContent || "").trim()
    if (!text) return
    onSend({ type: "text", content: text })
    if (inputRef.current) inputRef.current.textContent = ""
  }, [onSend])

  const uploadFile = useCallback(async (file) => {
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
  }, [token, onSend])

  function handleGifSelect(url) {
    setShowGifs(false)
    onSend({ type: "image", content: "", media: url })
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendText()
    }
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) { uploadFile(file); return }
      }
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadFile(file)
    e.target.value = ""
  }

  return (
    <div style={{
      display: "flex", gap: "0.5rem", padding: "0.75rem",
      borderTop: "1px solid #2a2a2a", boxSizing: "border-box",
      position: "relative",
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
      <button type="button" onClick={() => onGifOpen ? onGifOpen() : setShowGifs(v => !v)} style={{
        padding: "0.6rem 0.7rem", borderRadius: "6px",
        background: "#2a2a2a", color: "#ccc", border: "none",
        cursor: "pointer", fontSize: "1rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>GIF</span>
      </button>
      {!onGifOpen && showGifs && <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifs(false)} />}
      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile}
        style={{ display: "none" }} />
      <div ref={inputRef} contentEditable
        onKeyDown={handleKeyDown} onPaste={handlePaste}
        onInput={() => {
          const el = inputRef.current
          if (!el) return
          if (el.textContent || el.children.length > 0) {
            el.dataset.active = "true"
          } else {
            delete el.dataset.active
          }
        }}
        data-placeholder="Type a message..."
        style={{
          flex: 1, padding: "0.6rem 0.8rem", borderRadius: "6px",
          background: "#0f0f0f", border: "1px solid #333", color: "#e5e5e5",
          fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
          cursor: "text", whiteSpace: "pre-wrap", wordBreak: "break-word",
          minHeight: "36px", maxHeight: "120px", overflowY: "auto",
        }}
      />
      <style>{`
        div[contenteditable]:not([data-active]):before {
          content: attr(data-placeholder);
          color: #666;
          pointer-events: none;
        }
      `}</style>
      <button type="button" onClick={sendText} style={{
        background: "#93c5fd", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0", flexShrink: 0, width: "36px", height: "36px",
        borderRadius: "50%", alignSelf: "center",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginLeft: "3px" }}>
          <polygon points="5,3 19,12 5,21" fill="#fff" />
        </svg>
      </button>
    </div>
  )
}
