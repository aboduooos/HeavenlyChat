"use client"

import { useState, useRef, useCallback } from "react"
import { useAuth, SERVER } from "@/context/auth-context"

function fullUrl(path) {
  if (!path) return path
  if (path.startsWith("/uploads/")) return SERVER + path
  return path
}

function AvatarCircle({ avatar, username, size = 48 }) {
  return avatar ? (
    <img src={fullUrl(avatar)} alt="" style={{
      width: size, height: size, borderRadius: "50%", objectFit: "cover",
    }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#2563eb", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "bold", fontSize: size * 0.4,
    }}>
      {username?.[0]?.toUpperCase() || "?"}
    </div>
  )
}

function EditableAvatar({ avatar, username, onClick, size = 64 }) {
  const noName = !username || username === "?"
  const content = avatar ? (
    <img src={fullUrl(avatar)} alt="" style={{
      width: size, height: size, borderRadius: "50%", objectFit: "cover",
    }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: noName ? "#1a1a1a" : "#2563eb",
      color: noName ? "#555" : "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "bold", fontSize: noName ? size * 0.5 : size * 0.4,
      border: noName ? "2px dashed #444" : "none",
    }}>
      {noName ? "+" : username?.[0]?.toUpperCase()}
    </div>
  )

  return (
    <div onClick={onClick} style={{
      position: "relative", cursor: "pointer", display: "inline-block",
    }}>
      {content}
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        background: "#2563eb", borderRadius: "50%",
        width: "22px", height: "22px",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid #1a1a1a",
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </div>
    </div>
  )
}

function CropModal({ src, onCrop, onCancel }) {
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const drag = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0 })
  const pinchDist = useRef(null)
  const holdRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [imgDim, setImgDim] = useState(null)
  const SIZE = 250

  function onImageLoad(e) {
    const img = e.target
    const base = Math.min(img.naturalWidth, img.naturalHeight)
    setImgDim({ w: img.naturalWidth, h: img.naturalHeight, base })
    setReady(true)
  }

  if (!ready) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)" }}>
        <img src={src} alt="" style={{ display: "none" }} onLoad={onImageLoad} />
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    )
  }

  const viewScale = SIZE / imgDim.base
  const dispW = imgDim.w * viewScale * zoom
  const dispH = imgDim.h * viewScale * zoom
  const imgLeft = offset.x + (SIZE - dispW) / 2
  const imgTop = offset.y + (SIZE - dispH) / 2

  const scaleRatio = imgDim.w / dispW

  function onDown(e) {
    if (e.touches) e.preventDefault()
    const p = e.touches ? e.touches[0] : e
    drag.current = { active: true, startX: p.clientX, startY: p.clientY, ox: offset.x, oy: offset.y }
  }

  function onMove(e) {
    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (pinchDist.current) {
        const z = Math.max(0.5, Math.min(5, zoom * (dist / pinchDist.current)))
        setZoom(z)
      }
      pinchDist.current = dist
      return
    }
    if (!drag.current.active) return
    const p = e.touches ? e.touches[0] : e
    setOffset({
      x: drag.current.ox + (p.clientX - drag.current.startX),
      y: drag.current.oy + (p.clientY - drag.current.startY),
    })
  }

  function onUp() {
    drag.current.active = false
    pinchDist.current = null
  }

  function onWheel(e) {
    e.preventDefault()
    setZoom(z => Math.max(0.5, Math.min(5, z - e.deltaY * 0.002)))
  }

  function doCrop() {
    const img = imgRef.current
    if (!img || !imgDim) return

    const ix1 = Math.max(0, imgLeft)
    const iy1 = Math.max(0, imgTop)
    const ix2 = Math.min(SIZE, imgLeft + dispW)
    const iy2 = Math.min(SIZE, imgTop + dispH)
    const visW = ix2 - ix1
    const visH = iy2 - iy1
    if (visW <= 0 || visH <= 0) return

    const sx = Math.max(0, (ix1 - imgLeft) * scaleRatio)
    const sy = Math.max(0, (iy1 - imgTop) * scaleRatio)
    const sw = visW * scaleRatio
    const sh = visH * scaleRatio

    const cs = Math.min(sw, sh)
    const cx = sx + (sw - cs) / 2
    const cy = sy + (sh - cs) / 2

    const canvas = document.createElement("canvas")
    canvas.width = cs
    canvas.height = cs
    canvas.getContext("2d").drawImage(img, cx, cy, cs, cs, 0, 0, cs, cs)
    onCrop(canvas.toDataURL("image/jpeg", 0.9))
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)", touchAction: "none",
    }}
      onMouseMove={onMove} onMouseUp={onUp}
      onTouchMove={onMove} onTouchEnd={onUp}
      onWheel={onWheel}
    >
      <p style={{ color: "#e5e5e5", marginBottom: "0.75rem", fontSize: "0.85rem" }}>
        Drag to position &middot; Scroll or pinch to zoom
      </p>

      <div
        ref={containerRef}
        onMouseDown={onDown}
        onTouchStart={onDown}
        style={{
          width: SIZE, height: SIZE, borderRadius: "50%", overflow: "hidden",
          position: "relative", cursor: drag.current.active ? "grabbing" : "grab",
          border: "3px solid #555", background: "#000", touchAction: "none",
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          style={{
            position: "absolute", left: imgLeft, top: imgTop,
            width: dispW, height: dispH,
            maxWidth: "none", maxHeight: "none",
            userSelect: "none", pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
        <button style={{
          background: "#2a2a2a", border: "none", borderRadius: "50%",
          width: "34px", height: "34px", color: "#e5e5e5", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
          userSelect: "none",
        }}
          onMouseDown={() => { const t = setInterval(() => setZoom(z => Math.max(0.5, z - 0.1)), 80); holdRef.current = t; setZoom(z => Math.max(0.5, z - 0.2)); }}
          onMouseUp={() => { clearInterval(holdRef.current) }}
          onMouseLeave={() => { clearInterval(holdRef.current) }}
          onTouchStart={() => { const t = setInterval(() => setZoom(z => Math.max(0.5, z - 0.1)), 80); holdRef.current = t; setZoom(z => Math.max(0.5, z - 0.2)); }}
          onTouchEnd={() => { clearInterval(holdRef.current) }}
        >
          &minus;
        </button>
        <div style={{
          width: "120px", height: "14px", position: "relative", cursor: "pointer",
          display: "flex", alignItems: "center",
        }}
          onMouseDown={(e) => {
            const bar = e.currentTarget
            const rect = bar.getBoundingClientRect()
            const move = (ev) => {
              const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
              setZoom(0.5 + pct * 4.5)
            }
            move(e)
            const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up) }
            document.addEventListener("mousemove", move)
            document.addEventListener("mouseup", up, { once: true })
          }}
          onTouchStart={(e) => {
            const bar = e.currentTarget
            const rect = bar.getBoundingClientRect()
            const t = e.touches[0]
            const move = (ev) => {
              const touch = ev.touches[0]
              const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
              setZoom(0.5 + pct * 4.5)
            }
            move({ touches: [t] })
            const up = () => { document.removeEventListener("touchmove", move); document.removeEventListener("touchend", up) }
            document.addEventListener("touchmove", move)
            document.addEventListener("touchend", up, { once: true })
          }}
        >
          <div style={{
            width: "100%", height: "4px", background: "#333", borderRadius: "2px",
            position: "relative",
          }}>
            <div style={{
              width: `${((zoom - 0.5) / 4.5) * 100}%`, height: "100%",
              background: "#2563eb", borderRadius: "2px",
            }} />
            <div style={{
              position: "absolute", left: `${((zoom - 0.5) / 4.5) * 100}%`, top: "50%",
              width: "14px", height: "14px", borderRadius: "50%", background: "#2563eb",
              transform: "translate(-50%, -50%)", border: "2px solid #fff",
            }} />
          </div>
        </div>
        <button style={{
          background: "#2a2a2a", border: "none", borderRadius: "50%",
          width: "34px", height: "34px", color: "#e5e5e5", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
          userSelect: "none",
        }}
          onMouseDown={() => { const t = setInterval(() => setZoom(z => Math.min(5, z + 0.1)), 80); holdRef.current = t; setZoom(z => Math.min(5, z + 0.2)); }}
          onMouseUp={() => { clearInterval(holdRef.current) }}
          onMouseLeave={() => { clearInterval(holdRef.current) }}
          onTouchStart={() => { const t = setInterval(() => setZoom(z => Math.min(5, z + 0.1)), 80); holdRef.current = t; setZoom(z => Math.min(5, z + 0.2)); }}
          onTouchEnd={() => { clearInterval(holdRef.current) }}
        >
          +
        </button>
      </div>

      <p style={{ color: "#666", fontSize: "0.75rem", marginTop: "0.4rem" }}>
        {Math.round(zoom * 100)}%
      </p>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button onClick={onCancel} style={{
          padding: "0.6rem 1.6rem", borderRadius: "6px",
          background: "transparent", border: "1px solid #555", color: "#ccc",
          cursor: "pointer", fontSize: "0.9rem",
        }}>
          Cancel
        </button>
        <button onClick={doCrop} style={{
          padding: "0.6rem 1.6rem", borderRadius: "6px",
          background: "#2563eb", border: "none", color: "#fff",
          cursor: "pointer", fontSize: "0.9rem",
        }}>
          Save
        </button>
      </div>
    </div>
  )
}

export default function SettingsPanel({ onClose }) {
  const { username, avatar, updateUsername, updateAvatar } = useAuth()
  const [newName, setNewName] = useState(username || "")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(avatar)
  const [cropSrc, setCropSrc] = useState(null)
  const fileRef = useRef(null)

  async function handleSaveUsername() {
    if (newName.trim() === username) return
    if (newName.trim().length < 3) {
      setError("Username must be at least 3 characters")
      return
    }
    setSaving(true)
    setError("")
    try {
      await updateUsername(newName.trim())
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCropSrc(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  async function handleCrop(dataUrl) {
    setCropSrc(null)
    setSaving(true)
    setError("")
    try {
      await updateAvatar(dataUrl)
      setPreview(dataUrl)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "1.5rem",
      }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Settings</h2>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#999", cursor: "pointer",
          fontSize: "1.1rem", padding: "0.25rem",
        }}>
          ✕
        </button>
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "#999", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Profile picture</p>
        <EditableAvatar
          avatar={preview}
          username={username}
          onClick={() => fileRef.current?.click()}
        />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect}
          style={{ display: "none" }} />
      </div>

      <div>
        <p style={{ color: "#999", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Username</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text" value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{
              flex: 1, padding: "0.5rem 0.7rem", borderRadius: "4px",
              background: "#0f0f0f", border: "1px solid #333", color: "#e5e5e5",
              fontSize: "0.9rem", outline: "none",
            }}
          />
          <button onClick={handleSaveUsername} disabled={saving || newName.trim() === username} style={{
            padding: "0.5rem 1rem", borderRadius: "4px",
            background: newName.trim() !== username ? "#2563eb" : "#1a3a6e",
            color: "#fff", border: "none", cursor: newName.trim() !== username ? "pointer" : "default",
            fontSize: "0.85rem",
          }}>
            {saving ? "..." : "Save"}
          </button>
        </div>
      </div>

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

export { AvatarCircle, EditableAvatar, CropModal }
