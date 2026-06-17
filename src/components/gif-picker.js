"use client"
import { useState } from "react"

const GIFS = [
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
  { id: "3oEjI6SIIHBdRxXI40", title: "Dance Party", cat: "happy" },
  { id: "5GoVLqeAOo6PK", title: "Celebrate", cat: "happy" },
  { id: "AGOPaltgJ2pBC", title: "Thumbs Up", cat: "happy" },
  { id: "3o7aD5oU9qcCuAe9SU", title: "Happy", cat: "happy" },
  { id: "26FmRCAX6ryFKar0A", title: "Awesome", cat: "happy" },
  { id: "Kwi0Iu9MxxOgg", title: "Smile", cat: "happy" },
  { id: "X0Puqlx2pTy4E", title: "Reaction", cat: "happy" },
  { id: "3o7btYetccbRYL4WVW", title: "Sweet", cat: "happy" },
  { id: "EdFu9m8ckGO3e", title: "Happy Love", cat: "happy" },

  { id: "26FxFNB4oAgwcwBry", title: "Audience Reaction", cat: "lol" },
  { id: "l2QEeYqA9urBERX8I", title: "No Thanks", cat: "lol" },
  { id: "Z6DPKw6gyCYz4zEsxk", title: "Mic Drop", cat: "lol" },
  { id: "hyyV7pnbE0FqLNBAzs", title: "No", cat: "lol" },
  { id: "whQCarjn5Jv1Ktq2HH", title: "Facepalm", cat: "lol" },
  { id: "TzdTYRpcoHdrdoo15p", title: "Oh No", cat: "lol" },
  { id: "RsIm2nJA5AVjMWfEaL", title: "Office No", cat: "lol" },
  { id: "26BRuo6sLetdllPAQ", title: "Hilarious", cat: "lol" },
  { id: "26ufdipQqU2lhNA4g", title: "Funny", cat: "lol" },
  { id: "F3BeiZNq6VbDwyxzxF", title: "The Office", cat: "lol" },
  { id: "xT1XGU1AHz9Fe8tmp2", title: "Schitt's Creek", cat: "lol" },
  { id: "FcuiZUneg1YRAu1lH2", title: "Always Sunny", cat: "lol" },
  { id: "hXD3cypLkycW1hQTFz", title: "SNL", cat: "lol" },
  { id: "KBfKueAjIJV8Q", title: "Finger Guns", cat: "lol" },
  { id: "3o9bJX4O9ShW1L32eY", title: "Shameless", cat: "lol" },
  { id: "eB1muFfUvQrZkoJa16", title: "Schitt's Creek", cat: "lol" },
  { id: "xUOwGhdl13FVkoWpb2", title: "Give Me A Break", cat: "lol" },
  { id: "fJliUiYbvEIoM", title: "Do You Even Lift", cat: "lol" },
  { id: "P18aB31TcT7DBpkyUh", title: "Keep Talking", cat: "lol" },
  { id: "oxCtqUm9PhXvA0oXnp", title: "Forever LOL", cat: "lol" },

  { id: "0NwSQpGY6ipgOSt8LL", title: "Mind Blown", cat: "wow" },
  { id: "PadfCrnNVQzozq6A0m", title: "John Cena", cat: "wow" },
  { id: "6kz2FMFCMNeNpULQ3p", title: "Wow", cat: "wow" },
  { id: "2hEEHLafH4KFQ6pUEA", title: "React Wow", cat: "wow" },
  { id: "XrWwIchnRfynuvlpRF", title: "Wait What", cat: "wow" },
  { id: "xTiTnBMEz7zAKs57LG", title: "Awesome", cat: "wow" },
  { id: "XJtM2nNFCzT3etvzOB", title: "Shocked", cat: "wow" },
  { id: "Rlwz4m0aHgXH13jyrE", title: "No Way", cat: "wow" },
  { id: "R8s2pWPslY0dG", title: "Mind Blown", cat: "wow" },
  { id: "100QWMdxQJzQC4", title: "Whoa", cat: "wow" },
  { id: "QWw4hc5gTnJhY0BUI3", title: "Whoa", cat: "wow" },
  { id: "rWgLOxrdNNDzUXaQnd", title: "Blink Confused", cat: "wow" },
  { id: "3o7TKJLO3D4kUgpa6I", title: "Shocked", cat: "wow" },

  { id: "bdVGuPnfR3g9PrZU9d", title: "Sad Cry", cat: "sad" },
  { id: "rVudQoqKFHuJ0Xmnym", title: "Sad Bye", cat: "sad" },
  { id: "Rf5Kq1IXnxilMczBI5", title: "Sad Mood", cat: "sad" },
  { id: "qyo2cylDCIiCmuw0Ce", title: "Disappointed", cat: "sad" },
  { id: "wG7JgE083zaHqXzUyq", title: "Crying Tired", cat: "sad" },
  { id: "z7ru2U63UquVwPTu7W", title: "Sad Cry 2", cat: "sad" },
  { id: "l3V0b87RQAMgGGoGA", title: "Cry More", cat: "sad" },
  { id: "t6JFpRFhBTkVib7ju1", title: "Sad", cat: "sad" },
  { id: "1qB3EwE3c54A", title: "Depressed", cat: "sad" },

  { id: "I6NHpPGnq4ed2", title: "Cute", cat: "cute" },
  { id: "d1E2IByItLUuONMc", title: "Aww", cat: "cute" },
  { id: "6pUBXVTai18Iw", title: "So Cute", cat: "cute" },
  { id: "Xev2JdopBxGj1LuGvt", title: "Adorable", cat: "cute" },
  { id: "lcySndwSDLxC4eOU86", title: "Sweet", cat: "cute" },
  { id: "Nm8ZPAGOwZUQM", title: "Kitten", cat: "cute" },
  { id: "cwTtbmUwzPqx2", title: "Puppy", cat: "cute" },
  { id: "SEp6Zq6ZkzUNW", title: "Aww Thanks", cat: "cute" },
  { id: "65ATXZgKw9tKnJua1B", title: "Baby", cat: "cute" },

  { id: "dT7LBdAZP1Rh6", title: "Angry", cat: "angry" },
  { id: "SB5fjrUhAeLte", title: "Mad", cat: "angry" },
  { id: "gl8ymnpv4Sqha", title: "Furious", cat: "angry" },
  { id: "yS2AMt4LX13Mc", title: "Annoyed", cat: "angry" },
  { id: "JfDNFU1qOZna", title: "Seriously?", cat: "angry" },
  { id: "3o6EhU7SUa3afFIJFe", title: "Not Happy", cat: "angry" },
  { id: "SJX3gbZ2dbaEhU92Pu", title: "Unbelievable", cat: "angry" },
  { id: "SDogLD4FOZMM8", title: "Kidding Me", cat: "angry" },
  { id: "XzsQ4z8EhOPBOfpSMK", title: "Shut Up", cat: "angry" },
  { id: "BbBPp0eMeykg46LLk6", title: "Seriously", cat: "angry" },
  { id: "5t9wJjyHAOxvnxcPNk", title: "Frustrated", cat: "angry" },

  { id: "XMcgqIA49OywU", title: "Love", cat: "love" },
  { id: "JmBXdjfIblJDi", title: "I Love It", cat: "love" },
  { id: "kMdlyJ74u9khW", title: "Heart", cat: "love" },
  { id: "cFOaorIxCo8Ra", title: "In Love", cat: "love" },
  { id: "l0MYEqEzwMWFCg8rm", title: "Heart Eyes", cat: "love" },
  { id: "AANqYGD9LVsw8", title: "Love You", cat: "love" },
  { id: "11qAyKz9AbFEYM", title: "Be Mine", cat: "love" },
  { id: "3o6ZtmGkSCwGWQNTOg", title: "I Love You", cat: "love" },
  { id: "3o7TKLSqjNPNs19nDG", title: "Forever", cat: "love" },
  { id: "bEcDN4ifb3POkX7Vs4", title: "XOXO", cat: "love" },
  { id: "xTiN0CNHgoRf1Ha7CM", title: "Jersey Love", cat: "love" },
  { id: "2pU8T0OTNkmre", title: "Love It", cat: "love" },
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
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.style.display = "none" }}
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
