export interface User {
  id: number | string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
}

import { rethrowAbortError } from "./requestUtils";

export async function getAllUsers(signal?: AbortSignal): Promise<User[]> {
  try {
    const res = await fetch("/api/users/", { credentials: "include", signal });
    if (!res.ok) throw new Error("Not logged in");
    const users = await res.json();
    return users;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function toggleTwoFactorAuth(enabled: boolean, signal?: AbortSignal): Promise<User> {
  try {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ twoFactorEnabled: enabled }),
      signal,
    });
    if (!res.ok) throw new Error("Failed to update 2FA settings");

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    // If no JSON response, return a placeholder user object
    return {} as User;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function changePassword(
id: string | number, password: string,
signal?: AbortSignal,
): Promise<User> {
  try {
    const res = await fetch(`/api/users/me/password`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      signal,
    });
    if (!res.ok) throw new Error("Failed to change password");

    // Backend returns 204 NO_CONTENT, so just return a placeholder object
    // The password change was successful if we reach here
    return {} as User;
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

export async function deleteUser(id: number | string, signal?: AbortSignal) {
  const numId = typeof id === "string" ? Number(id) : id;
  if (isNaN(numId)) throw new Error("Invalid user id");

  try {
    const res = await fetch(`/api/users/id/${numId}`, {
      method: "DELETE",
      headers: { accept: "*/*" },
      credentials: "include",
      signal,
    });
    if (!res.ok) throw new Error("Failed to delete user");
  } catch (e: any) {
    rethrowAbortError(e);
  }
}

// Admin: Set 2FA for any user
export async function setUserTwoFactor(
  id: number | string,
  enabled: boolean,
  signal?: AbortSignal,
): Promise<User> {
  const numId = typeof id === "string" ? Number(id) : id;
  if (isNaN(numId)) throw new Error("Invalid user id");

  try {
    const res = await fetch(`/api/users/id/${numId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ twoFactorEnabled: enabled }),
      credentials: "include",
      signal,
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Too many requests. Please try again in a moment.");
      }
      throw new Error("Failed to update 2FA for user");
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }

    return { id: numId, twoFactorEnabled: enabled } as User;
  } catch (e: any) {
    rethrowAbortError(e);
    throw e;
  }
}

export async function uploadMyAvatar(
  file: File,
  signal?: AbortSignal,
): Promise<User> {
  if (!file) throw new Error("Missing file");

  if (!file.type.startsWith("image/")) {
    throw new Error("Avatar must be an image");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Avatar must be <= 5MB");
  }

  const form = new FormData();
  form.append("file", file);

  // console.log("About to send avatar upload request", {
  //   name: file.name,
  //   type: file.type,
  //   size: file.size,
  // });

  try {
    const res = await fetch("/api/users/me/avatar", {
      method: "POST",
      credentials: "include",
      body: form,
      signal,
    });

    // console.log("Avatar upload response status:", res.status);
    // console.log("Avatar upload response ok:", res.ok);
    // console.log("Avatar upload response content-type:", res.headers.get("content-type"));

    if (!res.ok) {
      let message = "Failed to upload avatar";
      try {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          // console.log("Avatar upload error JSON:", data);
          message = data?.message || message;
        } else {
          const text = await res.text();
          // console.log("Avatar upload error text:", text);
          if (text) message = text;
        }
      } catch (parseError) {
        // console.error("Failed to parse error response:", parseError);
      }
      throw new Error(message);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      // console.log("Avatar upload success JSON:", data);
      return data;
    }

    // console.log("Avatar upload success but no JSON body returned");
    throw new Error(
      `Unexpected avatar upload response content-type: ${contentType ?? "missing"}`,
    );
  } catch (e: unknown) {
    // console.error("uploadMyAvatar caught error:", e);
    rethrowAbortError(e);
    throw e;
  }
}