import { createContext } from "react";
import type { User, UserCredential } from "firebase/auth";
import { useContext } from "react";


export interface AuthContextType {
  loading: boolean;
  user: User | null;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  signInUser: (email: string, password: string) => Promise<UserCredential>;
  signOutUser: () => Promise<void>;
  googleSign: () => Promise<UserCredential>;
  githubSign: () => Promise<UserCredential>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}