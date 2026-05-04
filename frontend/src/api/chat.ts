// src/api/chat.ts

import { rethrowAbortError } from "./requestUtils";

export interface ChatMessage {
  id: string;
  userId: number | string;
  username: string;
  avatarUrl?: string | null;
  content: string;
  timestamp: number;
  replyTo?: string;
}

export type AddMessageResult =
  | { ok: true; message: ChatMessage }
  | { ok: false; error: string };


export async function getChatHistory(signal?: AbortSignal) {
  try {
    const res = await fetch('/api/chat/history', {
      method: 'GET',
      credentials: 'include',
      signal,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to load chat history');
    }

    return data;
  } catch (e: any) {
    if (e.name === 'AbortError') return;

    throw e;
  }
}


export async function sendChatMessage(
  body: { content: string; replyTo?: string },
  signal?: AbortSignal
): Promise<AddMessageResult> {
  console.log("Sending message", body);
  try {
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal,
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || "Failed to send message");
    }

    return data;
  } catch (e: any) {
    return rethrowAbortError(e);
  }
}
