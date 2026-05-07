import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRealtimeSocket, connectRealtimeSocket } from "../services/realtimeSocket";
import {
  getChatHistory,
  sendChatMessage,
  type ChatMessage,
} from "../api/chat";
import { getAllUsers } from "../api/users";
import ChatMessageItem from "../components/chat/ChatMessageItem";
import ChatInputBar from "../components/chat/ChatInputBar";
import BackButton from "../components/shared/BackButton";

function enrichChatMessage(
  message: ChatMessage,
  avatarUrlById: Map<string, string | null>,
): ChatMessage {
  return {
    ...message,
    avatarUrl:
      message.avatarUrl ??
      avatarUrlById.get(String(message.userId)) ??
      null,
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarUrlByIdRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    Promise.all([
      getChatHistory(controller.signal),
      getAllUsers(controller.signal),
    ])
      .then(([data, allUsers]) => {
        avatarUrlByIdRef.current = new Map(
          allUsers.map((chatUser) => [String(chatUser.id), chatUser.avatarUrl ?? null]),
        );

        if (Array.isArray(data)) {
          setMessages(
            data.map((message) =>
              enrichChatMessage(message, avatarUrlByIdRef.current),
            ),
          );
        } else {
          setMessages([]);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(error);
      });
    return () => controller.abort();
  }, [user]);


  useEffect(() => {
    if (!user) return;

    const socket = connectRealtimeSocket();

    const subscribe = () => {
      socket.emit("chat:subscribe");
    };

    socket.on("connect", subscribe);

    // only subscribe once after connect
    if (socket.connected) {
      subscribe();
    }

    socket.on("chat:newMessage", (msg: ChatMessage) => {
      setMessages((prev) => [
        ...prev,
        enrichChatMessage(msg, avatarUrlByIdRef.current),
      ]);
    });

    return () => {
      socket.off("connect", subscribe);
      socket.off("chat:newMessage");
      socket.emit("chat:unsubscribe");
    };
  }, [user]);

  async function sendMessage() {
    if (!input.trim()) return;

    try {
      await sendChatMessage({
        content: input,
        replyTo: replyTo?.id,
      });

      setInput("");
      setReplyTo(null);
    } catch (e) {
      console.error(e);
    }
  }

  function findMessage(id?: string) {
    return messages.find((m) => m.id === id);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Login required to access chat
        </h2>

        <BackButton onClick={() => navigate("/")} variant="outline" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark text-white">
        {/* Header */}
        <div className="border-b border-[var(--color-border-gray)] p-4 text-xl font-bold text-cyan-400">
          Global Chat
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            return (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                replyMessage={findMessage(msg.replyTo)}
                onReply={(message) => {
                  setReplyTo(message);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <ChatInputBar
          input={input}
          inputRef={inputRef}
          replyTo={replyTo}
          onInputChange={setInput}
          onSend={sendMessage}
          onCancelReply={() => setReplyTo(null)}
        />
    </div>
  );
}
