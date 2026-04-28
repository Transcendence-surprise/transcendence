import { io, Socket } from "socket.io-client";

let realtimeSocket: Socket | null = null;

export function connectRealtimeSocket(): Socket {
  if (realtimeSocket) return realtimeSocket;

  realtimeSocket = io(window.location.origin, {
    path: "/rt/socket.io/",
    withCredentials: true,
    autoConnect: false,
    transports: ["polling", "websocket"],
  });

  realtimeSocket.connect();

  return realtimeSocket;
}

export function getRealtimeSocket(): Socket {
  if (!realtimeSocket) {
    realtimeSocket = io(window.location.origin, {
      path: "/rt/socket.io/",
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket"],
    });

    realtimeSocket.connect();
  }

  return realtimeSocket;
}

export function disconnectRealtimeSocket(): void {
  if (!realtimeSocket) return;
  realtimeSocket.removeAllListeners(); 
  realtimeSocket.disconnect();
  realtimeSocket = null;
}
