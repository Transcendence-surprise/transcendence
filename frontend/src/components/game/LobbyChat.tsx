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
    <div className="bg-gray-800 rounded p-3 flex flex-col h-64">
      <div className="flex-1 overflow-y-auto space-y-1 mb-2">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className="text-blue-400">{msg.userId}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-2 py-1 rounded bg-gray-700 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message…"
        />
        <button
          className="px-3 py-1 bg-green-600 rounded hover:bg-green-500"
          onClick={onSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}