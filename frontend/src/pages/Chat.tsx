import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRealtimeSocket, connectRealtimeSocket } from "../services/realtimeSocket";
import { getChatHistory, sendChatMessage } from "../api/chat";

interface ChatMessage {
  id: string;
  userId: number | string;
  username: string;
  content: string;
  timestamp: number;
  replyTo?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    console.log("Fetching chat history");
    getChatHistory(controller.signal)
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      })
      .catch(console.error);
    console.log("Chat history fetched");
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
      setMessages((prev) => [...prev, msg]);
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

  const canSend = input.trim().length > 0;

  function formatMessageTimestamp(timestamp: number) {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getAvatarGradient(username: string) {
    const gradients = [
      "from-cyan-400/30 via-blue-500/20 to-transparent",
      "from-pink-400/30 via-fuchsia-500/20 to-transparent",
      "from-emerald-400/30 via-teal-500/20 to-transparent",
      "from-yellow-300/30 via-amber-500/20 to-transparent",
      "from-violet-400/30 via-indigo-500/20 to-transparent",
      "from-rose-400/30 via-orange-500/20 to-transparent",
    ];

    const seed = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return gradients[seed % gradients.length];
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Login required to access chat
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="py-3 px-6 rounded-lg font-medium text-white bg-bg-dark-tertiary border border-[var(--color-border-subtle)] hover:shadow-cyan-light hover:border-cyan-bright transition-all"
        >
          Back
        </button>
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
            const replyMsg = findMessage(msg.replyTo);
            const fallbackInitial =
              msg.username.trim().charAt(0).toUpperCase() || "?";
            const avatarGradient = getAvatarGradient(msg.username);

            return (
              <div key={msg.id} className="group">
                <div className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
                  <div
                    className={`flex h-11 w-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${avatarGradient} text-sm font-semibold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
                  >
                    {fallbackInitial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex min-w-0 items-baseline gap-2">
                      <h3 className="truncate text-base font-semibold text-cyan-200">
                        {msg.username}
                      </h3>
                      <span className="shrink-0 text-xs text-gray-500">
                        {formatMessageTimestamp(msg.timestamp)}
                      </span>
                    </div>

                    {replyMsg && (
                      <div className="mb-2 flex items-center gap-2 overflow-hidden rounded-md border-l-2 border-cyan-400/40 bg-slate-800/60 px-3 py-2 text-xs text-gray-300">
                        <span className="shrink-0 font-semibold text-cyan-200">
                          Replying to {replyMsg.username}
                        </span>
                        <span className="truncate text-gray-400">
                          {replyMsg.content}
                        </span>
                      </div>
                    )}

                    <div className="rounded-md bg-slate-800 px-3 py-2.5 leading-7 text-white">
                      {msg.content}
                    </div>

                    <div className="mt-1 flex gap-3 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        className="transition-colors hover:text-blue-400"
                        onClick={() => {
                          setReplyTo(msg);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyTo && (
          <div className="flex justify-between gap-2 bg-slate-800 px-4 py-2 text-sm">
            <span className="truncate">
              Replying to {replyTo.username}: {replyTo.content}
            </span>

            <button className="text-red-400" onClick={() => setReplyTo(null)}>
              Cancel
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 border-t border-slate-700 p-4">
          <input
            ref={inputRef}
            className="flex-1 rounded-md border border-transparent bg-slate-800 p-2 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-400/40"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write a message..."
          />

          <button
            onClick={sendMessage}
            disabled={!canSend}
            className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-black transition-all hover:bg-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:bg-cyan-400/40 disabled:text-black/60 disabled:hover:shadow-none"
          >
            Send
          </button>
        </div>
    </div>
  );
}
