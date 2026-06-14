"use client"
import { useState } from "react"
import { AvatarCircle } from "@/components/settings-panel"
import { SERVER } from "@/context/auth-context"

function fullUrl(path) {
  if (!path) return path
  if (path.startsWith("/uploads/")) return SERVER + path
  return path
}

export default function ChatSidebar({ users, username, avatar, onLogout, onSettings, onClose }) {
  const [previewUser, setPreviewUser] = useState(null)

  return (
    <div style={{
      width: "220px", height: "100%", background: "#1a1a1a",
      borderRight: "1px solid #2a2a2a",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "1rem", borderBottom: "1px solid #2a2a2a",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <AvatarCircle avatar={fullUrl(avatar)} username={username} size={32} />
          <div>
            <p style={{ fontWeight: "bold", fontSize: "0.85rem", background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HeavenlyChat</p>
            <p style={{ color: "#2563eb", fontSize: "0.75rem" }}>{username}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button onClick={onSettings} title="Settings" style={{
            background: "none", border: "none", color: "#999", cursor: "pointer",
            padding: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {onClose && (
            <button onClick={onClose} style={{
              background: "none", border: "none", color: "#999", cursor: "pointer",
              padding: "0.25rem", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "1rem", flex: 1, overflowY: "auto" }}>
        <p style={{ color: "#999", fontSize: "0.8rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Online &mdash; {users.length}
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {users.map(u => (
            <li key={u.username} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              fontSize: "0.9rem", color: u.username === username ? "#2563eb" : "#ccc",
            }}>
              <div onClick={() => setPreviewUser(u)} style={{ cursor: "pointer", lineHeight: 0 }}>
                <AvatarCircle avatar={fullUrl(u.avatar)} username={u.username} size={22} />
              </div>
              {u.username} {u.username === username && "(you)"}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid #2a2a2a" }}>
        <div style={{ padding: "0.6rem 1rem" }}>
          <a href="https://nimble-cucurucho-f9ad3a.netlify.app/" target="_blank" rel="noopener noreferrer" style={{
            display: "block", padding: "0.5rem", borderRadius: "6px",
            background: "linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)",
            color: "#fff", fontSize: "0.8rem", fontWeight: "bold",
            textAlign: "center", textDecoration: "none",
          }}>
            Check out LolitaHeaven for more spicy content!
          </a>
        </div>
        <div style={{ padding: "0.6rem 1rem" }}>
          <button onClick={onLogout} style={{
            width: "100%", padding: "0.5rem", background: "transparent",
            border: "1px solid #333", borderRadius: "4px", color: "#999",
            cursor: "pointer", fontSize: "0.85rem",
          }}>
            Log out
          </button>
        </div>
      </div>

      {previewUser && (
        <div onClick={() => setPreviewUser(null)} style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)",
        }}>
          {previewUser.avatar ? (
            <img src={fullUrl(previewUser.avatar)} alt={previewUser.username}
              style={{ maxWidth: "80vw", maxHeight: "80vh", borderRadius: "8px" }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div style={{
              width: 150, height: 150, borderRadius: "50%",
              background: "#2563eb", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "3rem", fontWeight: "bold",
            }}>
              {previewUser.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <button onClick={() => setPreviewUser(null)} style={{
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
