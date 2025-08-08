"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  full_name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  roles?: string[]; // Add roles to the user type
  selectedRole?: any; // Add selected role
  // Add any other fields
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedSelectedRole = localStorage.getItem("selectedRole");

    if (storedToken && storedUser) {
      setToken(storedToken);
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // If user has a selected role stored, use it
      if (storedSelectedRole) {
        setSelectedRole(JSON.parse(storedSelectedRole));
      } else if (userData.selectedRole) {
        // If user has selectedRole in user data, use it
        setSelectedRole(userData.selectedRole);
      }
    }
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
