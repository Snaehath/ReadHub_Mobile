export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
