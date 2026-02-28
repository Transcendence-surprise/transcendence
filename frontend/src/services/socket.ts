import { io } from "socket.io-client";

const socketHost = window.location.origin;
export const socket = io(socketHost, {
  path: '/socket.io/',
  withCredentials: true,
});
