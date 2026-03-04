import { io, Socket } from "socket.io-client";
import { User } from "../api/authentification";

let socket: Socket | null = null;

export function connectSocket(user: User | null) {

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(window.location.origin, {
    path: '/socket.io/',
    withCredentials: true,
    autoConnect: true,
    transports: ["polling", "websocket"],
    auth: user?.roles?.includes('guest')
      ? { guestId: user.id, guestUsername: user.username }
      : undefined,
  });

  socket.on('connect', () => {
    console.log('WS connected', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('WS disconnected', reason);
  });

  return socket;
}

/**
 * Returns the existing socket if initialized.
 * Returns null if socket has not been connected yet.
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnects the socket safely.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}