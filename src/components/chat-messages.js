"use client"
import { useEffect, useRef, useState, useLayoutEffect } from "react"
import { AvatarCircle } from "@/components/settings-panel"
import { SERVER } from "@/context/auth-context"

function fullUrl(path) {
  if (!path) return path
  if (path.startsWith("/uploads/")) return SERVER + path
  return path
}

export default function ChatMessages({ messages, username }) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const sentinelRef = useRef(null)
  const [displayCount, setDisplayCount] = useState(50)
  const [preview, setPreview] = useState(null)
  const loadingRef = useRef(false)
  const prevScrollHeightRef = useRef(0)

  useEffect(() => {
    if (messages.length === 0) {
      setDisplayCount(50)
    }
  }, [messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && displayCount < messages.length && !loadingRef.current) {
        loadingRef.current = true
        prevScrollHeightRef.current = container.scrollHeight
        setDisplayCount(prev => Math.min(prev + 50, messages.length))
      }
    }, { root: container, rootMargin: "200px 0px 0px 0px" })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [displayCount, messages.length])

  useLayoutEffect(() => {
    if (prevScrollHeightRef.current > 0) {
      const container = containerRef.current
      if (container) {
        container.scrollTop += container.scrollHeight - prevScrollHeightRef.current
      }
      prevScrollHeightRef.current = 0
    }
    loadingRef.current = false
  })

  const visibleMessages = messages.slice(-displayCount)

  function renderContent(m, asymmetric) {
    if (m.type === "image") {
      return <img src={fullUrl(m.media)} alt="" style={{
        maxWidth: "260px", maxHeight: "260px", borderRadius: "10px",
        display: "block", cursor: "pointer", objectFit: "contain",
      }} onClick={(e) => { e.stopPropagation(); setPreview(m) }} />
    }
    if (m.type === "video") {
      return <video src={fullUrl(m.media)} controls style={{
        maxWidth: "260px", maxHeight: "260px", borderRadius: "10px", display: "block",
      }} />
    }
    const urlRegex = /(https?:\/\/[^\s<]+)/g
    const parts = m.content.split(urlRegex)
    const imgExt = /\.(gif|png|jpe?g|webp|bmp)(\?.*)?$/i
    return <div style={{
      background: m.username === username ? "#2563eb" : "#2a2a2a",
      color: m.username === username ? "#fff" : "#e5e5e5",
      padding: "0.45rem 0.85rem",
      borderRadius: asymmetric
        ? (m.username === username ? "14px 14px 4px 14px" : "14px 14px 14px 4px")
        : "14px",
      fontSize: "0.9rem",
      lineHeight: 1.4,
      wordBreak: "break-word",
    }}>
      {parts.map((part, i) => {
        if (part.startsWith("http") && imgExt.test(part)) {
          return <img key={i} src={part} alt="" loading="lazy" style={{
            maxWidth: "260px", maxHeight: "260px", borderRadius: "8px",
            display: "block", marginTop: "0.25rem", cursor: "pointer",
          }} onClick={(e) => { e.stopPropagation(); setPreview({ type: "image", media: part }) }} />
        }
        if (part.startsWith("http")) {
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", textDecoration: "underline" }}>{part}</a>
        }
        return part
      })}
    </div>
  }

  return (
    <div ref={containerRef} className="chat-bg" style={{
      flex: 1, padding: "0.75rem", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "0.2rem",
    }}>
      {displayCount < messages.length && (
        <div ref={sentinelRef} style={{ height: 1, flexShrink: 0 }} />
      )}

      {visibleMessages.map((m, i) => {
        const isMine = m.username === username
        const next = i < visibleMessages.length - 1 ? visibleMessages[i + 1] : null
        const prev = i > 0 ? visibleMessages[i - 1] : null
        const sameAsNext = next && next.username === m.username
        const sameAsPrev = prev && prev.username === m.username
        const showAvatar = !sameAsNext
        const showName = !sameAsPrev
        return (
          <div key={m.id || i} style={{
            display: "flex",
            justifyContent: isMine ? "flex-end" : "flex-start",
            gap: "0.5rem",
            alignItems: "flex-end",
            marginTop: sameAsPrev ? "0.05rem" : "0.4rem",
          }}>
            {!isMine && showAvatar && (
              <div onClick={() => m.avatar && setPreview(m)} style={{ cursor: m.avatar ? "pointer" : "default", lineHeight: 0 }}>
                <AvatarCircle avatar={fullUrl(m.avatar)} username={m.username} size={28} />
              </div>
            )}
            {!isMine && !showAvatar && <div style={{ width: 28, flexShrink: 0 }} />}
            <div style={{ maxWidth: "75%" }}>
              {!isMine && showName && (
                <p style={{ color: m.textColor || "#888", fontSize: "0.7rem", marginBottom: "0.1rem", marginLeft: "0.25rem" }}>
                  {m.username}
                </p>
              )}
              {renderContent(m, showAvatar)}
            </div>
            {isMine && showAvatar && (
              <div onClick={() => m.avatar && setPreview(m)} style={{ cursor: m.avatar ? "pointer" : "default", lineHeight: 0 }}>
                <AvatarCircle avatar={fullUrl(m.avatar)} username={m.username} size={28} />
              </div>
            )}
            {isMine && !showAvatar && <div style={{ width: 28, flexShrink: 0 }} />}
          </div>
        )
      })}

      <div ref={bottomRef} />

      {preview && (
        <div onClick={() => setPreview(null)} style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", touchAction: "none",
        }}>
          {preview.type === "video" ? (
            <video src={fullUrl(preview.media)} controls style={{
              maxWidth: "80vw", maxHeight: "75vh", borderRadius: "8px",
            }} onClick={e => e.stopPropagation()} />
          ) : preview.type === "image" ? (
            <img src={fullUrl(preview.media)} alt=""
              style={{ maxWidth: "80vw", maxHeight: "75vh", objectFit: "contain", borderRadius: "8px" }}
              onClick={e => e.stopPropagation()}
            />
          ) : fullUrl(preview.avatar) ? (
            <img src={fullUrl(preview.avatar)} alt={preview.username}
              style={{ maxWidth: "80vw", maxHeight: "75vh", borderRadius: "8px" }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div style={{
              width: 150, height: 150, borderRadius: "50%",
              background: "#2563eb", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "3rem", fontWeight: "bold",
            }}>
              {preview.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <button onClick={() => setPreview(null)} style={{
            position: "fixed", top: "1rem", right: "1rem", zIndex: 301,
            background: "none", border: "none", color: "#fff", fontSize: "1.8rem",
            cursor: "pointer",
          }}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
