import { LobbyMessage } from "../../game/models/lobbyMessage";
import ChatInputBar from "../chat/ChatInputBar";
import ChatMessageItem from "../chat/ChatMessageItem";

type Props = {
  messages: LobbyMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  title?: string;
};

export default function LobbyChat({
  messages,
  input,
  setInput,
  onSend,
  title = "Lobby Chat",
}: Props) {
  return (
    <div className="flex h-full min-h-[540px] flex-col rounded-xl border border-[var(--color-border-subtle)] bg-bg-dark-secondary px-6 py-4">
      <h3 className="text-lg font-bold text-cyan-bright mb-3">{title}</h3>

      {/* Messages */}
      <div className="mb-4 flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.length === 0 ? (
          <p className="text-sm text-light-cyan text-center mt-8">
            No messages yet. Start chatting!
          </p>
        ) : (
          messages.map((msg, i) => (
            <ChatMessageItem
              key={`${msg.userName}-${msg.timestamp}-${i}`}
              message={{
                userId: msg.userId,
                avatarUrl: msg.avatarUrl,
                username: msg.userName,
                content: msg.message,
                timestamp: msg.timestamp,
              }}
            />
          ))
        )}
      </div>

      <ChatInputBar
        input={input}
        onInputChange={setInput}
        onSend={onSend}
        placeholder="Type a message..."
      />
    </div>
  );
}
