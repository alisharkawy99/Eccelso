"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

export interface AuthUser {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const token = Cookies.get("authToken");
  const userString = sessionStorage.getItem("user");
  if (!token || !userString) return null;

  try {
    return JSON.parse(userString) as AuthUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    refresh();

    const handleAuthChange = () => refresh();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [refresh]);

  const isAdmin = user?.role === "Admin";

  return { user, isAdmin, isAuthenticated: !!user };
}

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-change"));
  }
}
