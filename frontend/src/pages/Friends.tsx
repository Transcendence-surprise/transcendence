import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusDot from "../components/UI/StatusDot";
import { useAuth } from "../hooks/useAuth";
import { connectRealtimeSocket, getRealtimeSocket } from "../services/realtimeSocket";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequestByUsername,
  type FriendUser,
  type PendingFriendRequest,
} from "../api/friend";

type UiPendingRequest = {
  id: number;
  targetUserId: number;
  name: string;
  avatarUrl: string | null;
};

type UiFriend = {
  id: number;
  name: string;
  avatarUrl: string | null;
  online: boolean;
};

type PresenceUpdatePayload = {
  userId: number;
  isOnline: boolean;
};

type PresenceSnapshotPayload = {
  statuses: PresenceUpdatePayload[];
};

function getAvatarInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function mapPendingRequest(request: PendingFriendRequest): UiPendingRequest | null {
  const requesterId = request.requester?.id ?? request.requestedBy;
  const requesterName = request.requester?.username;

  if (!requesterId || !requesterName) {
    return null;
  }

  return {
    id: requesterId,
    targetUserId: requesterId,
    name: requesterName,
    avatarUrl: request.requester?.avatarUrl ?? null,
  };
}

function mapFriend(friend: FriendUser): UiFriend {
  return {
    id: friend.id,
    name: friend.username,
    avatarUrl: friend.avatarUrl ?? null,
    online: false,
  };
}

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friendName, setFriendName] = useState("");
  const [lastSentRequest, setLastSentRequest] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [sendRequestError, setSendRequestError] = useState<string | null>(null);
  const [pendingActionError, setPendingActionError] = useState<string | null>(null);
  const [removeFriendError, setRemoveFriendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<UiPendingRequest[]>([]);
  const [friends, setFriends] = useState<UiFriend[]>([]);
  const isLoadingRef = useRef(false);
  const nextAllowedRefreshAtRef = useRef(0);

  const friendIds = useMemo(() => friends.map((friend) => friend.id), [friends]);
  const friendIdsKey = useMemo(
    () => [...friendIds].sort((a, b) => a - b).join(","),
    [friendIds],
  );

  const currentUserId = useMemo(() => {
    if (!user || typeof user.id !== "number") return undefined;
    return user.id;
  }, [user]);

  const loadData = useCallback(async (options?: { force?: boolean }) => {
    if (!user || user.roles.includes("guest")) return;

    const now = Date.now();
    const force = options?.force === true;

    if (isLoadingRef.current) {
      return;
    }

    if (!force && now < nextAllowedRefreshAtRef.current) {
      return;
    }

    isLoadingRef.current = true;

    setLoading(true);
    setPageError(null);

    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);

      setFriends((prev) => {
        const previousStatus = new Map(prev.map((friend) => [friend.id, friend.online]));

        return friendsData.map((friend) => ({
          ...mapFriend(friend),
          online: previousStatus.get(friend.id) ?? false,
        }));
      });
      setPendingRequests(
        pendingData
          .map(mapPendingRequest)
          .filter((request): request is UiPendingRequest => request !== null),
      );
      nextAllowedRefreshAtRef.current = Date.now() + 1000;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to load friends data";
      setPageError(message);

      if (message.includes("429") || message.toLowerCase().includes("too many requests")) {
        nextAllowedRefreshAtRef.current = Date.now() + 5000;
      } else {
        nextAllowedRefreshAtRef.current = Date.now() + 1500;
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData({ force: true });
  }, [loadData]);

  useEffect(() => {
    if (!user || user.roles.includes("guest")) return;

    const socket = getRealtimeSocket() ?? connectRealtimeSocket();

    const applyPresenceUpdate = ({ userId, isOnline }: PresenceUpdatePayload) => {
      setFriends((prev) =>
        prev.map((friend) =>
          friend.id === userId ? { ...friend, online: isOnline } : friend,
        ),
      );
    };

    const applyPresenceSnapshot = ({ statuses }: PresenceSnapshotPayload) => {
      const presenceById = new Map(statuses.map((status) => [status.userId, status.isOnline]));

      setFriends((prev) =>
        prev.map((friend) =>
          presenceById.has(friend.id)
            ? { ...friend, online: Boolean(presenceById.get(friend.id)) }
            : friend,
        ),
      );
    };

    const handleFriendsUpdate = () => {
      void loadData({ force: true });
    };

    socket.on("presence:update", applyPresenceUpdate);
    socket.on("presence:snapshot", applyPresenceSnapshot);
    socket.on("friends:update", handleFriendsUpdate);

    return () => {
      socket.off("presence:update", applyPresenceUpdate);
      socket.off("presence:snapshot", applyPresenceSnapshot);
      socket.off("friends:update", handleFriendsUpdate);
    };
  }, [user, loadData]);

  useEffect(() => {
    if (!user || user.roles.includes("guest")) return;

    const socket = getRealtimeSocket() ?? connectRealtimeSocket();
    const ids = friendIds;

    if (ids.length === 0) return;

    const subscribeToPresence = () => {
      socket.emit("presence:subscribe", { userIds: ids });
    };

    if (socket.connected) {
      subscribeToPresence();
    }

    socket.on("connect", subscribeToPresence);

    return () => {
      socket.off("connect", subscribeToPresence);
      socket.emit("presence:unsubscribe", { userIds: ids });
    };
  }, [user, friendIdsKey]);

  const handleSendRequest = async () => {
    const trimmedName = friendName.trim();
    if (!trimmedName) return;

    setSendingRequest(true);
    setSendRequestError(null);

    try {
      await sendFriendRequestByUsername(trimmedName, currentUserId);
      setLastSentRequest(trimmedName);
      setFriendName("");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to send friend request";
      setSendRequestError(message);
    } finally {
      setSendingRequest(false);
    }
  };

  const handlePendingRequest = async (
    targetUserId: number,
    action: "accept" | "reject",
  ) => {
    setPendingActionError(null);

    try {
      if (action === "accept") {
        await acceptFriendRequest(targetUserId);
      } else {
        await rejectFriendRequest(targetUserId);
      }

      setPendingRequests((prev) =>
        prev.filter((request) => request.targetUserId !== targetUserId),
      );

      if (action === "accept") {
        await loadData();
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to update request";
      setPendingActionError(message);
    }
  };

  const handleRemoveFriend = async (targetUserId: number) => {
    setRemoveFriendError(null);

    try {
      await removeFriend(targetUserId);
      setFriends((prev) => prev.filter((friend) => friend.id !== targetUserId));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to remove friend";
      setRemoveFriendError(message);
    }
  };

  if (!user || user.roles.includes("guest")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Login required to access friends
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="py-3 px-6 rounded-lg font-medium text-white bg-bg-dark-tertiary border border-[var(--color-border-subtle)] hover:shadow-cyan-light hover:border-cyan-bright transition-all"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-h-[60vh] px-4 py-8">
      <h2 className="mb-8 text-4xl font-bold text-white">Friends</h2>

      <div className="space-y-6">
        <section className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal p-5">
          <h3 className="text-xl font-semibold text-white">Add Friend</h3>
          <p className="mt-1 text-sm text-gray-400">
            Enter a username and send a friend request.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSendRequest();
            }}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={friendName}
              onChange={(event) => setFriendName(event.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-black/30 px-4 py-2 text-white outline-none transition focus:border-cyan-bright"
            />
            <button
              type="submit"
              disabled={!friendName.trim() || sendingRequest}
              className="rounded-lg bg-gradient-to-r from-cyan-bright to-blue-hero px-5 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingRequest ? "Sending..." : "Send"}
            </button>
          </form>

          {lastSentRequest ? (
            <p className="mt-3 text-sm text-cyan-300">
              Friend request sent to {lastSentRequest}.
            </p>
          ) : null}

          {sendRequestError ? (
            <p className="mt-3 text-sm text-red-300">{sendRequestError}</p>
          ) : null}
        </section>

        <section className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal p-5">
          <h3 className="text-xl font-semibold text-white">Pending Requests</h3>

          {loading ? (
            <p className="mt-3 text-sm text-gray-400">Loading pending requests...</p>
          ) : null}

          {pageError ? (
            <p className="mt-3 text-sm text-red-300">{pageError}</p>
          ) : null}

          {pendingActionError ? (
            <p className="mt-3 text-sm text-red-300">{pendingActionError}</p>
          ) : null}

          <div className="mt-4 divide-y divide-[var(--color-border-gray)]">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {request.avatarUrl ? (
                      <img
                        src={request.avatarUrl}
                        alt={request.name}
                        className="h-10 w-10 rounded-full border border-[var(--color-border-subtle)] object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-black/40 text-sm font-semibold text-cyan-200">
                        {getAvatarInitial(request.name)}
                      </div>
                    )}
                    <span className="font-medium text-white">
                      {request.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handlePendingRequest(request.targetUserId, "accept")
                      }
                      className="rounded-md bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-300 transition hover:bg-green-500/30"
                    >
                      ✔️
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handlePendingRequest(request.targetUserId, "reject")
                      }
                      className="rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
                    >
                      ✖️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm text-gray-400">No pending requests.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal p-5">
          <h3 className="text-xl font-semibold text-white">Friend List</h3>

          {loading ? (
            <p className="mt-3 text-sm text-gray-400">Loading friends...</p>
          ) : null}

          {pageError ? (
            <p className="mt-3 text-sm text-red-300">{pageError}</p>
          ) : null}

          {removeFriendError ? (
            <p className="mt-3 text-sm text-red-300">{removeFriendError}</p>
          ) : null}

          <div className="mt-4 divide-y divide-[var(--color-border-gray)]">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="h-10 w-10 rounded-full border border-[var(--color-border-subtle)] object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-black/40 text-sm font-semibold text-cyan-200">
                        {getAvatarInitial(friend.name)}
                      </div>
                    )}
                    <span className="font-medium text-white">{friend.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <StatusDot
                        active={friend.online}
                        className="h-2.5 w-2.5"
                        activeClassName="bg-green-400"
                        inactiveClassName="bg-gray-500"
                      />
                      <span
                        className={`text-sm ${
                          friend.online ? "text-green-300" : "text-gray-400"
                        }`}
                      >
                        {friend.online ? "Online" : "Offline"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleRemoveFriend(friend.id)}
                      className="rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm text-gray-400">No friends yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
