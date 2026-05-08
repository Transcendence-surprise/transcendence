export interface PlayerProfile {
  avatar: string;
}

export function getMockAvatarSrc(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

// Mock data example
export const mockPlayerProfile: PlayerProfile = {
  avatar: getMockAvatarSrc("Felix"),
};