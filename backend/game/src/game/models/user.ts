export interface User {
  id: string;               // unique ID, JWT sub for logged-in, generated for guest
  username: string;         // visible name (nickname)
  roles: string[];          // e.g., ['player'], ['guest']
  isGuest?: boolean;        // optional flag for guest users
}
