import { io } from "socket.io-client"

const SERVER = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" && window.location.port === "3000" ? "http://localhost:3001" : "")
  : "http://localhost:3001"

let socket

export function connectSocket(token) {
  if (socket?.connected) return socket

  socket = io(SERVER || undefined, {
    auth: { token },
    transports: ["polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
