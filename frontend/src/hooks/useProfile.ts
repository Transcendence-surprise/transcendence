// src/hooks/useProfile.ts

import { useEffect, useState } from "react";
import { getUserBadges, type UserBadge } from "../api/badges";
import { getUserLatestGames, type LatestGames } from "../api/matches";
import { getUserRanking } from "../api/leaderboard";
import { useAuth } from "./useAuth";


export function useProfile() {
  const { user, refreshUser } = useAuth();
  const displayName = user?.username ?? "Player";
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const rankNumber = userRanking ?? user?.rankNumber ?? 0;
  const winStreak = user?.winStreak ?? 0;
  const totalGames = user?.totalGames ?? 0;
  const totalWins = user?.totalWins ?? 0;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [latestGames, setLatestGames] = useState<LatestGames[]>([]);
  const [latestGamesLoading, setLatestGamesLoading] = useState(false);
  const [latestGamesError, setLatestGamesError] = useState<string | null>(null);
  const userId = user?.id;
  const isGuest = !user || user.roles.includes("guest");

  useEffect(() => {
    if (isGuest) return;

    refreshUser().catch(() => {
      // Ignore transient refresh errors; UI can still render existing context state
    });

    const onFocus = () => {
      refreshUser().catch(() => {
        // Ignore transient refresh errors on focus refresh
      });
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isGuest, userId, refreshUser]);

  useEffect(() => {
    if (isGuest) return;

    const controller = new AbortController();

    const loadUserRanking = async () => {
      try {
        const ranking = await getUserRanking(controller.signal);
        setUserRanking(ranking);
      } catch (error) {
        if (controller.signal.aborted) return;
        setUserRanking(null);
      }
    };

    loadUserRanking();

    return () => controller.abort();
  }, [isGuest, userId]);

  useEffect(() => {
    if (isGuest) return;

    const controller = new AbortController();

    const loadBadges = async () => {
      try {
        setBadgesLoading(true);
        setBadgesError(null);
        const badges = await getUserBadges(controller.signal);
        setUserBadges(badges);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Failed to load badges";
        setBadgesError(message);
      } finally {
        if (!controller.signal.aborted) {
          setBadgesLoading(false);
        }
      }
    };

    loadBadges();

    return () => controller.abort();
  }, [isGuest, userId]);

  useEffect(() => {
    if (isGuest) return;

    const controller = new AbortController();

    const loadLatestGames = async () => {
      try {
        setLatestGamesLoading(true);
        setLatestGamesError(null);
        const games = await getUserLatestGames(controller.signal);
        setLatestGames(games ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Failed to load recent games";
        setLatestGamesError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLatestGamesLoading(false);
        }
      }
    };

    loadLatestGames();

    return () => controller.abort();
  }, [isGuest, userId]);


  return {
    displayName,
    userRanking: rankNumber,
    winStreak,
    totalGames,
    totalWins,
    winRate,
    userBadges,
    badgesLoading,
    badgesError,
    latestGames,
    latestGamesLoading,
    latestGamesError,
  };
}