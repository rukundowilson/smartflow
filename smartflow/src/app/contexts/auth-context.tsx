"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  full_name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  roles?: any[]; // roles may be strings or objects with role_name/department_name
  selectedRole?: any; // selected role
  roleNames?: string[];
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  selectedRole: any | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSelectedRole: (role: any | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Synchronous hydration from localStorage to avoid blank identity on first paint
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem("token"); } catch { return null; }
  });
  const [selectedRole, setSelectedRole] = useState<any | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem("selectedRole");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  // Helper to normalize and sync from storage immediately
  const syncFromStorage = () => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUserRaw = localStorage.getItem("user");
      const storedSelectedRoleRaw = localStorage.getItem("selectedRole");
      if (!storedToken || !storedUserRaw) return;

      let userData: User = JSON.parse(storedUserRaw);

      // Decode JWT to backfill identity if needed (avoid throwing on malformed token)
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const json = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
          const claims = JSON.parse(json);
          userData = {
            ...userData,
            id: userData?.id ?? claims?.id,
            full_name: userData?.full_name || claims?.full_name || userData?.email?.split('@')[0] || 'User',
            email: userData?.email || claims?.email,
            department: userData?.department || claims?.department || 'Department',
            status: userData?.status || claims?.status || 'active',
          } as User;
        }
      } catch {}

      // Prefer stored selectedRole; otherwise, derive if there is exactly one role
      let selectedRoleLocal: any | null = null;
      if (storedSelectedRoleRaw) {
        selectedRoleLocal = JSON.parse(storedSelectedRoleRaw);
      } else if (Array.isArray(userData.roles) && userData.roles.length === 1) {
        const sole = userData.roles[0] as any;
        selectedRoleLocal = typeof sole === 'string' ? { role_name: sole, department_name: userData.department } : sole;
        localStorage.setItem("selectedRole", JSON.stringify(selectedRoleLocal));
      } else if (Array.isArray(userData.roleNames) && userData.roleNames.length === 1) {
        selectedRoleLocal = { role_name: userData.roleNames[0], department_name: userData.department };
        localStorage.setItem("selectedRole", JSON.stringify(selectedRoleLocal));
      }

      // If selectedRole exists, ensure user has explicit role/department
      if (selectedRoleLocal) {
        if (!userData.role || userData.role === 'User') {
          userData = { ...userData, role: selectedRoleLocal.role_name || userData.role };
        }
        if (!userData.department || userData.department === 'Department') {
          userData = { ...userData, department: selectedRoleLocal.department_name || userData.department };
        }
      }

      // Persist normalized user and update state
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(storedToken);
      setUser(userData);
      if (selectedRoleLocal) setSelectedRole(selectedRoleLocal);
    } catch {}
  };

  useEffect(() => {
    // Initial sync on mount
    syncFromStorage();

    // Listen to storage changes (e.g., login in another tab) and custom events
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token' || e.key === 'selectedRole') {
        syncFromStorage();
      }
    };
    const onAuthUpdated = () => syncFromStorage();

    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-updated', onAuthUpdated as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-updated', onAuthUpdated as EventListener);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");
    setToken(null);
    setUser(null);
    setSelectedRole(null);
    window.location.href = "/"
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    selectedRole,
    setUser,
    setToken,
    setSelectedRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
