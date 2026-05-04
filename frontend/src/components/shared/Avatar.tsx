import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getMockAvatarSrc } from "../../types/mockPlayer";

type AvatarProps = {
  name: string;
  userId?: number | string;
  avatarUrl?: string | null;
  className?: string;
  alt?: string;
};

function getFallbackSeed(userId?: number | string, name?: string) {
  if (userId != null) {
    return `user-${userId}`;
  }

  return name?.trim() || "player";
}

export default function Avatar({
  name,
  userId,
  avatarUrl,
  className = "",
  alt,
}: AvatarProps) {
  const { user } = useAuth();
  const isCurrentUser =
    userId != null &&
    user?.id != null &&
    String(user.id) === String(userId);

  const preferredAvatarUrl =
    (isCurrentUser ? user?.avatarUrl : null) ?? avatarUrl ?? null;
  const fallbackSrc = useMemo(
    () => getMockAvatarSrc(getFallbackSeed(userId, name)),
    [userId, name],
  );
  const [didFailPreferred, setDidFailPreferred] = useState(false);

  return (
    <img
      src={!didFailPreferred && preferredAvatarUrl ? preferredAvatarUrl : fallbackSrc}
      alt={alt ?? `${name} avatar`}
      onError={() => {
        if (preferredAvatarUrl) {
          setDidFailPreferred(true);
        }
      }}
      className={className}
    />
  );
}
