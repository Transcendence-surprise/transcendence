// src/hooks/useGameMessages.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { getRealtimeSocket } from "../services/realtimeSocket";
import { LobbyMessage } from "../game/models/lobbyMessage";

function enrichLobbyMessage(
  message: LobbyMessage,
  userByUsername: Map<string, { id: string; avatarUrl: string | null }>,
): LobbyMessage {
  const matchedUser = userByUsername.get(message.userName);

  return {
    ...message,
    userId: message.userId ?? matchedUser?.id,
    avatarUrl: message.avatarUrl ?? matchedUser?.avatarUrl ?? null,
  };
}

export function useGameMessages(
  gameId: string | undefined,
  userByUsername: Map<string, { id: string; avatarUrl: string | null }>,
) {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const joinedRef = useRef(false);

  const handleLobbyMessage = useCallback(
    (msg: LobbyMessage) => {
      setMessages((prev) => [
        ...prev,
        enrichLobbyMessage(msg, userByUsername),
      ]);
    },
    [userByUsername],
  );

  useEffect(() => {
    if (!gameId) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    const join = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;

      socket.emit("game:join", { gameId });
    };

    if (socket.connected) join();
    else socket.once("connect", join);

    socket.on("lobbyMessage", handleLobbyMessage);

    return () => {
      socket.off("lobbyMessage", handleLobbyMessage);
      joinedRef.current = false;
    };
  }, [gameId, handleLobbyMessage]);

  return { messages, setMessages };
}