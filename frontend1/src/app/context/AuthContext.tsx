"use client";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
  password: string;
  setPassword: (password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [password, setPassword] = useState("");

  return (
    <AuthContext.Provider value={{ password, setPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
