"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const SERVER = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" && window.location.port === "3000" ? "http://localhost:3001" : "")
  : "http://localhost:3001"

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const t = localStorage.getItem("token")
      const u = localStorage.getItem("username")
      const a = localStorage.getItem("avatar")
      if (t && u) {
        setToken(t)
        setUsername(u)
        if (a) setAvatar(a)
      }
    } catch (e) {
      console.warn("localStorage not available:", e.message)
    }
    setLoading(false)
  }, [])

  async function signup(username, password, avatar) {
    const res = await fetch(`${SERVER}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, avatar }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    try { localStorage.setItem("token", data.token); localStorage.setItem("username", data.username); if (data.avatar) localStorage.setItem("avatar", data.avatar) } catch (e) {}
    setToken(data.token)
    setUsername(data.username)
    setAvatar(data.avatar || null)
  }

  async function login(username, password) {
    const res = await fetch(`${SERVER}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    try { localStorage.setItem("token", data.token); localStorage.setItem("username", data.username); if (data.avatar) localStorage.setItem("avatar", data.avatar) } catch (e) {}
    setToken(data.token)
    setUsername(data.username)
    setAvatar(data.avatar || null)
  }

  async function guestLogin() {
    const res = await fetch(`${SERVER}/api/guest`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    try { localStorage.setItem("token", data.token); localStorage.setItem("username", data.username) } catch (e) {}
    setToken(data.token)
    setUsername(data.username)
    setAvatar(null)
  }

  async function updateUsername(newUsername) {
    const res = await fetch(`${SERVER}/api/update-username`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newUsername }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    try { localStorage.setItem("token", data.token); localStorage.setItem("username", data.username) } catch (e) {}
    setToken(data.token)
    setUsername(data.username)
  }

  async function updateAvatar(avatarData) {
    const res = await fetch(`${SERVER}/api/update-avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar: avatarData }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    if (data.avatar) {
      try { localStorage.setItem("avatar", data.avatar) } catch (e) {}
      setAvatar(data.avatar)
    }
  }

  function logout() {
    try { localStorage.removeItem("token"); localStorage.removeItem("username"); localStorage.removeItem("avatar") } catch (e) {}
    setToken(null)
    setUsername(null)
    setAvatar(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, avatar, loading, signup, login, guestLogin, updateUsername, updateAvatar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
