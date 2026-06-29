import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { setToken, removeToken, getToken } from "@/lib/auth";

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const response = await apiClient.post("/auth/login", { username, password });
    const { user, token } = response.data.data;
    setToken(token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    removeToken();
    set({ user: null, token: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  initialize: () => {
    const token = getToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
