"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

type User = {
  id: string;
  email: string;
  has_completed_onboarding: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vfit_token");
    if (token) {
      api.get("/auth/me").then(setUser).catch(() => {
        localStorage.removeItem("vfit_token");
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const result = await api.post("/auth/login", { email, password });
    localStorage.setItem("vfit_token", result.access_token);
    const me = await api.get("/auth/me");
    setUser(me);
  }

  async function register(firstName: string, lastName: string, birthDate: string, email: string, password: string) {
    await api.post("/auth/register", { first_name: firstName, last_name: lastName, birth_date: birthDate, email, password });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem("vfit_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}