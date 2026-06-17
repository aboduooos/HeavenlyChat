"use client"
import { useState } from "react"

const GIFS = [
  // ── Happy (18) ──
  { id: "YtXhHnouybHEmT7Xkh", title: "So Good", cat: "happy" },
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
  { id: "l0MYEqEzwMWFgZJPG", title: "Happy Dance!", cat: "happy" },
  { id: "UPQTO9cKJARjW", title: "Dancing", cat: "happy" },
  { id: "3o7abKhOpu0QlM7lLG", title: "So Happy", cat: "happy" },
  { id: "xT9IgzoKnwPiOqR7LG", title: "Excited!", cat: "happy" },
  { id: "l2JHPOSV7vBKpsPNK", title: "Awesome!", cat: "happy" },
  { id: "3oEjI6SIIHBdRxXI40", title: "Dance Party", cat: "happy" },
  { id: "26u4lOMA8k4TKhTVC", title: "Dance", cat: "happy" },
  { id: "3o7abAHdYQCs6cH5eg", title: "Celebration", cat: "happy" },

  // ── LOL (18) ──
  { id: "26FxFNB4oAgwcwBry", title: "Audience Reaction", cat: "lol" },
  { id: "l2QEeYqA9urBERX8I", title: "No Thanks", cat: "lol" },
  { id: "Z6DPKw6gyCYz4zEsxk", title: "Mic Drop", cat: "lol" },
  { id: "hyyV7pnbE0FqLNBAzs", title: "No", cat: "lol" },
  { id: "whQCarjn5Jv1Ktq2HH", title: "Facepalm", cat: "lol" },
  { id: "2opESNU8Y0wufPC3X1", title: "Facepalm 2", cat: "lol" },
  { id: "TzdTYRpcoHdrdoo15p", title: "Oh No", cat: "lol" },
  { id: "RsIm2nJA5AVjMWfEaL", title: "Office No", cat: "lol" },
  { id: "xUA7a7Tl2J1zM3Y8OQ", title: "LOL", cat: "lol" },
  { id: "3o7aCTPPpbJN0Q5mG4", title: "Laughing", cat: "lol" },
  { id: "l0MYt5jH6T1gR0C8g", title: "Crying Laughing", cat: "lol" },
  { id: "3o8doTcjycFwLzp5LG", title: "Laughing Hard", cat: "lol" },
  { id: "26n6WywE5iV3pQ3JC", title: "Hilarious", cat: "lol" },
  { id: "3o6Zt481Jg7GxX7H5e", title: "ROFL", cat: "lol" },
  { id: "l4q7v5J5YlC6XovLy", title: "LMAO", cat: "lol" },
  { id: "3oriO0OEd9QIDdllqO", title: "Funny", cat: "lol" },
  { id: "26BRuo6sLetdllPAQ", title: "LOL 2", cat: "lol" },
  { id: "26ufdipQqU2lhNA4g", title: "Funny 2", cat: "lol" },

  // ── Wow (12) ──
  { id: "0NwSQpGY6ipgOSt8LL", title: "Mind Blown", cat: "wow" },
  { id: "PadfCrnNVQzozq6A0m", title: "John Cena", cat: "wow" },
  { id: "6kz2FMFCMNeNpULQ3p", title: "Wow", cat: "wow" },
  { id: "2hEEHLafH4KFQ6pUEA", title: "React Wow", cat: "wow" },
  { id: "XrWwIchnRfynuvlpRF", title: "Wait What", cat: "wow" },
  { id: "3o6Zt6XQS5E7jG0Ety", title: "Wow!", cat: "wow" },
  { id: "26tPk6tPkDHVBCb5y", title: "Shocked", cat: "wow" },
  { id: "3o6Mbj2GYMAPeITm7C", title: "OMG", cat: "wow" },
  { id: "3o7abKhOpu0QlM7lYw", title: "No Way", cat: "wow" },
  { id: "3oEjHLnYhXzJT3C3q", title: "Mind Blown", cat: "wow" },
  { id: "l0HlTF3FfH3Fv4hJ7", title: "Whoa", cat: "wow" },
  { id: "3o7aD2saAlBgrH3kGJ", title: "Unbelievable", cat: "wow" },

  // ── Sad (12) ──
  { id: "bdVGuPnfR3g9PrZU9d", title: "Sad Cry", cat: "sad" },
  { id: "rVudQoqKFHuJ0Xmnym", title: "Sad Bye", cat: "sad" },
  { id: "Rf5Kq1IXnxilMczBI5", title: "Sad Mood", cat: "sad" },
  { id: "qyo2cylDCIiCmuw0Ce", title: "Disappointed", cat: "sad" },
  { id: "wG7JgE083zaHqXzUyq", title: "Crying Tired", cat: "sad" },
  { id: "z7ru2U63UquVwPTu7W", title: "Sad Cry 2", cat: "sad" },
  { id: "xT8qBv6U0T5vzR7rS", title: "Sad", cat: "sad" },
  { id: "l0HlNQqJ1CUl6s0Xv", title: "Depressed", cat: "sad" },
  { id: "l0HlGfg7u4tqQv7NS", title: "Crying", cat: "sad" },
  { id: "3o7abKhOpu0QlM7lYx", title: "Sad Face", cat: "sad" },
  { id: "l0HlQh2fNZGxTc2OQ", title: "Sob", cat: "sad" },
  { id: "3o7aCTfyhYaw3bMx7G", title: "Cry", cat: "sad" },

  // ── Cute (12) ──
  { id: "3o7abFB0mBGYmJQ7SM", title: "Cute", cat: "cute" },
  { id: "l0HlNQqJ1CUl6s0Ww", title: "Aww", cat: "cute" },
  { id: "xT8qBv6U0T5vLzLJW", title: "So Cute", cat: "cute" },
  { id: "l0HlQk0Ljk50cRL4s", title: "Adorable", cat: "cute" },
  { id: "3oEjHLQqGkRVHeJNv7", title: "Sweet", cat: "cute" },
  { id: "3o7abABWr1CJW3vnE3", title: "Kitten", cat: "cute" },
  { id: "l4q7vG5J5YlC6XovLz", title: "Puppy", cat: "cute" },
  { id: "3oriO0OEd9QIDdllqP", title: "Aww Thanks", cat: "cute" },
  { id: "26BRuo6sLetdllPAQ", title: "Cute Dance", cat: "cute" },
  { id: "26ufdipQqU2lhNA4h", title: "Baby", cat: "cute" },
  { id: "3o6Zt481Jg7GxX7H5f", title: "Bunny", cat: "cute" },

  // ── Angry (10) ──
  { id: "3o6Zt6XQS5E7jG0Ety", title: "Angry", cat: "angry" },
  { id: "26tPk6tPkDHVBCb5y", title: "Mad", cat: "angry" },
  { id: "3o6Mbj2GYMAPeITm7C", title: "Furious", cat: "angry" },
  { id: "3o7abKhOpu0QlM7lYw", title: "Annoyed", cat: "angry" },
  { id: "l0HlNQqJ1CUl6s0Ww", title: "Grumpy", cat: "angry" },
  { id: "3o7aCTPPpbJN0Q5mG4", title: "No!", cat: "angry" },
  { id: "3oriO0OEd9QIDdllqO", title: "Not Happy", cat: "angry" },
  { id: "l4q7v5J5YlC6XovLy", title: "Seriously?", cat: "angry" },
  { id: "26BRuo6sLetdllPAQ", title: "Kidding Me", cat: "angry" },
  { id: "26ufdipQqU2lhNA4g", title: "Unbelievable", cat: "angry" },

  // ── Love (10) ──
  { id: "3o7abKhOpu0QlM7lLG", title: "Love", cat: "love" },
  { id: "l0MYt5jH6T1gR0C8g", title: "I Love It", cat: "love" },
  { id: "xT8qBv6U0T5vLzLJW", title: "Heart", cat: "love" },
  { id: "l2JHPOSV7vBKpsPNK", title: "In Love", cat: "love" },
  { id: "3oEjHLnYhXzJT3C3q", title: "Heart Eyes", cat: "love" },
  { id: "3o7abFB0mBGYmJQ7SM", title: "Love You", cat: "love" },
  { id: "l0HlNQqJ1CUl6s0Ww", title: "Be Mine", cat: "love" },
  { id: "UPQTO9cKJARjW", title: "I Love You", cat: "love" },
  { id: "3o7abAHdYQCs6cH5eg", title: "Forever", cat: "love" },
  { id: "3o7aD2saAlBgrH3kGJ", title: "XOXO", cat: "love" },
]

function gifUrl(id) { return `https://media.giphy.com/media/${id}/giphy.gif` }
function previewUrl(id) { return `https://media.giphy.com/media/${id}/giphy.gif` }

export default function GifPicker({ onSelect, onClose, simple }) {
  const [cat, setCat] = useState("All")

  const cats = [
    { name: "All", fn: () => true },
    { name: "Happy", fn: g => g.cat === "happy" },
    { name: "LOL", fn: g => g.cat === "lol" },
    { name: "Wow", fn: g => g.cat === "wow" },
    { name: "Sad", fn: g => g.cat === "sad" },
    { name: "Cute", fn: g => g.cat === "cute" },
    { name: "Angry", fn: g => g.cat === "angry" },
    { name: "Love", fn: g => g.cat === "love" },
  ]

  const filtered = cat === "All" ? GIFS : GIFS.filter(cats.find(c => c.name === cat).fn)

  const content = (
    <>
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
        {!simple && (
          <button onClick={onClose} style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "#999", cursor: "pointer", fontSize: "1rem", padding: "0 0.2rem",
          }}>✕</button>
        )}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "3px",
        padding: "4px", overflowY: "auto",
        ...(simple ? { flex: 1 } : { maxHeight: "300px" }),
      }}>
        {filtered.map(g => (
          <img key={g.id} src={previewUrl(g.id)} alt={g.title}
            onClick={() => onSelect(gifUrl(g.id))}
            title={g.title}
            onError={(e) => e.target.style.display = "none"}
            style={{
              width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "4px",
              cursor: "pointer", background: "#0f0f0f",
            }}
            loading="lazy"
          />
        ))}
      </div>
    </>
  )

  if (simple) {
    return content
  }

  return (
    <div style={{
      position: "absolute", bottom: "100%", left: 0, right: 0,
      width: "100%", maxWidth: "400px", margin: "0 auto",
      background: "#1a1a1a", border: "1px solid #333", borderRadius: "10px 10px 0 0",
      overflow: "hidden", zIndex: 200, display: "flex", flexDirection: "column",
    }}>
      {content}
    </div>
  )
}
