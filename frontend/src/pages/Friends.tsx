import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusDot from "../components/shared/StatusDot";
import { useAuth } from "../hooks/useAuth";
import { connectRealtimeSocket, getRealtimeSocket } from "../services/realtimeSocket";
import {
  acceptFriendRequest,
  getFriends,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequestByUsername,
  type FriendUser,
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

function getAvatarInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function mapFriend(friend: FriendUser & { isOnline: boolean }): UiFriend {
  return {
    id: friend.id,
    name: friend.username,
    avatarUrl: friend.avatarUrl ?? null,
    online: friend.isOnline,
  };
}

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<UiFriend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UiPendingRequest[]>([]);

  const [loading, setLoading] = useState(false);

  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pendingActionError, setPendingActionError] = useState<string | null>(null);
  const [removeFriendError, setRemoveFriendError] = useState<string | null>(null);

  const isLoadingRef = useRef(false);
  const reloadLockRef = useRef(false);

  const friendIds = useMemo(() => friends.map((f) => f.id), [friends]);
  const friendIdsKey = useMemo(
    () => friendIds.slice().sort((a, b) => a - b).join(","),
    [friendIds],
  );

  const loadData = useCallback(async () => {
    if (!user || user.roles.includes("guest")) return;
    if (isLoadingRef.current) return;

    setPageError(null);

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const snapshot = await getFriends();

      setFriends(snapshot.friends.map(mapFriend));

      setPendingRequests(
        snapshot.pendingRequests.map((u) => ({
          id: u.id,
          targetUserId: u.id,
          name: u.username,
          avatarUrl: u.avatarUrl ?? null,
        })),
      );
    } catch (e) {
      setPageError("Failed to load friends");
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user || user.roles.includes("guest")) return;

    const socket = getRealtimeSocket() ?? connectRealtimeSocket();

    const onPresenceUpdate = ({ userId, isOnline }: PresenceUpdatePayload) => {
      setFriends((prev) =>
        prev.map((f) =>
          f.id === userId ? { ...f, online: isOnline } : f
        )
      );
    };

    const onFriendsUpdate = () => {
      if (reloadLockRef.current) return;

      reloadLockRef.current = true;

      setTimeout(async () => {
        await loadData();
        reloadLockRef.current = false;
      }, 200);
    };

    socket.on("presence:update", onPresenceUpdate);
    socket.on("friends:update", onFriendsUpdate);

    return () => {
      socket.off("presence:update", onPresenceUpdate);
      socket.off("friends:update", onFriendsUpdate);
    };
  }, [user, loadData]);

  useEffect(() => {
    if (!user || user.roles.includes("guest")) return;

    const socket = getRealtimeSocket() ?? connectRealtimeSocket();

    const subscribe = () => {
      socket.emit("presence:subscribe", { userIds: friendIds });
    };

    if (socket.connected) subscribe();

    socket.on("connect", subscribe);

    return () => {
      socket.off("connect", subscribe);
      socket.emit("presence:unsubscribe", { userIds: friendIds });
    };
  }, [friendIdsKey, user]);

  const handleSendRequest = async () => {
      const name = friendName.trim();
      if (!name) return;

    setSendError(null);
    setSendStatus(null);
    setPageError(null);

      try {
        await sendFriendRequestByUsername(name);
        setFriendName("");
        setSendStatus(`Friend request sent to ${name}`);
      } catch (e) {
        setSendError("Failed to send friend request");
      }
    };

    const handleAccept = async (id: number) => {
      setPendingActionError(null);
      setPageError(null);
      try {
        await acceptFriendRequest(id);
        await loadData();
      } catch (e) {
        setPendingActionError("Failed to accept friend request");
      }
    };

    const handleReject = async (id: number) => {
      setPendingActionError(null);
      setPageError(null);
      try {
        await rejectFriendRequest(id);
        await loadData();
      } catch (e) {
        setPendingActionError("Failed to reject friend request");
      }
    };

    const handleRemove = async (id: number) => {
      setRemoveFriendError(null);
      setPageError(null);
      try {
        await removeFriend(id);
        await loadData();
      } catch (e) {
        setRemoveFriendError("Failed to remove friend");
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

      {/* ADD FRIEND */}
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
              onChange={(event) => {
                setFriendName(event.target.value)
                setSendError(null);
                setSendStatus(null);
              }
            }
              placeholder="Enter username"
              className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-black/30 px-4 py-2 text-white outline-none transition focus:border-cyan-bright"
            />
            <button type="submit">Send</button>
          </form>

          {sendStatus ? (
            <p className="mt-3 text-sm text-cyan-300">
              {sendStatus}
            </p>
          ) : null}

          {sendError ? (
            <p className="mt-3 text-sm text-red-300">
              {sendError}
            </p>
          ) : null}
        </section>

        {/* PENDING */}
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
                        void handleAccept(request.targetUserId)
                      }
                      className="rounded-md bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-300 transition hover:bg-green-500/30"
                    >
                      ✔️
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleReject(request.targetUserId)
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
                      onClick={() => void handleRemove(friend.id)}
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
