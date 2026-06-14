import { io } from "socket.io-client"

const SERVER = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" && window.location.port === "3000" ? "http://localhost:3001" : "")
  : "http://localhost:3001"

let socket

export function connectSocket(token) {
  if (socket?.connected) return socket

  socket = io(SERVER || undefined, {
    auth: { token },
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
