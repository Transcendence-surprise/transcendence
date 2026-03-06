import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { getSocket, connectSocket } from "../services/socket";

interface ChatMessage {
  id: string;
  userId: string;
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

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();

    socket.emit("joinGlobalChat");

    socket.on("chatHistory", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("chatMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("chatMessage");
    };
  }, [user]);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-blue-400">
            Login required to access chat
        </h2>

        <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
            Back
        </button>
        </div>
    );
  }

  function sendMessage() {
    if (!input.trim()) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("chatMessage", {
      content: input,
      replyTo: replyTo?.id,
    });

    setInput("");
    setReplyTo(null);
  }

  function findMessage(id?: string) {
    return messages.find((m) => m.id === id);
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-slate-900 text-white rounded-lg">

      {/* Header */}
      <div className="p-4 border-b border-slate-700 text-xl font-bold text-blue-400">
        Global Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const replyMsg = findMessage(msg.replyTo);

          return (
            <div key={msg.id} className="group">

              {replyMsg && (
                <div className="text-xs text-gray-400 mb-1">
                  Replying to {replyMsg.username}: {replyMsg.content}
                </div>
              )}

              <div className="flex items-start gap-3">

                <div className="font-semibold text-blue-300">
                  {msg.username}
                </div>

                <div className="flex-1">

                  <div className="bg-slate-800 p-2 rounded-md">
                    {msg.content}
                  </div>

                  {/* Hover actions */}
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 mt-1 flex gap-3">
                    <button onClick={() => setReplyTo(msg)}>
                      Reply
                    </button>
                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-slate-800 text-sm flex justify-between">
          <span>
            Replying to {replyTo.username}: {replyTo.content}
          </span>

          <button
            className="text-red-400"
            onClick={() => setReplyTo(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <input
          className="flex-1 bg-slate-800 p-2 rounded-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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