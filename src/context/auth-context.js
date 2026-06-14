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
    const t = localStorage.getItem("token")
    const u = localStorage.getItem("username")
    const a = localStorage.getItem("avatar")
    if (t && u) {
      setToken(t)
      setUsername(u)
      if (a) setAvatar(a)
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
    localStorage.setItem("token", data.token)
    localStorage.setItem("username", data.username)
    if (data.avatar) localStorage.setItem("avatar", data.avatar)
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
    localStorage.setItem("token", data.token)
    localStorage.setItem("username", data.username)
    if (data.avatar) localStorage.setItem("avatar", data.avatar)
    setToken(data.token)
    setUsername(data.username)
    setAvatar(data.avatar || null)
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
    localStorage.setItem("token", data.token)
    localStorage.setItem("username", data.username)
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
      localStorage.setItem("avatar", data.avatar)
      setAvatar(data.avatar)
    }
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("avatar")
    setToken(null)
    setUsername(null)
    setAvatar(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, avatar, loading, signup, login, updateUsername, updateAvatar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
