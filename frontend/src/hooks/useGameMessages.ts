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
  messageEvent: "lobbyMessage" | "playMessage" = "lobbyMessage",
) {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const joinedRef = useRef(false);
  const maxMessagesRef = useRef(200);

  const handleLobbyMessage = useCallback(
    (msg: LobbyMessage) => {
      setMessages((prev) => {
        const next = [...prev, enrichLobbyMessage(msg, userByUsername)];
        const maxMessages = maxMessagesRef.current;

        if (next.length <= maxMessages) return next;
        return next.slice(-maxMessages);
      });
    },
    [userByUsername],
  );

  useEffect(() => {
    setMessages([]);
    joinedRef.current = false;
  }, [gameId]);

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

    socket.on(messageEvent, handleLobbyMessage);

    return () => {
      socket.off(messageEvent, handleLobbyMessage);
      socket.off("connect", join);
      socket.emit("game:leave", { gameId });
      joinedRef.current = false;
    };
  }, [gameId, handleLobbyMessage, messageEvent]);

  return { messages, setMessages };
}