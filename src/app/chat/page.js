"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { connectSocket, disconnectSocket } from "@/lib/socket"
import ChatSidebar from "@/components/chat-sidebar"
import ChatMessages from "@/components/chat-messages"
import MessageInput from "@/components/message-input"
import GifPicker from "@/components/gif-picker"
import SettingsPanel from "@/components/settings-panel"

export default function Chat() {
  const { token, username, avatar, textColor, loading, logout } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [connected, setConnected] = useState(false)

  const [unread, setUnread] = useState(0)
  const unreadRef = useRef(0)
  const [showReconnect, setShowReconnect] = useState(false)
  const [showGifs, setShowGifs] = useState(false)

  useEffect(() => {
    function check() {
      setMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    function onFocus() { setUnread(0); unreadRef.current = 0; updateFavicon(0) }
    function onBlur() { /* start counting */ }
    window.addEventListener("focus", onFocus)
    window.addEventListener("blur", onBlur)
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur) }
  }, [])

  const faviconImgRef = useRef(null)

  function drawBadge(count) {
    const link = document.querySelector("link[rel='icon']") || (() => { const l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); return l })()
    if (count === 0) { link.href = "/icon.png"; document.title = "HeavenlyChat"; return }
    const c = document.createElement("canvas")
    c.width = 64; c.height = 64
    const ctx = c.getContext("2d")
    if (faviconImgRef.current) {
      ctx.drawImage(faviconImgRef.current, 0, 0, 64, 64)
    }
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(44, 20, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#fff"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(Math.min(count, 99).toString(), 44, 20)
    link.href = c.toDataURL("image/png")
    document.title = `(${count}) HeavenlyChat`
  }

  function updateFavicon(count) {
    if (count === 0 || faviconImgRef.current) { drawBadge(count); return }
    const img = new Image()
    img.onload = () => { faviconImgRef.current = img; drawBadge(count) }
    img.onerror = () => { drawBadge(count) }
    img.src = "/icon.png"
  }

  useEffect(() => {
    if (loading) return
    if (!token) {
      router.replace("/login")
      return
    }

    const s = connectSocket(token)
    setSocket(s)

    function onConnect() {
      setConnected(true)
    }

    function onDisconnect() {
      setConnected(false)
    }

    function onConnectError(err) {
      console.warn("[socket] connect_error:", err.message)
    }

    s.on("connect", onConnect)
    s.on("disconnect", onDisconnect)
    s.on("connect_error", onConnectError)
    setConnected(s.connected)

    s.on("messages", (msgs) => {
      setMessages(msgs)
    })

    s.on("new_message", (msg) => {
      setMessages(prev => [...prev, msg])
      if (msg.username !== username && !document.hasFocus()) {
        const n = unreadRef.current + 1
        unreadRef.current = n
        setUnread(n)
        updateFavicon(n)
      }
      if (msg.username === username || !("Notification" in window)) return
      if (Notification.permission === "granted") {
        const body = msg.type === "text" ? msg.content : `sent a ${msg.type}`
        new Notification(msg.username, { body, icon: msg.avatar || undefined })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(p => {
          if (p === "granted") {
            const body = msg.type === "text" ? msg.content : `sent a ${msg.type}`
            new Notification(msg.username, { body, icon: msg.avatar || undefined })
          }
        })
      }
    })

    s.on("messages_cleared", () => {
      setMessages([])
    })

    s.on("users", (userList) => {
      setUsers(userList)
    })

    return () => {
      s.off("connect", onConnect)
      s.off("disconnect", onDisconnect)
      s.off("connect_error", onConnectError)
      disconnectSocket()
    }
  }, [token, loading, router])

  useEffect(() => {
    if (!connected) {
      const t = setTimeout(() => setShowReconnect(true), 5000)
      return () => clearTimeout(t)
    }
    setShowReconnect(false)
  }, [connected])

  const handleSend = useCallback((content) => {
    if (socket?.connected) {
      socket.emit("send_message", content)
    }
  }, [socket])

  function handleLogout() {
    disconnectSocket()
    logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {mobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50 }}
        />
      )}

      <div style={{
        width: mobile ? (sidebarOpen ? "100%" : "0px") : "220px",
        overflow: "hidden",
        transition: "width 0.2s",
        position: mobile ? "fixed" : "static",
        left: 0, top: 0, bottom: 0,
        zIndex: mobile ? 60 : "auto",
      }}>
        <ChatSidebar
          users={users}
          username={username}
          avatar={avatar}
          textColor={textColor}
          onLogout={handleLogout}
          onSettings={() => { setSettingsOpen(true); setSidebarOpen(false) }}
          onClose={mobile ? () => setSidebarOpen(false) : undefined}
        />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {mobile && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.75rem 1rem", borderBottom: "1px solid #2a2a2a",
            background: "#1a1a1a",
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#e5e5e5", padding: "0.25rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <p style={{ fontWeight: "bold", fontSize: "0.95rem", flex: 1, background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HeavenlyChat</p>
          </div>
        )}

        {showReconnect && (
          <div style={{
            textAlign: "center", padding: "0.5rem", fontSize: "0.85rem",
            background: "#1e1a1a", color: "#f87171", borderBottom: "1px solid #3a2a2a",
          }}>
            Connection lost — retrying...
          </div>
        )}
        <ChatMessages messages={messages} username={username} />
        <MessageInput onSend={handleSend} onGifOpen={mobile ? undefined : () => setShowGifs(v => !v)} />
      </div>

      {!mobile && (
        <div style={{
          width: showGifs ? "340px" : "0px",
          overflow: "hidden", transition: "width 0.2s ease",
          borderLeft: showGifs ? "1px solid #2a2a2a" : "none",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ width: "340px", display: "flex", flexDirection: "column", height: "100%", background: "#1a1a1a" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #2a2a2a", flexShrink: 0 }}>
              <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#e5e5e5" }}>GIFs</span>
              <button onClick={() => setShowGifs(false)} style={{
                marginLeft: "auto", background: "none", border: "none",
                color: "#999", cursor: "pointer", fontSize: "1.1rem", padding: "0.2rem",
              }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {showGifs && <GifPicker simple onSelect={(url) => { setShowGifs(false); handleSend({ type: "image", content: "", media: url }) }} onClose={() => setShowGifs(false)} />}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div onClick={() => setSettingsOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
          />
          <div style={{
            position: "relative", background: "#1a1a1a", borderRadius: "10px",
            width: "90%", maxWidth: "380px", border: "1px solid #2a2a2a",
          }}>
            <SettingsPanel onClose={() => setSettingsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
