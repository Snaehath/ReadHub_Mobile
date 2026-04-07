export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  createdAt: string;
  role?: string;
  likes_us?: string[];
  likes_in?: string[];
  bookmarks_us?: string[];
  bookmarks_in?: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}
