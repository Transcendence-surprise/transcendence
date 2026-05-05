import { useEffect, useRef } from "react";
import { getAllUsers } from "../api/users";

export function useUsersMap(user: any) {
  const userByIdRef = useRef(new Map());
  const userByUsernameRef = useRef(new Map());

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    getAllUsers(controller.signal)
      .then((allUsers) => {
        userByIdRef.current = new Map(
          allUsers.map((u) => [
            String(u.id),
            { avatarUrl: u.avatarUrl ?? null },
          ]),
        );

        userByUsernameRef.current = new Map(
          allUsers.map((u) => [
            u.username,
            {
              id: String(u.id),
              avatarUrl: u.avatarUrl ?? null,
            },
          ]),
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
    userById: userByIdRef.current,
    userByUsername: userByUsernameRef.current,
  };
}