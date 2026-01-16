export type FakeUser = {
  id: string;
  username: string;
};

// currently logged-in user
let currentUser: FakeUser | null = null;

// optional second user for testing multiplayer
let secondUser: FakeUser | null = null;

export function createFakeUsers() {
  currentUser = { id: "user-" + Math.random().toString(36).substring(2, 6), username: "Host" };
  secondUser = { id: "user-" + Math.random().toString(36).substring(2, 6), username: "Player" };
  return { currentUser, secondUser };
}

export function getCurrentUser() {
  return currentUser;
}

export function getSecondUser() {
  return secondUser;
}

export function logoutFake() {
  currentUser = null;
  secondUser = null;
}
