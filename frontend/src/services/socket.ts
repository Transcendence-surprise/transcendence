import { io } from "socket.io-client";

const socketHost = import.meta.env.VITE_API_URL;
export const socket = io(socketHost, { path: '/socket.io/' });
