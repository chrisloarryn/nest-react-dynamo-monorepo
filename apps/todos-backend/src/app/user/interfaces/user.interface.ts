export interface UserKey {
  id: string;
}

export interface User extends UserKey {
  fullName: string;
  email: string;
  avatarUrl: string;
}
