// src/hooks/useAvatar.ts

import { useEffect, useRef, useState } from "react";
import { uploadMyAvatar } from "../api/users";
import { useAuth } from "./useAuth";

const DEFAULT_AVATAR = "/assets/profile_icon.svg";

export function useAvatar(avatarUrlFromUser: string | null) {
  const { refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(0);

  const avatarSrcFromServer =
    avatarUrlFromUser && avatarTimestamp
      ? `${avatarUrlFromUser}?t=${avatarTimestamp}`
      : avatarUrlFromUser ?? null;

  const avatarSrc = avatarPreviewUrl ?? avatarSrcFromServer ?? DEFAULT_AVATAR;

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleAvatarSelect = (file: File | null) => {
    setAvatarError(null);

    // cleanup old preview
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }

    setAvatarFile(file);

    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatarPreviewUrl(preview);

    // auto upload
    void handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file?: File | null) => {
    const fileToUpload = file ?? avatarFile;
    if (!fileToUpload) return;

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      await uploadMyAvatar(fileToUpload);

      await refreshUser();

      // bust cache
      setAvatarTimestamp(Date.now());

      // cleanup preview
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      setAvatarPreviewUrl(null);
      setAvatarFile(null);
    } catch (error) {
      setAvatarError(
        error instanceof Error ? error.message : "Failed to upload avatar"
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const resetAvatar = () => {
    setAvatarError(null);

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarPreviewUrl(null);
    setAvatarFile(null);
  };

  return {
    // refs
    fileInputRef,

    // state
    avatarSrc,
    avatarUploading,
    avatarError,
    avatarPreviewUrl,

    // actions
    handleAvatarSelect,
    handleAvatarUpload,
    resetAvatar,

    // constants
    DEFAULT_AVATAR,
  };
}