export interface UserResponse {
  id: number;
  username: string | null;
  email: string | null;
  userType: 'registered' | 'visitor';
  createdAt: string;
  updatedAt: string;
}

export type UsersListResponse = UserResponse[];
