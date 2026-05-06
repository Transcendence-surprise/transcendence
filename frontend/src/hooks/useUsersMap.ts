import { useEffect, useState } from "react";
import { getAllUsers } from "../api/users";

export function useUsersMap(user: any) {
  const [userById, setUserById] = useState<
    Map<string, { avatarUrl: string | null }>
  >(new Map());
  const [userByUsername, setUserByUsername] = useState<
    Map<string, { id: string; avatarUrl: string | null }>
  >(new Map());

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    getAllUsers(controller.signal)
      .then((allUsers) => {
        setUserById(
          new Map(
          allUsers.map((u) => [
            String(u.id),
            { avatarUrl: u.avatarUrl ?? null },
          ]),
          ),
        );

        setUserByUsername(
          new Map(
          allUsers.map((u) => [
            u.username,
            {
              id: String(u.id),
              avatarUrl: u.avatarUrl ?? null,
            },
          ]),
          ),
        );
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [user]);

  return {
    userById,
    userByUsername,
  };
}