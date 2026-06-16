"use client"
import { useState, useCallback } from "react"

const GIFS = [
  { id: "0NwSQpGY6ipgOSt8LL", title: "Mind Blown", cat: "wow" },
  { id: "26FxFNB4oAgwcwBry", title: "Audience Reaction", cat: "lol" },
  { id: "YtXhHnouybHEmT7Xkh", title: "So Good", cat: "happy" },
  { id: "l2QEeYqA9urBERX8I", title: "No Thanks", cat: "lol" },
  { id: "PadfCrnNVQzozq6A0m", title: "John Cena", cat: "wow" },
  { id: "6kz2FMFCMNeNpULQ3p", title: "Wow", cat: "wow" },
  { id: "2hEEHLafH4KFQ6pUEA", title: "React Wow", cat: "wow" },
  { id: "XrWwIchnRfynuvlpRF", title: "Wait What", cat: "wow" },
  { id: "Z6DPKw6gyCYz4zEsxk", title: "Mic Drop", cat: "lol" },
  { id: "hyyV7pnbE0FqLNBAzs", title: "No", cat: "lol" },
  { id: "whQCarjn5Jv1Ktq2HH", title: "Facepalm", cat: "lol" },
  { id: "2opESNU8Y0wufPC3X1", title: "Facepalm 2", cat: "lol" },
  { id: "TzdTYRpcoHdrdoo15p", title: "Oh No", cat: "lol" },
  { id: "roSEVPxDsbKiQB5N6V", title: "Happy Party", cat: "happy" },
  { id: "wlNT7dI3zZjVV3m2Au", title: "Happy Dance", cat: "happy" },
  { id: "l1J9Pbg4jOpgKaW9q", title: "Happy Party 2", cat: "happy" },
  { id: "YXsXWYNmn8A9xMCmMD", title: "Excited Dance", cat: "happy" },
  { id: "BjNMiLuMsLL2gu4gtl", title: "Happy Hip Hop", cat: "happy" },
  { id: "NCF5DMDvf9247pmp72", title: "Dance Party", cat: "happy" },
  { id: "M9jZ8PFwQzBXXJryBL", title: "Good Vibes", cat: "happy" },
  { id: "4aY8hI9hHAJD0ofEpo", title: "Dance Party 2", cat: "happy" },
  { id: "kPMBkmGYByXmJsGVL3", title: "Happy Dance 2", cat: "happy" },
  { id: "3bA4HdmfwyDpiWIas9", title: "Dance Party 3", cat: "happy" },
  { id: "RsIm2nJA5AVjMWfEaL", title: "Office No", cat: "lol" },
  { id: "bdVGuPnfR3g9PrZU9d", title: "Sad Cry", cat: "sad" },
  { id: "rVudQoqKFHuJ0Xmnym", title: "Sad Bye", cat: "sad" },
  { id: "Rf5Kq1IXnxilMczBI5", title: "Sad Mood", cat: "sad" },
  { id: "qyo2cylDCIiCmuw0Ce", title: "Disappointed", cat: "sad" },
  { id: "wG7JgE083zaHqXzUyq", title: "Crying Tired", cat: "sad" },
  { id: "z7ru2U63UquVwPTu7W", title: "Sad Cry 2", cat: "sad" },
]

function gifUrl(id) { return `https://media.giphy.com/media/${id}/giphy.gif` }
function previewUrl(id) { return `https://media.giphy.com/media/${id}/giphy-downsized-small.gif` }

export default function GifPicker({ onSelect, onClose }) {
  const [cat, setCat] = useState("All")

  const cats = [
    { name: "All", fn: () => true },
    { name: "Happy", fn: g => g.cat === "happy" },
    { name: "LOL", fn: g => g.cat === "lol" },
    { name: "Wow", fn: g => g.cat === "wow" },
    { name: "Sad", fn: g => g.cat === "sad" },
  ]

  const filtered = cat === "All" ? GIFS : GIFS.filter(cats.find(c => c.name === cat).fn)

  return (
    <div style={{
      position: "absolute", bottom: "100%", left: 0, right: 0,
      background: "#1a1a1a", border: "1px solid #333", borderRadius: "10px 10px 0 0",
      overflow: "hidden", zIndex: 200, display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", gap: "0.25rem", padding: "0.4rem 0.5rem",
        borderBottom: "1px solid #333", overflowX: "auto", flexShrink: 0,
      }}>
        {cats.map(c => (
          <button key={c.name} onClick={() => setCat(c.name)} style={{
            padding: "0.25rem 0.6rem", borderRadius: "12px", border: "none",
            background: cat === c.name ? "#2563eb" : "#2a2a2a",
            color: cat === c.name ? "#fff" : "#ccc",
            cursor: "pointer", fontSize: "0.75rem", whiteSpace: "nowrap",
            flexShrink: 0,
          }}>{c.name}</button>
        ))}
        <button onClick={onClose} style={{
          marginLeft: "auto", background: "none", border: "none",
          color: "#999", cursor: "pointer", fontSize: "1rem", padding: "0 0.2rem",
        }}>✕</button>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px",
        padding: "4px", maxHeight: "280px", overflowY: "auto",
      }}>
        {filtered.filter(g => g.visible !== false).map(g => (
          <img key={g.id} src={previewUrl(g.id)} alt={g.title}
            onClick={() => onSelect(gifUrl(g.id))}
            title={g.title}
            onError={() => g.visible = false}
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
