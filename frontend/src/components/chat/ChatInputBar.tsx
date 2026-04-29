import type { RefObject } from "react";

interface ReplyPreviewData {
  username: string;
  content: string;
}

interface ChatInputBarProps {
  input: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  replyTo?: ReplyPreviewData | null;
  onInputChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  onCancelReply?: () => void;
  placeholder?: string;
}

export default function ChatInputBar({
  input,
  inputRef,
  replyTo,
  onInputChange,
  onSend,
  onCancelReply,
  placeholder = "Write a message...",
}: ChatInputBarProps) {
  const canSend = input.trim().length > 0;

  return (
    <>
      {replyTo && onCancelReply ? (
        <div className="flex justify-between gap-2 bg-slate-800 px-4 py-2 text-sm">
          <span className="truncate">
            Replying to {replyTo.username}: {replyTo.content}
          </span>

          <button className="text-red-400" onClick={onCancelReply}>
            Cancel
          </button>
        </div>
      ) : null}

      <div className="flex gap-2 border-t border-slate-700 p-4">
        <input
          ref={inputRef}
          className="flex-1 rounded-md border border-transparent bg-slate-800 p-2 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-400/40"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={placeholder}
        />

        <button
          onClick={() => void onSend()}
          disabled={!canSend}
          className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-black transition-all hover:bg-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:bg-cyan-400/40 disabled:text-black/60 disabled:hover:shadow-none"
        >
          Send
        </button>
      </div>
    </>
  );
}
