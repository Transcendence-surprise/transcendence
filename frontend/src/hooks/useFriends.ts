// src/hooks/useFriends.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRealtimeSocket } from "../services/realtimeSocket";
import {
  acceptFriendRequest,
  getFriends,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequestByUsername,
  type FriendUser,
} from "../api/friend";
import { useAuth } from "./useAuth";

export type UiPendingRequest = {
  id: number;
  targetUserId: number;
  name: string;
  avatarUrl: string | null;
};

export type UiFriend = {
  id: number;
  name: string;
  avatarUrl: string | null;
  online: boolean;
};

type PresenceUpdatePayload = {
  userId: number;
  isOnline: boolean;
};

function mapFriend(friend: FriendUser & { isOnline: boolean }): UiFriend {
  return {
    id: friend.id,
    name: friend.username,
    avatarUrl: friend.avatarUrl ?? null,
    online: friend.isOnline,
  };
}

export function useFriends() {
  const { user } = useAuth();

  const [friends, setFriends] = useState<UiFriend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UiPendingRequest[]>([]);

  const [loading, setLoading] = useState(false);

  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pendingActionError, setPendingActionError] = useState<string | null>(null);
  const [removeFriendError, setRemoveFriendError] = useState<string | null>(null);

  const isLoadingRef = useRef(false);
  const friendIdsRef = useRef<number[]>([]);

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

    const socket = getRealtimeSocket();
    if (!socket) return;

    const subscribe = () => {
      socket.emit("presence:subscribe", { userIds: friendIds });
    };

    if (socket.connected) subscribe();
    socket.on("connect", subscribe);

    return () => {
      socket.off("connect", subscribe);

      socket.emit("presence:unsubscribe", {
        userIds: friendIdsRef.current,
      });
    };
  }, [friendIdsKey, user]);

  useEffect(() => {
    if (!user || user.roles.includes("guest")) return;

    const socket = getRealtimeSocket();

    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

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

  const handleSendRequest = async (friendName: string): Promise<boolean> => {
    const name = friendName.trim();
    if (!name) return false;

    setSendError(null);
    setSendStatus(null);

    try {
      await sendFriendRequestByUsername(name);
      setSendStatus(`Friend request sent to ${name}`);
      return true;
    } catch {
      setSendError("Failed to send friend request");
      return false;
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

  return {
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
  };
}