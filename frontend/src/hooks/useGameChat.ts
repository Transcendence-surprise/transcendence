// src/hooks/useGameChat.ts

import { useState } from "react";
import { getRealtimeSocket } from "../services/realtimeSocket";
import { LobbyMessage } from "../game/models/lobbyMessage";

export function useGameChat(gameId: string) {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [input, setInput] = useState("");

  const MAX = 200;

  const sendMessage = () => {
    if (!input.trim()) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    socket.emit("playMessage", {
      gameId,
      message: input,
    });

    setInput("");
  };

  const addMessage = (msg: LobbyMessage) => {
    setMessages((prev) => [...prev, msg].slice(-MAX));
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    addMessage,
  };
}