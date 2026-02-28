import { LobbyMessage } from "../../game/models/lobbyMessage";

type Props = {
  messages: LobbyMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
};

export default function LobbyChat({
  messages,
  input,
  setInput,
  onSend,
}: Props) {
  return (
    <div className="rounded-lg border border-[#FFFFFF1A] bg-[#101019] px-6 py-4 flex flex-col h-96">
      <h3 className="text-lg font-bold text-[#00eaff] mb-3">Lobby Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 ? (
          <p className="text-sm text-[#7BE9FF] text-center mt-8">
            No messages yet. Start chatting!
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="text-cyan-400 font-semibold">{msg.userName}</span>
              <span className="text-[#B7F6FF]">: {msg.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-lg bg-[#0B0B0F] border border-[#FFFFFF1A] text-[#B7F6FF] placeholder-[#7BE9FF]/50 focus:outline-none focus:border-cyan-300 transition-colors"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message…"
        />
        <button
          className="px-4 py-2 rounded-lg bg-[linear-gradient(90deg,rgba(0,234,255,1)_0%,rgba(0,102,255,1)_100%)] text-white font-semibold hover:shadow-[0_6px_16px_rgba(0,234,255,0.3)] transition-all border border-cyan-300/30"
          onClick={onSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
