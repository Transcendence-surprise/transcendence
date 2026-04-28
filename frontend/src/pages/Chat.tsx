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
    <div className="flex flex-col h-full min-h-0 max-w-2xl mx-auto bg-bg-dark text-white rounded-lg border border-[var(--color-border-subtle)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border-gray)] text-xl font-bold text-blue-hero">
        Global Chat
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const replyMsg = findMessage(msg.replyTo);

          return (
            <div key={msg.id} className="group">
              {replyMsg && (
                <div className="text-xs text-gray-400 mb-1 ml-[7.75rem] truncate max-w-full">
                  Replying to {replyMsg.username}: {replyMsg.content}
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-28 min-w-28 font-semibold text-blue-300 truncate text-right">
                  {msg.username}
                </div>

                <div className="flex-1">
                  <div className="bg-slate-800 p-2 rounded-md">
                    {msg.content}
                  </div>

                  {/* Hover actions */}
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 mt-1 flex gap-3">
                    <button
                      className="hover:text-blue-400 transition-colors"
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
        <div className="px-4 py-2 bg-slate-800 text-sm flex justify-between gap-2">
          <span className="truncate">
            Replying to {replyTo.username}: {replyTo.content}
          </span>

          <button className="text-red-400" onClick={() => setReplyTo(null)}>
            Cancel
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 bg-slate-800 p-2 rounded-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Write a message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
