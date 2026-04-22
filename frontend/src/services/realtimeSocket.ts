import { io, Socket } from "socket.io-client";

let realtimeSocket: Socket | null = null;

export function connectRealtimeSocket(): Socket {
  if (realtimeSocket) return realtimeSocket;

  realtimeSocket = io(window.location.origin, {
    path: "/rt/socket.io/",
    withCredentials: true,
    autoConnect: true,
    transports: ["polling", "websocket"],
  });

  return realtimeSocket;
}

export function getRealtimeSocket(): Socket | null {
  return realtimeSocket;
}

export function disconnectRealtimeSocket(): void {
  if (!realtimeSocket) return;
  realtimeSocket.disconnect();
  realtimeSocket = null;
}
