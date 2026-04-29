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
        <div className="border-b border-[var(--color-border-gray)] p-4 text-xl font-bold text-blue-hero">
          Global Chat
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const replyMsg = findMessage(msg.replyTo);

            return (
              <div key={msg.id} className="group">
                {replyMsg && (
                  <div className="mb-1 ml-[7.75rem] max-w-full truncate text-xs text-gray-400">
                    Replying to {replyMsg.username}: {replyMsg.content}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-28 min-w-28 truncate text-right font-semibold text-blue-300">
                    {msg.username}
                  </div>

                  <div className="flex-1">
                    <div className="rounded-md bg-slate-800 p-2">
                      {msg.content}
                    </div>

                    {/* Hover actions */}
                    <div className="mt-1 flex gap-3 text-xs text-gray-400 opacity-0 group-hover:opacity-100">
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
            className="flex-1 rounded-md bg-slate-800 p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write a message..."
          />

          <button
            onClick={sendMessage}
            className="rounded-md bg-blue-500 px-4 py-2"
          >
            Send
          </button>
        </div>
    </div>
  );
}
