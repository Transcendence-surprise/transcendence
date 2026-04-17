import { FormEvent, useMemo, useState } from "react";
import StatusDot from "../components/UI/StatusDot";
import { mockLeaderboard } from "../types/mockPlayer";

export default function Friends() {
  const [friendName, setFriendName] = useState("");
  const [lastSentRequest, setLastSentRequest] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(() =>
    mockLeaderboard.slice(2, 5).map((player) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
    })),
  );

  const friends = useMemo(
    () =>
      mockLeaderboard.slice(0, 8).map((player, index) => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        online: index % 3 !== 0,
      })),
    [],
  );

  const handleSendRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = friendName.trim();
    if (!trimmedName) return;

    setLastSentRequest(trimmedName);
    setFriendName("");
  };

  const handlePendingRequest = (requestId: string) => {
    setPendingRequests((prev) =>
      prev.filter((request) => request.id !== requestId),
    );
  };

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
            onSubmit={handleSendRequest}
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
              disabled={!friendName.trim()}
              className="rounded-lg bg-gradient-to-r from-cyan-bright to-blue-hero px-5 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>

          {lastSentRequest ? (
            <p className="mt-3 text-sm text-cyan-300">
              Friend request sent to {lastSentRequest}.
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-[var(--color-border-subtle)] bg-bg-modal p-5">
          <h3 className="text-xl font-semibold text-white">Pending Requests</h3>
          <p className="mt-1 text-sm text-gray-400">
            Players who are trying to add you.
          </p>

          <div className="mt-4 divide-y divide-[var(--color-border-gray)]">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={request.avatar}
                      alt={request.name}
                      className="h-10 w-10 rounded-full border border-[var(--color-border-subtle)] object-cover"
                    />
                    <span className="font-medium text-white">
                      {request.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePendingRequest(request.id)}
                      className="rounded-md bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-300 transition hover:bg-green-500/30"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePendingRequest(request.id)}
                      className="rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
                    >
                      Decline
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
          <p className="mt-1 text-sm text-gray-400">Mock friend data</p>

          <div className="mt-4 divide-y divide-[var(--color-border-gray)]">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="h-10 w-10 rounded-full border border-[var(--color-border-subtle)] object-cover"
                  />
                  <span className="font-medium text-white">{friend.name}</span>
                </div>

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
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
