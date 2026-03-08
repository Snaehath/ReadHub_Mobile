import { LoginResponse } from "../types/user";

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
