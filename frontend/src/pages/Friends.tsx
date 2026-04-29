// src/pages/Friends.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusDot from "../components/shared/StatusDot";
import { useAuth } from "../hooks/useAuth";
import { useFriends } from "../hooks/useFriends";
import DeleteActionButton from "../components/shared/DeleteActionButton";

function getAvatarInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function Friends() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    friends,
    pendingRequests,
    loading,
    sendStatus,
    sendError,
    pageError,
    pendingActionError,
    removeFriendError,
    setSendError,
    setSendStatus,
    handleSendRequest,
    handleAccept,
    handleReject,
    handleRemove,
  } = useFriends();

  const [friendName, setFriendName] = useState("");

  if (!user || user.roles.includes("guest")) {
    return (
      <div>
        <h2>Login required</h2>
        <button onClick={() => navigate(-1)}>Back</button>
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
              void handleSendRequest(friendName);
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
                    <DeleteActionButton
                      ariaLabel={`Reject friend request from ${request.name}`}
                      onClick={() => void handleReject(request.targetUserId)}
                    />
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

                    <DeleteActionButton
                      ariaLabel={`Delete friend ${friend.name}`}
                      onClick={() => void handleRemove(friend.id)}
                    />
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
