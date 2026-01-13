export function generateTempUserId() {
  return "user-" + Math.random().toString(36).substring(2, 8);
}
