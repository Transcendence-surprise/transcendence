interface ChatDisplayMessage {
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

function getAvatarGradient(username: string) {
const gradients = [
  "from-cyan-400 via-cyan-500 to-fuchsia-700/70",
  "from-fuchsia-400 via-pink-500 to-fuchsia-700/70",
  "from-yellow-300 via-amber-500 to-fuchsia-700/70",
  "from-violet-400 via-indigo-500 to-fuchsia-700/70",
  "from-rose-400 via-orange-500 to-fuchsia-700/70",
  "from-cyan-400 via-blue-500 to-fuchsia-700/70",
  "from-purple-400 via-fuchsia-500 to-fuchsia-700/70",
  "from-sky-400 via-indigo-600 to-fuchsia-700/70",
];

  const seed = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return gradients[seed % gradients.length];
}

export default function ChatMessageItem<T extends ChatDisplayMessage>({
  message,
  replyMessage,
  onReply,
}: ChatMessageItemProps<T>) {
  const fallbackInitial = message.username.trim().charAt(0).toUpperCase() || "?";
  const avatarGradient = getAvatarGradient(message.username);

  return (
    <div className="group">
      <div className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
        <div
          className={`flex h-11 w-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${avatarGradient} text-sm font-semibold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
        >
          {fallbackInitial}
        </div>

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
