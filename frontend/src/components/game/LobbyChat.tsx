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
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-6 py-4 flex flex-col h-96">
      <h3 className="text-lg font-bold text-cyan-bright mb-3">Lobby Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 ? (
          <p className="text-sm text-light-cyan text-center mt-8">
            No messages yet. Start chatting!
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="text-cyan-400 font-semibold">{msg.userName}</span>
              <span className="text-lightest-cyan">: {msg.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-lg bg-bg-dark-secondary border border-[var(--color-border-subtle)] text-lightest-cyan placeholder-text-light-cyan/50 focus:outline-none focus:border-cyan-300 transition-colors"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message…"
        />
        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-cyan-light transition-all border border-cyan-300/30"
          onClick={onSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
