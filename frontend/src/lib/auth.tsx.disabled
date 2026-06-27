"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type AuthResponse, type AuthUser } from "./api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<AuthUser>;
  logout: () => void;
}

const STORAGE_KEY = "cgpa.auth";
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthResponse;
        setToken(parsed.accessToken);
        setUser(parsed.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      persist(await api.login({ email, password })),
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string) =>
      persist(await api.register({ email, password, fullName })),
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
