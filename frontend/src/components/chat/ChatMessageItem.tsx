import Avatar from "../shared/Avatar";

interface ChatDisplayMessage {
  userId?: string | number;
  avatarUrl?: string | null;
  username: string;
  content: string;
  timestamp: number;
}

interface ChatMessageItemProps<T extends ChatDisplayMessage> {
  message: T;
  replyMessage?: ChatDisplayMessage;
  onReply?: (message: T) => void;
}

function formatMessageTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessageItem<T extends ChatDisplayMessage>({
  message,
  replyMessage,
  onReply,
}: ChatMessageItemProps<T>) {
  return (
    <div className="group">
      <div className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
        <Avatar
          name={message.username}
          userId={message.userId}
          avatarUrl={message.avatarUrl}
          className="h-11 w-11 min-w-11 rounded-full border border-white/10 bg-black/15 object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex min-w-0 items-baseline gap-2">
            <h3 className="truncate text-base font-semibold text-cyan-200">
              {message.username}
            </h3>
            <span className="shrink-0 text-xs text-gray-500">
              {formatMessageTimestamp(message.timestamp)}
            </span>
          </div>

          {replyMessage ? (
            <div className="mb-2 flex items-center gap-2 overflow-hidden rounded-md border-l-2 border-cyan-400/40 bg-slate-800/60 px-3 py-2 text-xs text-gray-300">
              <span className="shrink-0 font-semibold text-cyan-200">
                Replying to {replyMessage.username}
              </span>
              <span className="truncate text-gray-400">
                {replyMessage.content}
              </span>
            </div>
          ) : null}

          <div className="rounded-md bg-slate-800 px-3 py-2.5 leading-7 text-white">
            {message.content}
          </div>

          {onReply ? (
            <div className="mt-1 flex gap-3 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                className="transition-colors hover:text-blue-400"
                onClick={() => onReply(message)}
              >
                Reply
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
