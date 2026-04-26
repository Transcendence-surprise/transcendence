// src/api/friend.ts

import { rethrowAbortError } from "./requestUtils";

export interface FriendUser {
  id: number;
  username: string;
  avatarUrl?: string | null;
  isOnline: boolean;
}

export interface PendingFriendRequest {
	requesterId: number;
	receiverId: number;
	requestedBy: number;
	status: string;
	requester?: FriendUser;
	receiver?: FriendUser;
}

interface SearchableUser {
	id: number;
	username: string;
	roles?: string[];
}

interface FriendsResponse {
	friends: FriendUser[];
	pendingRequests: FriendUser[];
}

async function parseApiError(res: Response, fallback: string): Promise<Error> {
	try {
		const body = (await res.json()) as { message?: string | string[] };
		const message = Array.isArray(body?.message)
			? body.message.join(", ")
			: body?.message;

		return new Error(message || fallback);
	} catch {
		return new Error(fallback);
	}
}

async function requestJson<T>(
	path: string,
	init?: RequestInit,
	signal?: AbortSignal,
): Promise<T> {
	try {
		const res = await fetch(path, {
			credentials: "include",
			signal,
			...init,
			headers: {
				"Content-Type": "application/json",
				...(init?.headers ?? {}),
			},
		});

		if (!res.ok) {
			throw await parseApiError(res, `Request failed: ${res.status}`);
		}

		if (res.status === 204) {
			return undefined as T;
		}

		const raw = await res.text();
		if (!raw) {
			return undefined as T;
		}

		return JSON.parse(raw) as T;
	} catch (e: unknown) {
		rethrowAbortError(e);
	}
}

export async function getFriends(signal?: AbortSignal): Promise<FriendsResponse> {
	return requestJson<FriendsResponse>("/api/friends/snapshot", { method: "GET" }, signal);
}

export async function acceptFriendRequest(
	targetUserId: number,
	signal?: AbortSignal,
): Promise<void> {
	await requestJson<void>(
		"/api/friends/accept",
		{
			method: "POST",
			body: JSON.stringify({ targetUserId }),
		},
		signal,
	);
}

export async function rejectFriendRequest(
	targetUserId: number,
	signal?: AbortSignal,
): Promise<void> {
	await requestJson<void>(
		"/api/friends/reject",
		{
			method: "POST",
			body: JSON.stringify({ targetUserId }),
		},
		signal,
	);
}

export async function removeFriend(
	targetUserId: number,
	signal?: AbortSignal,
): Promise<void> {
	await requestJson<void>(
		"/api/friends",
		{
			method: "DELETE",
			body: JSON.stringify({ targetUserId }),
		},
		signal,
	);
}

export async function resolveUserIdByUsername(
	username: string,
	currentUserId?: number,
	signal?: AbortSignal,
): Promise<number> {
	const trimmed = username.trim();
	const users = await requestJson<SearchableUser[]>(
		"/api/users",
		{ method: "GET" },
		signal,
	);

	const matched = users.find((u) => u.username === trimmed);
	if (!matched) {
		throw new Error("User not found");
	}

	const isGuest = matched.roles?.includes("guest") ?? false;
	if (isGuest) {
		throw new Error("You can only add registered users");
	}

	if (currentUserId !== undefined && matched.id === currentUserId) {
		throw new Error("You cannot send a request to yourself");
	}

	return matched.id;
}

export async function sendFriendRequestByUsername(
	username: string,
	currentUserId?: number,
	signal?: AbortSignal,
): Promise<void> {
	const targetUserId = await resolveUserIdByUsername(
		username,
		currentUserId,
		signal,
	);

	await requestJson<void>(
		"/api/friends/request",
		{
			method: "POST",
			body: JSON.stringify({ targetUserId }),
		},
		signal,
	);
}

