import { LoginResponse, User } from "../types/user";

const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://readhub-backend.onrender.com/api";

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${baseUrl}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};

export const Register = async (
  email: string,
  username: string,
  avatar: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${baseUrl}/user/addUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, username, avatar }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Registration service error:", error);
    throw error;
  }
};

export const updateProfile = async (
  userId: string,
  username: string,
  avatar: string,
  token: string,
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${baseUrl}/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, username, avatar }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Update profile service error:", error);
    throw error;
  }
};

export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await fetch(`${baseUrl}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch user");

    return data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

export const resetPassword = async (
  email: string,
  newPassword: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}/user/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });
    return response.ok;
  } catch (error) {
    console.error("Reset password error:", error);
    return false;
  }
};

export const toggleLike = async (
  newsId: string,
  country: "us" | "in",
  token: string,
): Promise<string[]> => {
  try {
    const response = await fetch(`${baseUrl}/user/like-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newsId, country }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to toggle like");
    return data.likes;
  } catch (error) {
    console.error("Toggle like error:", error);
    throw error;
  }
};

export const toggleBookmark = async (
  newsId: string,
  country: "us" | "in",
  token: string,
): Promise<string[]> => {
  try {
    const response = await fetch(`${baseUrl}/user/bookmark-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newsId, country }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to toggle bookmark");
    return data.bookmarks;
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    throw error;
  }
};
